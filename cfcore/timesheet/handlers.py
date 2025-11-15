import frappe
from frappe.utils import getdate, add_days
from frappe.utils.background_jobs import enqueue
from cfcore.utils.date import get_week_start
from cfcore.timesheet.services import (
    do_snapshot_work_rate,
    compute_hours_and_days,
    calculate_expenses,
    apply_work_rate_snapshot,
    calculate_totals,
)


## Doctype Employee CheckIn  - after insert handler
def on_checkin_after_insert(doc, method):
    d = getdate(doc.time)
    week_start = get_week_start(d)
    week_end = add_days(week_start, 6)
    enqueue_recalculate_week(doc.employee, week_start, week_end)


def enqueue_recalculate_week(employee, week_start, week_end):
    key = f"recalc_wt::{employee}_{week_start}_{week_end}"
    if frappe.cache().get_value(key):
        return
    frappe.cache().set_value(key, True, expires_in_sec=60)  # debounce for 1 minute
    enqueue(
        "cfcore.timesheet.services.recalculate_weekly_timesheet",
        queue="long",
        employee=employee,
        from_date=str(week_start),
        to_date=str(week_end),
        now=False,
    )


## Doctype Weekly Timesheet - before save handler
def before_wt_save(doc, method):
    do_snapshot_work_rate(doc)
    compute_hours_and_days(doc)
    calculate_expenses(doc)
    apply_work_rate_snapshot(doc)
    calculate_totals(doc)
