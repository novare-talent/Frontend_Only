-- NOT YET APPLIED. Review, then run in the Supabase SQL Editor
-- (or: supabase db query --linked -f supabase-scale-hardening.sql).
-- Project: NovareTalent (mfkmwkyatoczkrqawffk). Zenhyre tables only; Sighire tables untouched. Idempotent.

-- 1. Indexes for the hot Zenhyre queries, so cost stays flat as rows grow.
--    (responses is currently sequentially scanned on every lookup.)
create index if not exists idx_responses_form_id     on public.responses (form_id);
create index if not exists idx_responses_job_profile on public.responses (job_id, profile_id);
create index if not exists idx_responses_profile_id  on public.responses (profile_id);
create index if not exists idx_jobs_employer_id      on public.jobs (employer_id);
create index if not exists idx_jobs_status_created   on public.jobs (status, created_at desc);
create index if not exists idx_forms_job_id          on public.forms (job_id);
create index if not exists idx_profiles_role         on public.profiles (role);

-- 2. Privilege-escalation guard.
--    Live RLS: profiles INSERT has check(true) and UPDATE is only "id = auth.uid()"
--    with no column limit, so any signed-in user can set their own role to 'admin'.
--    This trigger lets signed-in API callers create only user/client profiles and
--    only lets an admin change a role. Dashboard / service-role / SQL-editor changes
--    (auth.uid() is null) are unaffected, so admins can still be created manually.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role is not null and new.role not in ('user', 'client') then
      raise exception 'role % cannot be self-assigned', new.role using errcode = '42501';
    end if;
  elsif new.role is distinct from old.role then
    if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
      raise exception 'only an admin can change a role' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_role on public.profiles;
create trigger trg_guard_profile_role
  before insert or update on public.profiles
  for each row execute function public.guard_profile_role();

-- 3. Planner statistics.
analyze public.responses;
analyze public.jobs;
analyze public.forms;
analyze public.profiles;

-- ROLLBACK:  drop trigger trg_guard_profile_role on public.profiles;
