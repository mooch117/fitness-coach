/*
======================================================
20260720000600_plan_preferences_permission_fix.sql

Purpose:
    Saves plan measurement preferences through a
    narrow authenticated RPC instead of granting
    broad UPDATE privileges on coaching_plans.

Created:
    2026-07-20
======================================================
*/

create or replace function
public.save_plan_measurement_preferences(
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
begin
    if v_user_id is null then
        raise exception
            'Authentication is required.';
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

    if not found then
        raise exception
            'The coaching plan was not found.';
    end if;
end;
$$;

revoke all
on function
public.save_plan_measurement_preferences(
    uuid,
    text,
    text
)
from public;

grant execute
on function
public.save_plan_measurement_preferences(
    uuid,
    text,
    text
)
to authenticated;

comment on function
public.save_plan_measurement_preferences(
    uuid,
    text,
    text
)
is 'Allows an authenticated user to save the measurement side and time zone on their own coaching plan.';
