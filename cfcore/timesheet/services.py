import frappe
from frappe.utils import getdate, add_days
from frappe.model.docstatus import DocStatus

def get_work_rate_by_employee(employee):
    """Fetch work rate based on employee's designation."""
    designation = frappe.get_value("Employee", employee, "designation")
    work_rate = frappe.get_doc("Work Rate", {"designation": designation})
    return work_rate

def _get_job_site(lat, lon):
  return "Mock Location Site"

def _get_daily_checkin_logs(employee, date_day):
    """Retrieve all checkin logs for a specific employee and day."""
    try:
        return frappe.get_all("Employee Checkin",
            filters={
                "employee": employee,
                "time": ["between", [f"{date_day} 00:00:00", f"{date_day} 23:59:59"]]
            },
            fields=["time", "log_type", "latitude", "longitude"],
            order_by="time asc"
        )
    except Exception as e:
        frappe.log_error(f"Failed to fetch logs for {employee} on {date_day}: {e}", "Checkin Fetch Error")
        return []

def _is_valid_log_sequence(logs, employee, date_day):
    """Validate log count and sequence patterns."""
    if len(logs) not in [2, 4]:
        frappe.log_error(
            f"Invalid log count ({len(logs)}) for {employee} on {date_day}",
            "Invalid Log Count"
        )
        return False
    
    expected_patterns = {
        2: ["IN", "OUT"],
        4: ["IN", "OUT", "IN", "OUT"]
    }
    
    actual_sequence = [log.log_type for log in logs]
    expected_sequence = expected_patterns[len(logs)]
    
    if actual_sequence != expected_sequence:
        frappe.log_error(
            f"Invalid sequence for {employee} on {date_day}: {' -> '.join(actual_sequence)}",
            "Invalid Log Sequence"
        )
        return False
    
    return True

def _create_base_summary(date_day, first_log):
    """Create the base summary structure with job site info."""
    job_site = None
    if first_log.get("latitude") and first_log.get("longitude"):
        job_site = _get_job_site(first_log.latitude, first_log.longitude)
    
    return {
        "job_site": job_site,
        "day": date_day.strftime("%A"),
        "date": date_day
    }

def _hours_between(start_time, end_time):
    """Calculate hours between two datetime objects."""
    time_diff = end_time - start_time
    return max(0, time_diff.total_seconds() / 3600.0)

def _process_simple_workday(logs):
    """Process simple workday: IN -> OUT."""
    time_in, time_out = logs[0].time, logs[1].time
    total_hours = _hours_between(time_in, time_out)
    
    return {
        "time_in": time_in,
        "time_out": time_out,
        "lunch_time": 0,
        "total_hours": total_hours
    }

def _process_workday_with_lunch(logs):
    """Process workday with lunch: IN -> OUT -> IN -> OUT."""
    work_start, lunch_start, lunch_end, work_end = [log.time for log in logs]
    
    morning_hours = _hours_between(work_start, lunch_start)
    lunch_hours = _hours_between(lunch_start, lunch_end)
    afternoon_hours = _hours_between(lunch_end, work_end)
    total_work_hours = morning_hours + afternoon_hours
    # f"{lunch_hours:.1f}h",
    return {
        "time_in": work_start,
        "time_out": work_end,
        "lunch_time": lunch_hours,
        "total_hours": total_work_hours
    }

def _calculate_work_hours(logs):
    """Calculate work hours based on log patterns."""
    if len(logs) == 2:
        return _process_simple_workday(logs)
    return _process_workday_with_lunch(logs)

def _get_or_create_wt(employee, from_date, to_date):
  wt = frappe.get_all("Weekly Timesheet",
    filters={
      "employee": employee,
      "from_date": from_date,
      "to_date": to_date
    },
    limit=1
  )
  if wt:
    return frappe.get_doc("Weekly Timesheet", wt[0].name)
  work_rate = get_work_rate_by_employee(employee)
  wt = frappe.get_doc({
    "doctype": "Weekly Timesheet",
    "employee": employee,
    "from_date": from_date,
    "to_date": to_date,
    "work_rate": work_rate.name if work_rate else None
  })
  wt.insert()
  return wt

def _build_worklog_summary(employee, date_day):
    """
    Build worklog summary from Employee Checkin logs.
    Supports: 2 logs (work day) or 4 logs (work day with lunch)
    """
    logs = _get_daily_checkin_logs(employee, date_day)
    if not logs:
        return None
    
    if not _is_valid_log_sequence(logs, employee, date_day):
        return None
    
    summary = _create_base_summary(date_day, logs[0])
    work_data = _calculate_work_hours(logs)
    
    return {**summary, **work_data}

def _rebuild_workdays(wt):
  # Clear existing workdays
  wt.set("days_table", [])
  from_date = getdate(wt.from_date)
  to_date   = getdate(wt.to_date)
  current_date = from_date
  while current_date <= to_date:
    summary = _build_worklog_summary(wt.employee, current_date)
    if summary:
      wt.append("days_table", summary)
    current_date = add_days(current_date, 1)
    
  wt.save()
  
def _compute_hours_and_days(wt):
  hours_worked = 0.0
  days_worked  = 0
  for wd in wt.days_table:
    hours_worked += wd.total_hours
    if wd.total_hours > 0:
      days_worked += 1
  wt.hours_worked = hours_worked
  wt.days_worked  = days_worked
  wt.save()

def _apply_work_rate_snapshot(wt):
  if wt.use_override:
    return
  if wt.rate_mode == "Per Day":
    wt.calculated_amount = wt.days_worked * wt.rate
  elif wt.rate_mode == "Per Hour":
    wt.calculated_amount = wt.hours_worked * wt.rate
  wt.total_amount = wt.calculated_amount + wt.total_expenses
  wt.save()

def recalculate_weekly_timesheet(employee, from_date, to_date):
  from_date = getdate(from_date); to_date = getdate(to_date)
  wt = _get_or_create_wt(employee, from_date, to_date)

  if wt.docstatus == DocStatus.CANCELLED or wt.docstatus == DocStatus.SUBMITTED:
    return
  
  # Rebuild workdays for the timesheet
  _rebuild_workdays(wt)

  # Compute total hours and days
  _compute_hours_and_days(wt)

  # Apply work rate snapshot
  _apply_work_rate_snapshot(wt)

  wt.save(ignore_permissions=True)
  frappe.db.commit()