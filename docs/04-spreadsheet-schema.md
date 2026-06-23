# 04 — Google Spreadsheet Schema

Buat Google Spreadsheet dengan tab berikut.

## sports

| id | name | slug | is_active | created_at |
|---|---|---|---|---|
| sport_futsal | Futsal | futsal | TRUE | 2026-01-01T00:00:00Z |

## venues

| id | name | slug | address | maps_url | phone | open_time | close_time | is_active | created_at |
|---|---|---|---|---|---|---|---|---|---|

## courts

| id | venue_id | sport_id | name | slug | surface_type | indoor_type | capacity | base_price | is_active | created_at |
|---|---|---|---|---|---|---|---|---|---|

## operating_hours

| id | venue_id | day_of_week | open_time | close_time | is_closed |
|---|---|---|---|---|---|

day_of_week:
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

## pricing_rules

| id | court_id | day_type | start_time | end_time | price_per_hour | priority | is_active |
|---|---|---|---|---|---|---|---|

day_type:
- weekday
- weekend
- holiday
- all

## blocked_slots

| id | court_id | date | start_time | end_time | reason | created_by | created_at |
|---|---|---|---|---|---|---|---|

## bookings

| id | booking_code | customer_name | customer_phone | customer_email | venue_id | court_id | sport_id | booking_date | start_time | end_time | duration_minutes | total_price | booking_status | payment_status | payment_proof_url | notes | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## payments

| id | booking_id | amount | method | status | proof_url | confirmed_by | confirmed_at | created_at |
|---|---|---|---|---|---|---|---|---|

## users

| id | name | email | phone | role | is_active | created_at |
|---|---|---|---|---|---|---|

role:
- customer
- operator
- owner
- super_admin

## settings

| key | value | description | updated_at |
|---|---|---|---|

## notifications

| id | booking_id | channel | recipient | message | status | sent_at | created_at |
|---|---|---|---|---|---|---|---|

## audit_logs

| id | actor_id | action | entity_type | entity_id | old_value | new_value | created_at |
|---|---|---|---|---|---|---|---|
