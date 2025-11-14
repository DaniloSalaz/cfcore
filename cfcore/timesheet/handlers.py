import frappe
from frappe.utils import getdate, add_days
from frappe.utils.background_jobs import enqueue
from cfcore.utils.date import get_week_start

## Doctype Employee CheckIn  - after insert handler
def on_checkin_after_insert(doc, method):
    d = getdate(doc.time)
    week_start = get_week_start(d)
    week_end   = add_days(week_start, 6)
    enqueue_recalculate_week(doc.employee, week_start, week_end)

def enqueue_recalculate_week(employee, week_start, week_end):
    key = f"recalc_wt::{employee}_{week_start}_{week_end}"
    if frappe.cache().get_value(key):
        return
    frappe.cache().set_value(key, True, expires_in_sec=60) # debounce for 1 minute
    enqueue(
        "cfcore.timesheet.services.recalculate_weekly_timesheet",
        queue='long',
        employee=employee,
        from_date=str(week_start),
        to_date=str(week_end),
        now=False
    )

## Doctype Weekly Timesheet - before save handler
def before_wt_save(doc, method):
    if not doc.work_rate:
        return
    work_rate = frappe.get_doc("Work Rate", doc.work_rate)
    doc.rate_name = work_rate.rate_name
    doc.rate_mode = work_rate.mode
    doc.rate = work_rate.rate

    total_expenses = 0.0
    for expense in doc.expenses_detail:
        total_expenses += expense.amount
    doc.total_expenses = total_expenses

    if doc.use_override:
        doc.calculated_amount = 0.0
        doc.total_amount = doc.override_amount + total_expenses