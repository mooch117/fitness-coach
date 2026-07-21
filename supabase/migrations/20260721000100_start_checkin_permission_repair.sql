/*
======================================================
20260721000100_start_checkin_permission_repair.sql

Purpose:
    Provides a narrowly scoped authenticated RPC for
    saving the measurement side and plan time zone
    during Start Check-In.

    This avoids granting authenticated users broad
    UPDATE privileges on public.coaching_plans.

Created:
    2026-07-21
======================================================
*/

create or replace function
public.save_start_checkin_plan_preferences(
    p_coaching_plan_id uuid,
    p_measurement_side text,
    p_time_zone text default null
)
returns table (
    id uuid,
    measurement_side text,
    time_zone text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_rows_updated integer := 0;
begin
    if v_user_id is null then
        raise exception
            'Authentication is required.';
    end if;

    if p_coaching_plan_id is null then
        raise exception
            'A coaching plan is required.';
    end if;

    if p_measurement_side not in (
        'left',
        'right'
    ) then
        raise exception
            'The measurement side is invalid.';
    end if;

    if p_time_zone is not null
       and btrim(p_time_zone) <> '' then
        begin
            perform timezone(
                p_time_zone,
                now()
            );
        exception
            when invalid_parameter_value then
                raise exception
                    'The time zone is invalid.';
        end;
    end if;

    return query
    update public.coaching_plans as plan
    set
        measurement_side =
            p_measurement_side,
        time_zone =
            case
                when p_time_zone is null
                  or btrim(p_time_zone) = ''
                    then plan.time_zone
                else p_time_zone
            end
    where plan.id =
        p_coaching_plan_id
      and plan.user_id =
        v_user_id
    returning
        plan.id,
        plan.measurement_side,
        plan.time_zone;

    get diagnostics
        v_rows_updated = row_count;

    if v_rows_updated = 0 then
        raise exception
            'The coaching plan was not found.';
    end if;
end;
$$;

revoke all
on function
public.save_start_checkin_plan_preferences(
    uuid,
    text,
    text
)
from public;

grant execute
on function
public.save_start_checkin_plan_preferences(
    uuid,
    text,
    text
)
to authenticated;

comment on function
public.save_start_checkin_plan_preferences(
    uuid,
    text,
    text
)
is 'Allows an authenticated user to save the measurement side and time zone on only their own coaching plan during Start Check-In.';
