import frappe
from frappe.utils import getdate
from frappe.model.docstatus import DocStatus

def get_or_create_wt(employee, from_date, to_date):
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
  
  wt = frappe.get_doc({
    "doctype": "Weekly Timesheet",
    "employee": employee,
    "from_date": from_date,
    "to_date": to_date,
  })
  wt.insert()
  return wt

def get_job_site(lat, lon):
  return "Mock Location Site"

def build_worklog_summary(employee, date_day):
    """
    Build worklog summary from Employee Checkin logs.
    Handles 2 scenarios:
    - 2 logs: IN -> OUT (no lunch)
    - 4 logs: IN -> OUT (lunch start) -> IN (lunch end) -> OUT (work end)
    
    Returns dict with job_site, day, time_in, lunch_time, time_out, total_hours
    """
    try:
        # Get all check logs for the day
        check_logs = frappe.get_all("Employee Checkin",
            filters={
                "employee": employee,
                "time": ["between", [
                    f"{date_day} 00:00:00", 
                    f"{date_day} 23:59:59"
                ]],
            },
            fields=["name", "time", "log_type", "latitude", "longitude"],
            order_by="time asc"
        )
        
        if not check_logs:
            return None
            
        # Validate log count
        if len(check_logs) not in [2, 4]:
            frappe.log_error(
                f"Invalid log count ({len(check_logs)}) for employee {employee} on {date_day}",
                "Worklog Summary Error"
            )
            return None
            
        # Initialize summary
        summary = {
            "job_site": None,
            "day": date_day.strftime("%A"),
            "date": date_day,
            "time_in": None,
            "lunch_time": "0h",
            "time_out": None,
            "total_hours": "0h"
        }
        
        # Get job site from first log
        first_log = check_logs[0]
        if first_log.get("latitude") and first_log.get("longitude"):
            summary["job_site"] = get_job_site(
                lat=first_log.latitude, 
                lon=first_log.longitude
            )
        
        # Process logs based on count
        if len(check_logs) == 2:
            summary.update(_process_two_logs(check_logs))
        elif len(check_logs) == 4:
            summary.update(_process_four_logs(check_logs))
            
        return summary
        
    except Exception as e:
        frappe.log_error(
            f"Error processing worklog for employee {employee} on {date_day}: {str(e)}",
            "Worklog Summary Error"
        )
        return None


def _process_two_logs(logs):
    """Process 2 logs scenario: IN -> OUT"""
    try:
        first_log, last_log = logs[0], logs[1]
        
        # Validate log types
        if first_log.log_type != "IN" or last_log.log_type != "OUT":
            raise ValueError(f"Invalid log sequence: {first_log.log_type} -> {last_log.log_type}")
            
        # Calculate total hours
        time_diff = last_log.time - first_log.time
        total_seconds = time_diff.total_seconds()
        
        if total_seconds < 0:
            raise ValueError("Negative time difference detected")
            
        total_hours = total_seconds / 3600.0
        
        return {
            "time_in": first_log.time,
            "time_out": last_log.time,
            "lunch_time": 0.0,
            "total_hours": total_hours,
        }
        
    except Exception as e:
        raise Exception(f"Error processing 2 logs: {str(e)}")


def _process_four_logs(logs):
    """Process 4 logs scenario: IN -> OUT (lunch) -> IN -> OUT"""
    try:
        work_in, lunch_out, lunch_in, work_out = logs
        
        # Validate log sequence
        expected_sequence = ["IN", "OUT", "IN", "OUT"]
        actual_sequence = [log.log_type for log in logs]
        
        if actual_sequence != expected_sequence:
            raise ValueError(f"Invalid log sequence: {' -> '.join(actual_sequence)}")
            
        # Calculate morning work time
        morning_diff = lunch_out.time - work_in.time
        morning_seconds = morning_diff.total_seconds()
        
        # Calculate lunch time
        lunch_diff = lunch_in.time - lunch_out.time
        lunch_seconds = lunch_diff.total_seconds()
        
        # Calculate afternoon work time
        afternoon_diff = work_out.time - lunch_in.time
        afternoon_seconds = afternoon_diff.total_seconds()
        
        # Validate all times are positive
        if any(seconds < 0 for seconds in [morning_seconds, lunch_seconds, afternoon_seconds]):
            raise ValueError("Negative time difference detected in log sequence")
            
        # Calculate totals
        total_work_hours = (morning_seconds + afternoon_seconds) / 3600.0
        lunch_hours = lunch_seconds / 3600.0
        
         # e.g f"{total_work_hours:.1f}h"
        return {
            "time_in": work_in.time,
            "time_out": work_out.time,
            "lunch_time": lunch_hours,
            "total_hours": total_work_hours,
        }
        
    except Exception as e:
        raise Exception(f"Error processing 4 logs: {str(e)}")


def rebuild_workdays(wt):
  # Clear existing workdays
  wt.set("workdays", [])
  from_date = getdate(wt.from_date)
  to_date   = getdate(wt.to_date)
  current_date = from_date
  while current_date <= to_date:
    summary = build_worklog_summary(wt.employee, current_date)
    if summary:
      wt.append("workdays", summary)
    current_date = current_date.add_days(1)
    
  wt.save()
  

def compute_hours_and_days(wt):
  total_hours = 0.0
  total_days  = 0
  for wd in wt.workdays:
    hours_str = wd.total_hours.replace("h", "")
    try:
      hours = float(hours_str)
      total_hours += hours
      if hours > 0:
        total_days += 1
    except:
      continue
  wt.total_hours = f"{total_hours:.1f}h"
  wt.total_days  = total_days
  wt.save()


def apply_work_rate_snapshot(wt):
  if wt.use_override:
    return
  if wt.rule_mode == "Per Day":
    wt.calculated_amount = wt.total_days * wt.rule_rate
  elif wt.rule_mode == "Per Hour":
    wt.calculated_amount = wt.total_hours * wt.rule_rate
  wt.total_amount = wt.calculated_amount + wt.total_expenses
  wt.save()


def recalculate_weekly_timesheet(employee, from_date, to_date):
  from_date = getdate(from_date); to_date = getdate(to_date)
  wt = get_or_create_wt(employee, from_date, to_date)

  if wt.docstatus == DocStatus.CANCELLED or wt.docstatus == DocStatus.SUBMITTED:
    return
  
  # Rebuild workdays for the timesheet
  rebuild_workdays(wt)

  # Compute total hours and days
  compute_hours_and_days(wt)

  # Apply work rate snapshot
  apply_work_rate_snapshot(wt)

  wt.save(ignore_permissions=True)
  frappe.db.commit()