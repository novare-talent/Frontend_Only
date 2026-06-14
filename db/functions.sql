-- Run these once in the Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- These replace the non-atomic read-then-write credit decrements with a single
-- conditional UPDATE that prevents double-spending under concurrent requests.

create or replace function decrement_jobs(sub_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  new_val int;
begin
  update subscriptions
  set jobs_remaining = jobs_remaining - 1
  where id = sub_id
    and jobs_remaining > 0
  returning jobs_remaining into new_val;

  return new_val;  -- null when no row was updated (credit was already 0)
end;
$$;

create or replace function decrement_evaluations(sub_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  new_val int;
begin
  update subscriptions
  set evaluations_remaining = evaluations_remaining - 1
  where id = sub_id
    and evaluations_remaining > 0
  returning evaluations_remaining into new_val;

  return new_val;
end;
$$;
