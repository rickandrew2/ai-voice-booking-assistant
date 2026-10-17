-- Read only public views over the workflow tables.
--
-- Columns come from docs/supabase-columns.json. Constraints come from
-- docs/supabase-constraints.json. All four columns sets referenced here exist
-- in the export, nothing is guessed.
--
-- Security model:
--   anon loses every privilege on the base tables.
--   anon gains SELECT on four masked views only.
--   The views are owner-invoking (the Supabase default), so they read with the
--   view owner's rights and are not affected by RLS state on the base tables.
--   Their column list and the masking limit what they can expose.
--   The n8n workflow keeps using the service role key and is not affected by
--   anything revoked from anon.

-- anon must be able to reach the public schema for the views.
grant usage on schema public to anon;

-- Close the door on the base tables for anon, whatever the current grants are.
revoke select, insert, update, delete, truncate,
       references, trigger on
  public.leads, public.call_logs,
  public.booking_holds, public.appointments
from anon;

create or replace view public.calls_public as
select
  cl.created_at,
  cl.retell_call_id,
  cl.outcome,
  cl.duration_seconds
from public.call_logs as cl
order by cl.created_at desc;

create or replace view public.leads_public as
select
  ld.created_at,
  ld.name,
  -- Masked at the view level: first two and last two digits survive.
  case
    when ld.phone is null or character_length(ld.phone) < 5
      then '•••••'
    else left(ld.phone, 2)
      || repeat('•', character_length(ld.phone) - 4)
      || right(ld.phone, 2)
  end as phone_masked,
  ld.service,
  ld.status
from public.leads as ld
order by ld.created_at desc;

create or replace view public.appointments_public as
select
  ap.scheduled_at,
  ap.status,
  ap.calendar_event_id
from public.appointments as ap
order by ap.scheduled_at desc;

create or replace view public.errors_public as
select
  cl.created_at,
  cl.retell_call_id,
  cl.outcome
from public.call_logs as cl
where cl.outcome like 'error:%'
order by cl.created_at desc;

-- anon gets exactly one verb: SELECT on the views.
revoke insert, update, delete, truncate,
       references, trigger on
  public.calls_public, public.leads_public,
  public.appointments_public, public.errors_public
from anon;

grant select on
  public.calls_public, public.leads_public,
  public.appointments_public, public.errors_public
to anon;
