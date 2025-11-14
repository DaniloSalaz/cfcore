# Copyright (c) 2025, Danilo Salaz and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from cfcore.timesheet.services import get_work_rate_by_employee

class WeeklyTimesheet(Document):
	@frappe.whitelist()
	def get_work_rate(self):
		return get_work_rate_by_employee(self.employee)