# Copyright (c) 2025, Danilo Salaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from cfcore.timesheet.services import (
    get_work_rate_by_employee,
    compute_hours_and_days,
    apply_work_rate_snapshot,
    calculate_totals,
)


class WeeklyTimesheet(Document):
    @frappe.whitelist()
    def get_work_rate(self):
        return get_work_rate_by_employee(self.employee)

    @frappe.whitelist()
    def count_days_worked(self):
        compute_hours_and_days(self)

    @frappe.whitelist()
    def calculate_total_amount(self):
        apply_work_rate_snapshot(self)
        calculate_totals(self)
