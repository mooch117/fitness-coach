/*
======================================================
20260720000100_create_plan_rpc.sql

Purpose:
    Creates one active coaching plan and its first
    target record in a single database transaction.

Notes:
    The existing partial unique index on coaching_plans
    continues to enforce one active plan per user.

Created:
    2026-07-20
======================================================
*/

create or replace function public.create_coaching_plan_with_targets(
    p_start_date date,
    p_checkin_day integer,
    p_program_length_weeks integer,
    p_goal text,
    p_calorie_target integer,
    p_protein_grams integer,
    p_carb_grams integer,
    p_fat_grams integer,
    p_weekly_cardio_target_minutes integer,
    p_weekly_workout_target integer,
    p_daily_water_goal_oz integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_plan_id uuid;
begin
    if v_user_id is null then
        raise exception 'Authentication is required.';
    end if;

    if exists (
        select 1
        from public.coaching_plans
        where user_id = v_user_id
          and status = 'active'
    ) then
        raise exception 'You already have an active coaching plan.';
    end if;

    if p_checkin_day not between 0 and 6 then
        raise exception 'Weekly check-in day must be between 0 and 6.';
    end if;

    if p_program_length_weeks not between 1 and 52 then
        raise exception 'Program length must be between 1 and 52 weeks.';
    end if;

    if p_goal not in (
        'fat_loss',
        'maintenance',
        'muscle_gain'
    ) then
        raise exception 'The coaching goal is invalid.';
    end if;

    if p_calorie_target <= 0 then
        raise exception 'Calories must be greater than zero.';
    end if;

    if least(
        p_protein_grams,
        p_carb_grams,
        p_fat_grams,
        p_weekly_cardio_target_minutes,
        p_weekly_workout_target,
        p_daily_water_goal_oz
    ) < 0 then
        raise exception 'Plan targets cannot be negative.';
    end if;

    insert into public.coaching_plans (
        user_id,
        start_date,
        checkin_day,
        program_length_weeks,
        goal,
        status
    )
    values (
        v_user_id,
        p_start_date,
        p_checkin_day::smallint,
        p_program_length_weeks::smallint,
        p_goal,
        'active'
    )
    returning id into v_plan_id;

    insert into public.coaching_plan_targets (
        coaching_plan_id,
        effective_date,
        calorie_target,
        protein_grams,
        carb_grams,
        fat_grams,
        weekly_cardio_target_minutes,
        weekly_workout_target,
        daily_water_goal_oz
    )
    values (
        v_plan_id,
        p_start_date,
        p_calorie_target::smallint,
        p_protein_grams::smallint,
        p_carb_grams::smallint,
        p_fat_grams::smallint,
        p_weekly_cardio_target_minutes::smallint,
        p_weekly_workout_target,
        p_daily_water_goal_oz::smallint
    );

    return v_plan_id;
end;
$$;

revoke all
on function public.create_coaching_plan_with_targets(
    date,
    integer,
    integer,
    text,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer
)
from public;

grant execute
on function public.create_coaching_plan_with_targets(
    date,
    integer,
    integer,
    text,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer
)
to authenticated;

comment on function public.create_coaching_plan_with_targets(
    date,
    integer,
    integer,
    text,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer,
    integer
)
is 'Creates one active coaching plan and its initial targets atomically.';
