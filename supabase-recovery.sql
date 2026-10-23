-- =====================================================================
-- Supabase recovery / diagnosis — run in the Supabase SQL Editor
--
-- Why: after ~3 months idle, every authenticated request against this
-- project takes 3-11s, and concurrent requests collapse into 20-40s
-- responses, 500s and outright timeouts. Measured 2026-10-23:
--
--   unauthenticated (rejected at the edge)   0.45s
--   GET /auth/v1/health            (anon)    5.3s
--   GET /rest/v1/profiles?limit=1  (anon)    3.1 - 11.3s
--   GET /rest/v1/profiles?limit=1  (service) 5.1s   <- RLS is NOT the cause
--   GET /rest/v1/jobs?limit=1      (concur.) 38s then HTTP 500
--   GET /rest/v1/responses?limit=1 (concur.) timed out at 40s
--
-- service_role is just as slow as anon, so this is not RLS and not a
-- missing index on a filter — a bare `limit 1` should never cost 5s.
-- That points at the instance itself: stale planner statistics plus
-- table/index bloat after a long idle period, on undersized compute.
--
-- Run section 1 first and read the numbers before changing anything.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. DIAGNOSIS — read these before running anything below
-- ---------------------------------------------------------------------

-- 1a. Is anything blocking / stuck? Long-running queries hold connections
--     open and are a common cause of "everything is slow after idle".
select pid, state, wait_event_type, wait_event,
       now() - query_start as running_for,
       left(query, 120) as query
from pg_stat_activity
where state <> 'idle'
  and pid <> pg_backend_pid()
order by query_start;

-- 1b. Connection usage vs the limit. If used is near max, PostgREST
--     requests queue, which is what turns 5s into 40s under concurrency.
select (select count(*) from pg_stat_activity) as used,
       current_setting('max_connections')      as max_connections;

-- 1c. Dead-tuple bloat and when autovacuum/analyze last ran.
--     A high n_dead_tup with an old last_autovacuum means the planner is
--     working from stale statistics and scanning dead rows.
select relname,
       n_live_tup,
       n_dead_tup,
       case when n_live_tup > 0
            then round(100.0 * n_dead_tup / n_live_tup, 1) end as dead_pct,
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
from pg_stat_user_tables
order by n_dead_tup desc
limit 25;

-- 1d. Table + index sizes, to spot bloat and runaway tables.
select relname,
       pg_size_pretty(pg_total_relation_size(relid)) as total,
       pg_size_pretty(pg_relation_size(relid))       as table_only,
       pg_size_pretty(pg_indexes_size(relid))        as indexes
from pg_catalog.pg_statio_user_tables
order by pg_total_relation_size(relid) desc
limit 25;

-- 1e. Confirm the cost of the exact query the app runs on every page load.
--     If this reports a few milliseconds of planning/execution while the
--     HTTP request still takes seconds, the time is being lost outside
--     Postgres (compute starvation / connection queueing) and the fix is
--     a project restart or a compute upgrade, not SQL.
explain (analyze, buffers)
select role from public.profiles
where id = '00000000-0000-0000-0000-000000000000';


-- ---------------------------------------------------------------------
-- 2. RECLAIM + REFRESH STATISTICS
--    Safe to run on a live database: VACUUM (not FULL) takes no
--    exclusive lock. Run this before considering a compute upgrade.
-- ---------------------------------------------------------------------

vacuum (analyze, verbose) public.profiles;
vacuum (analyze, verbose) public.jobs;
vacuum (analyze, verbose) public.responses;
vacuum (analyze, verbose) public.subscriptions;

-- Everything else, in one pass.
vacuum analyze;


-- ---------------------------------------------------------------------
-- 3. INDEXES
--    supabase-performance-indexes.sql was committed but there is no
--    record of it being applied. These are idempotent; re-running is
--    free. CONCURRENTLY avoids locking writes — run each statement on
--    its own, since CREATE INDEX CONCURRENTLY cannot run inside a
--    transaction block.
-- ---------------------------------------------------------------------

create index concurrently if not exists idx_rankings_sighire_profile_id_created
  on public.rankings_sighire (profile_id, created_at desc);

create index concurrently if not exists idx_jobs_form_id
  on public.jobs (form_id);

create index concurrently if not exists idx_assignments_job_id_candidate
  on public.assignments (job_id, candidate_id);

-- The app filters responses by these on every evaluation run.
create index concurrently if not exists idx_responses_form_id
  on public.responses (form_id);

create index concurrently if not exists idx_responses_job_id_profile_id
  on public.responses (job_id, profile_id);

-- Middleware looks up profiles.role by id on every protected request.
-- id is the primary key, so that lookup is already covered by the PK
-- index — noted here only so the hot path is documented.

analyze public.rankings_sighire;
analyze public.jobs;
analyze public.assignments;
analyze public.responses;


-- ---------------------------------------------------------------------
-- 4. REMOVE THE ROLE LOOKUP FROM THE HOT PATH (optional, recommended)
--    Middleware currently does getUser() + a profiles lookup on every
--    protected request — two network round trips before the page starts
--    rendering. Publishing `role` as a JWT claim removes the second one
--    entirely. Create this, then register it under
--    Authentication -> Hooks -> Custom Access Token.
-- ---------------------------------------------------------------------

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  claims    jsonb;
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := coalesce(event->'claims', '{}'::jsonb);

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$function$;

grant execute on function public.custom_access_token_hook(jsonb)
  to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb)
  from authenticated, anon, public;


-- ---------------------------------------------------------------------
-- 5. IF SECTIONS 2-3 DO NOT FIX IT
--    Section 1e tells you which way to go:
--
--    * EXPLAIN is fast (milliseconds) but HTTP is still seconds
--        -> the database is fine and compute is the bottleneck. In the
--           dashboard: Settings -> General -> Restart project, then
--           check Reports -> Database for CPU / Memory / Disk IO sitting
--           at 100%. A project idle for months on the smallest compute
--           size will have burned its IO burst balance; upgrading the
--           compute add-on is the fix.
--
--    * EXPLAIN itself is slow
--        -> stale statistics or bloat remain. Re-run section 2, and for
--           a badly bloated table schedule a VACUUM FULL during a
--           maintenance window (this DOES take an exclusive lock).
--
--    Also worth checking in the dashboard regardless:
--      - Database -> disk usage. A full disk makes Postgres crawl.
--      - Settings -> API keys. This project still uses legacy JWT
--        anon/service_role keys. They currently work (verified
--        2026-10-23), but Supabase is retiring them; migrate to
--        sb_publishable_* / sb_secret_* before that deadline.
-- ---------------------------------------------------------------------
