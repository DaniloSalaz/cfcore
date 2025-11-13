import datetime
from frappe.utils import getdate

def get_week_start(date):
    """Given a date, return the Monday of that week."""
    date = getdate(date)
    start_of_week = date - datetime.timedelta(days=date.weekday())
    return start_of_week