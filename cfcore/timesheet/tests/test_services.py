import frappe
import datetime
from frappe.utils import getdate
from frappe.tests.utils import FrappeTestCase
from cfcore.timesheet.enums import WorkRateMode, LogType
from cfcore.timesheet.services import (
    get_work_rate_by_employee,
    _rebuild_workdays,
    _get_or_create_wt,
    recalculate_weekly_timesheet,
)


def _time(hours, minutes=0):
    """Helper to create timedelta from hours and minutes"""
    return datetime.timedelta(hours=hours, minutes=minutes)


class TestTimesheetServices(FrappeTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.designation = frappe.get_doc(
            {"doctype": "Designation", "designation_name": "Test Designation"}
        ).insert()
        cls.work_rate = frappe.get_doc(
            {
                "doctype": "Work Rate",
                "designation": cls.designation.name,
                "rate_name": "Standard Rate",
                "mode": WorkRateMode.PER_DAY.value,
                "rate": 50.0,
            }
        ).insert()
        cls.employee = frappe.get_doc(
            {
                "doctype": "Employee",
                "employee_name": "Test Employee",
                "first_name": "Test",
                "gender": "Male",
                "date_of_birth": "1990-01-01",
                "date_of_joining": "2020-01-01",
                "designation": cls.designation.name,
            }
        ).insert()
        cls.weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": cls.employee.name,
                "from_date": "2025-01-06",
                "to_date": "2025-01-12",
                "work_rate": cls.work_rate.name,
            }
        ).insert()
        cls.check_in_log = frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": cls.employee.name,
                "time": "2025-01-06 09:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        cls.check_out_log = frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": cls.employee.name,
                "time": "2025-01-06 17:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

    @classmethod
    def tearDownClass(cls):
        frappe.db.sql(
            "DELETE FROM `tabWeekly Timesheet` WHERE employee=%s", cls.employee.name
        )
        frappe.db.sql(
            "DELETE FROM `tabEmployee Checkin` WHERE employee=%s", cls.employee.name
        )
        frappe.db.sql("DELETE FROM `tabWork Rate` WHERE name=%s", cls.work_rate.name)
        frappe.db.sql(
            "DELETE FROM `tabDesignation` WHERE name=%s", cls.designation.name
        )
        frappe.db.sql(
            "DELETE FROM `tabEmployee Checkin` WHERE employee =%s", cls.employee.name
        )
        frappe.db.sql("DELETE FROM `tabEmployee` WHERE name=%s", cls.employee.name)
        frappe.db.commit()

        super().tearDownClass()

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
        self.assertEqual(work_day.day, getdate("2025-01-06").strftime("%A"))
        self.assertEqual(work_day.date, getdate("2025-01-06"))
        self.assertEqual(work_day.time_in, _time(9))  # 09:00:00 in seconds
        self.assertEqual(work_day.time_out, _time(17))  # 17:00:00 in seconds
        self.assertEqual(work_day.total_hours, 8.0)

    def test_compute_hours_and_days(self):
        _rebuild_workdays(self.weekly_timesheet)
        self.weekly_timesheet.save()
        self.assertEqual(self.weekly_timesheet.hours_worked, 8.0)
        self.assertEqual(self.weekly_timesheet.days_worked, 1)

    def test_compute_hours_and_days_four_checkins(self):
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-20 07:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-20 13:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-20 14:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-20 16:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-01-20",
                "to_date": "2025-01-26",
                "work_rate": self.work_rate.name,
            }
        ).insert()
        _rebuild_workdays(weekly_timesheet)
        weekly_timesheet.save()
        weekly_timesheet.reload()
        work_day = weekly_timesheet.days_table[0]
        self.assertEqual(weekly_timesheet.hours_worked, 8.0)
        self.assertEqual(weekly_timesheet.days_worked, 1)
        self.assertEqual(work_day.day, getdate("2025-01-20").strftime("%A"))
        self.assertEqual(work_day.date, getdate("2025-01-20"))
        self.assertEqual(work_day.time_in, _time(7))  # 07:00:00 in seconds
        self.assertEqual(work_day.time_out, _time(16))  # 16:00:00 in seconds
        self.assertEqual(work_day.lunch_time, 3600 / 3600)  # 1 hour break
        self.assertEqual(work_day.total_hours, 8.0)

    def test_compute_hours_and_days_two_days_checkins(self):
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-27 07:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-27 15:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-28 07:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-01-28 16:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-01-27",
                "to_date": "2025-02-02",
                "work_rate": self.work_rate.name,
            }
        ).insert()
        _rebuild_workdays(weekly_timesheet)
        weekly_timesheet.save()
        weekly_timesheet.reload()
        work_day_monday = weekly_timesheet.days_table[0]
        work_day_tuesday = weekly_timesheet.days_table[1]
        # Validate Monday

        self.assertEqual(work_day_monday.day, getdate("2025-01-27").strftime("%A"))
        self.assertEqual(work_day_monday.date, getdate("2025-01-27"))
        self.assertEqual(work_day_monday.time_in, _time(7))  # 07:00:00 in seconds
        self.assertEqual(work_day_monday.time_out, _time(15))  # 15:00:00 in seconds
        self.assertEqual(work_day_monday.total_hours, 8.0)

        # Validate Tuesday
        self.assertEqual(work_day_tuesday.day, getdate("2025-01-28").strftime("%A"))
        self.assertEqual(work_day_tuesday.date, getdate("2025-01-28"))
        self.assertEqual(work_day_tuesday.time_in, _time(7))  # 07:00:00 in seconds
        self.assertEqual(work_day_tuesday.time_out, _time(16))  # 16:00:00 in seconds
        self.assertEqual(work_day_tuesday.total_hours, 9.0)

        # Validate totals
        self.assertEqual(weekly_timesheet.hours_worked, 17.0)
        self.assertEqual(weekly_timesheet.days_worked, 2)

    def test_recalculate_weekly_timesheet(self):
        # First day check-ins
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-02-03 07:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-02-03 15:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

        # Second day check-ins
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-02-04 07:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-02-04 13:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-02-04 14:00:00",
                "log_type": LogType.IN.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()
        frappe.get_doc(
            {
                "doctype": "Employee Checkin",
                "employee": self.employee.name,
                "time": "2025-02-04 16:00:00",
                "log_type": LogType.OUT.value,
                "latitude": "12.9716",
                "longitude": "77.5946",
            }
        ).insert()

        recalculate_weekly_timesheet(self.employee.name, "2025-02-03", "2025-02-09")
        weekly_timesheet = frappe.get_doc(
            "Weekly Timesheet",
            {
                "employee": self.employee.name,
                "from_date": "2025-02-03",
                "to_date": "2025-02-09",
            },
        )
        work_day_monday = weekly_timesheet.days_table[0]
        work_day_tuesday = weekly_timesheet.days_table[1]

        # Validate Monday
        self.assertEqual(work_day_monday.day, getdate("2025-02-03").strftime("%A"))
        self.assertEqual(work_day_monday.date, getdate("2025-02-03"))
        self.assertEqual(work_day_monday.time_in, _time(7))  # 07:00:00 in seconds
        self.assertEqual(work_day_monday.time_out, _time(15))  # 15:00:00 in seconds
        self.assertEqual(work_day_monday.total_hours, 8.0)

        # Validate Tuesday
        self.assertEqual(work_day_tuesday.day, getdate("2025-02-04").strftime("%A"))
        self.assertEqual(work_day_tuesday.date, getdate("2025-02-04"))
        self.assertEqual(work_day_tuesday.time_in, _time(7))  # 07:00:00 in seconds
        self.assertEqual(work_day_tuesday.time_out, _time(16))  # 16:00:00 in seconds
        self.assertEqual(work_day_tuesday.lunch_time, 1)  # 1 hour break
        self.assertEqual(work_day_tuesday.total_hours, 8.0)

        # Validate totals
        self.assertEqual(weekly_timesheet.from_date, getdate("2025-02-03"))
        self.assertEqual(weekly_timesheet.to_date, getdate("2025-02-09"))
        self.assertEqual(weekly_timesheet.hours_worked, 16.0)
        self.assertEqual(weekly_timesheet.days_worked, 2)
        self.assertEqual(weekly_timesheet.calculated_amount, 100)
        self.assertEqual(weekly_timesheet.total_amount, 100)

    def test_coppy_work_rate_on_wt_save(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-02-10",
                "to_date": "2025-02-16",
                "work_rate": self.work_rate.name,
            }
        ).insert()
        self.assertEqual(weekly_timesheet.rate_name, self.work_rate.rate_name)
        self.assertEqual(weekly_timesheet.rate_mode, self.work_rate.mode)
        self.assertEqual(weekly_timesheet.rate, self.work_rate.rate)

    def tearDown(self):
        pass
