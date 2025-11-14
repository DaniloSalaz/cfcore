import frappe
import datetime
from frappe.utils import getdate
from frappe.tests.utils import FrappeTestCase
from cfcore.timesheet.services import (
  _apply_work_rate_snapshot,
  get_work_rate_by_employee,
  _rebuild_workdays,
  _get_or_create_wt, 
  _compute_hours_and_days
)

class TestTimesheetServices(FrappeTestCase):
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.designation = frappe.get_doc({
            "doctype": "Designation",
            "designation_name": "Test Designation"
        }).insert()
        cls.work_rate = frappe.get_doc({
            "doctype": "Work Rate",
            "designation": cls.designation.name,
            "rate_name": "Standard Rate",
            "mode": "Per Day",
            "rate": 50.0
        }).insert()
        cls.employee = frappe.get_doc({
            "doctype": "Employee",
            "employee_name": "Test Employee",
            "first_name": "Test",
            "gender": "Male",
            "date_of_birth": "1990-01-01",
            "date_of_joining": "2020-01-01",
            "designation": cls.designation.name
        }).insert()
        cls.weekly_timesheet = frappe.get_doc({
            "doctype": "Weekly Timesheet",
            "employee": cls.employee.name,
            "from_date": "2025-01-06",
            "to_date": "2025-01-12",
            "work_rate": cls.work_rate.name
        }).insert()
        cls.check_in_log = frappe.get_doc({
            "doctype": "Employee Checkin",
            "employee": cls.employee.name,
            "time": "2025-01-06 09:00:00",
            "log_type": "IN",
            "latitude": "12.9716",
            "longitude": "77.5946"
        }).insert()
        cls.check_out_log = frappe.get_doc({
            "doctype": "Employee Checkin",
            "employee": cls.employee.name,
            "time": "2025-01-06 17:00:00",
            "log_type": "OUT",
            "latitude": "12.9716",
            "longitude": "77.5946"
        }).insert()

    # @classmethod
    # def tearDownClass(cls):
    #     frappe.delete_doc("Employee", cls.employee.name)
    #     frappe.delete_doc("Work Rate", cls.work_rate.name)
    #     frappe.delete_doc("Designation", cls.designation.name)
    #     super().tearDownClass()

    def setUp(self):
        pass

    def test_get_work_rate_by_employee(self):
        # Test the service function
        fetched_work_rate = get_work_rate_by_employee(self.employee.name)
        self.assertIsNotNone(fetched_work_rate)
        self.assertEqual(fetched_work_rate.name, self.work_rate.name)

    def test_get_or_create_wt(self):
        from_date = "2025-01-13"
        to_date = "2025-01-19"
        wt = _get_or_create_wt(self.employee.name, from_date, to_date)
        self.assertIsNotNone(wt)
        self.assertNotEqual(wt.name, self.weekly_timesheet.name)
        self.assertEqual(wt.employee, self.employee.name)
        self.assertEqual(getdate(wt.from_date).strftime("%Y-%m-%d"), from_date)
        self.assertEqual(getdate(wt.to_date).strftime("%Y-%m-%d"), to_date)
        self.assertEqual(wt.work_rate, self.work_rate.name)

    def test_get_or_create_wt_existing(self):
        from_date = "2025-01-06"
        to_date = "2025-01-12"
        wt = _get_or_create_wt(self.employee.name, from_date, to_date)
        self.assertEqual(self.weekly_timesheet.name, wt.name)

    def test_rebuild_working_hours(self):
        _rebuild_workdays(self.weekly_timesheet)
        self.weekly_timesheet.reload()
        self.assertEqual(len(self.weekly_timesheet.days_table), 1)
        work_day = self.weekly_timesheet.days_table[0]
        print(work_day.time_in, work_day.time_out)
        self.assertEqual(work_day.day, getdate("2025-01-06").strftime("%A"))
        self.assertEqual(work_day.date, getdate("2025-01-06"))
        self.assertEqual(work_day.time_in, datetime.timedelta(seconds=32400))  # 09:00:00 in seconds
        self.assertEqual(work_day.time_out, datetime.timedelta(seconds=61200))  # 17:00:00 in seconds
        self.assertEqual(work_day.total_hours, 8.0)

    def test_compute_hours_and_days(self):
        _rebuild_workdays(self.weekly_timesheet)
        _compute_hours_and_days(self.weekly_timesheet)        
        self.assertEqual(self.weekly_timesheet.hours_worked, 8.0)
        self.assertEqual(self.weekly_timesheet.days_worked, 1)

    def test_apply_work_rate_snapshot(self):
        _rebuild_workdays(self.weekly_timesheet)
        _compute_hours_and_days(self.weekly_timesheet)
        _apply_work_rate_snapshot(self.weekly_timesheet)
        self.assertEqual(self.weekly_timesheet.calculated_amount, 50)
        self.assertEqual(self.weekly_timesheet.total_amount, 50)

    def test_compute_hours_and_days_four_checkins(self):
      frappe.get_doc({
          "doctype": "Employee Checkin",
          "employee": self.employee.name,
          "time": "2025-01-20 07:00:00",
          "log_type": "IN",
          "latitude": "12.9716",
          "longitude": "77.5946"
      }).insert()
      # frappe.get_doc({
      #     "doctype": "Employee Checkin",
      #     "employee": self.employee.name,
      #     "time": "2025-01-20 13:00:00",
      #     "log_type": "OUT",
      #     "latitude": "12.9716",
      #     "longitude": "77.5946"
      # }).insert()

      # frappe.get_doc({
      #     "doctype": "Employee Checkin",
      #     "employee": self.employee.name,
      #     "time": "2025-01-20 14:00:00",
      #     "log_type": "IN",
      #     "latitude": "12.9716",
      #     "longitude": "77.5946"
      # }).insert()
      frappe.get_doc({
          "doctype": "Employee Checkin",
          "employee": self.employee.name,
          "time": "2025-01-20 16:00:00",
          "log_type": "OUT",
          "latitude": "12.9716",
          "longitude": "77.5946"
      }).insert()

      weekly_timesheet = frappe.get_doc({
          "doctype": "Weekly Timesheet",
          "employee": self.employee.name,
          "from_date": "2025-01-20",
          "to_date": "2025-01-26",
          "work_rate": self.work_rate.name
      }).insert()
      _rebuild_workdays(weekly_timesheet)
      _compute_hours_and_days(weekly_timesheet)
      work_day = weekly_timesheet.days_table[0]
      print(work_day.time_in, work_day.time_out)
      self.assertEqual(weekly_timesheet.hours_worked, 8.0)
      self.assertEqual(weekly_timesheet.days_worked, 1)
      self.assertEqual(work_day.day, getdate("2025-01-20").strftime("%A"))
      self.assertEqual(work_day.date, getdate("2025-01-20"))
      # self.assertEqual(work_day.time_in, datetime.timedelta(seconds=25200))  # 07:00:00 in seconds
      self.assertEqual(work_day.time_out, datetime.timedelta(seconds=57600))  # 16:00:00 in seconds
      self.assertEqual(work_day.lunch_time, 3600 / 3600)  # 1 hour break
      self.assertEqual(work_day.total_hours, 8.0)


    def tearDown(self):
        pass