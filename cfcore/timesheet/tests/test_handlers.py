import frappe


class TestBeforeSaveWT(frappe.tests.utils.FrappeTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.designation = frappe.get_doc(
            {"doctype": "Designation", "designation_name": "superhero"}
        ).insert()
        cls.work_rate = frappe.get_doc(
            {
                "doctype": "Work Rate",
                "designation": cls.designation.name,
                "rate_name": "Standard Rate for Superheroes",
                "mode": "Per Day",
                "rate": 150.0,
            }
        ).insert()
        cls.employee = frappe.get_doc(
            {
                "doctype": "Employee",
                "employee_name": "Spider-man",
                "first_name": "Peter",
                "last_name": "Parker",
                "gender": "Male",
                "date_of_birth": "1990-01-01",
                "date_of_joining": "2020-01-01",
                "designation": cls.designation.name,
            }
        ).insert()

    @classmethod
    def tearDownClass(cls):
        frappe.db.sql(
            "DELETE FROM `tabWeekly Timesheet` WHERE employee=%s", cls.employee.name
        )
        frappe.db.sql("DELETE FROM `tabWork Rate` WHERE name=%s", cls.work_rate.name)
        frappe.db.sql(
            "DELETE FROM `tabDesignation` WHERE name=%s", cls.designation.name
        )
        frappe.db.sql("DELETE FROM `tabEmployee` WHERE name=%s", cls.employee.name)
        frappe.db.commit()
        super().tearDownClass()

    def test_calculate_total_expenses(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-02-17",
                "to_date": "2025-02-23",
                "work_rate": self.work_rate.name,
                "expenses_detail": [
                    {
                        "expense_date": "2025-02-17",
                        "description": "Gas",
                        "amount": 10.0,
                        "is_approved": 1,
                    },
                    {
                        "expense_date": "2025-02-18",
                        "description": "Travel",
                        "amount": 20.0,
                        "is_approved": 1,
                    },
                ],
            }
        ).insert()
        self.assertEqual(weekly_timesheet.total_expenses, 30.0)

    def test_calculate_total_expenses_only_approved(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-02-24",
                "to_date": "2025-03-01",
                "expenses_detail": [
                    {
                        "expense_date": "2025-02-24",
                        "description": "Stationery",
                        "amount": 10.0,
                        "is_approved": 0,
                    },
                    {
                        "expense_date": "2025-02-25",
                        "description": "Travel",
                        "amount": 15.0,
                        "is_approved": 0,
                    },
                    {
                        "expense_date": "2025-02-26",
                        "description": "Meals",
                        "amount": 25.0,
                        "is_approved": 1,
                    },
                ],
            }
        ).insert()
        self.assertEqual(weekly_timesheet.total_expenses, 25.0)

    def test_calculate_total_expenses_no_expenses(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-03-02",
                "to_date": "2025-03-08",
            }
        ).insert()
        self.assertEqual(weekly_timesheet.total_expenses, 0.0)

    def test_work_rate_fields_set(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-03-09",
                "to_date": "2025-03-15",
                "work_rate": self.work_rate.name,
            }
        ).insert()
        self.assertEqual(weekly_timesheet.rate_name, self.work_rate.rate_name)
        self.assertEqual(weekly_timesheet.rate_mode, self.work_rate.mode)
        self.assertEqual(weekly_timesheet.rate, self.work_rate.rate)

    def test_calculate_total_amount(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-03-16",
                "to_date": "2025-03-22",
                "work_rate": self.work_rate.name,
                "expenses_detail": [
                    {
                        "expense_date": "2025-02-17",
                        "description": "Gas",
                        "amount": 10.0,
                        "is_approved": 1,
                    },
                    {
                        "expense_date": "2025-02-18",
                        "description": "Travel",
                        "amount": 20.0,
                        "is_approved": 1,
                    },
                ],
                "days_table": [
                    {"date": "2025-03-16", "total_hours": 8},
                    {"date": "2025-03-17", "total_hours": 8},
                    {"date": "2025-03-18", "total_hours": 8},
                    {"date": "2025-03-19", "total_hours": 8},
                    {"date": "2025-03-20", "total_hours": 8},
                ],
            }
        ).insert()
        # 5 working days in the week
        expected_total = (5 * self.work_rate.rate) + 30.0  #
        self.assertEqual(weekly_timesheet.total_expenses, 30.0)
        self.assertEqual(weekly_timesheet.days_worked, 5)
        self.assertEqual(weekly_timesheet.calculated_amount, 5 * self.work_rate.rate)
        self.assertEqual(weekly_timesheet.total_amount, expected_total)

    def test_calculate_total_amount_override(self):
        weekly_timesheet = frappe.get_doc(
            {
                "doctype": "Weekly Timesheet",
                "employee": self.employee.name,
                "from_date": "2025-03-16",
                "to_date": "2025-03-22",
                "work_rate": self.work_rate.name,
                "use_override": 1,
                "override_amount": 800.0,
                "expenses_detail": [
                    {
                        "expense_date": "2025-02-17",
                        "description": "Gas",
                        "amount": 10.0,
                        "is_approved": 1,
                    },
                    {
                        "expense_date": "2025-02-18",
                        "description": "Travel",
                        "amount": 20.0,
                        "is_approved": 1,
                    },
                ],
                "days_table": [
                    {"date": "2025-03-16", "total_hours": 8},
                    {"date": "2025-03-17", "total_hours": 8},
                    {"date": "2025-03-18", "total_hours": 8},
                    {"date": "2025-03-19", "total_hours": 8},
                    {"date": "2025-03-20", "total_hours": 8},
                ],
            }
        ).insert()
        # 5 working days in the week
        expected_total = 800.0 + 30.0  #
        self.assertEqual(weekly_timesheet.total_expenses, 30.0)
        self.assertEqual(weekly_timesheet.days_worked, 5)
        self.assertEqual(weekly_timesheet.calculated_amount, 0)
        self.assertEqual(weekly_timesheet.total_amount, expected_total)

    def setUp(self):
        pass

    def tearDown(self):
        frappe.db.sql(
            "DELETE FROM `tabWeekly Timesheet` WHERE employee=%s", self.employee.name
        )
        frappe.db.commit()
