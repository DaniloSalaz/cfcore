import frappe


class TestEmployeeHandler(frappe.tests.utils.FrappeTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = frappe.get_doc(
            {
                "doctype": "Company",
                "company_name": "Default Company",
                "abbr": "DC",
                "default_currency": "USD",
                "country": "United States",
            }
        ).insert()
    
    @classmethod
    def tearDownClass(self):
        # Limpia los datos creados durante la prueba
        if frappe.db.exists("Employee", {"first_name": "Test Employee"}):
            frappe.delete_doc("Employee", {"first_name": "Test Employee"}, force=True)
        if frappe.db.exists("Employee", {"first_name": "Test Employee 2"}):
            frappe.delete_doc("Employee", {"first_name": "Test Employee 2"}, force=True)
        if frappe.db.exists("Shift Type", {"name": "Day Shift"}):
            frappe.delete_doc("Shift Type", "Day Shift", force=True)
        if frappe.db.exists("Company", {"company_name": "Default Company" }):
            frappe.delete_doc("Company", "Default Company", force=True)
        super().tearDownClass()

    def test_ensure_default_shift_and_assign(self):
        # Elimina cualquier Shift Type existente con el nombre por defecto
        if frappe.db.exists("Shift Type", {"name": "Day Shift"}):
            frappe.delete_doc("Shift Type", "Day Shift", force=True)

        # Crea un nuevo Employee sin default_shift
        employee = frappe.get_doc(
            {
                "doctype": "Employee",
                "first_name": "Test Employee",
                "gender": "Male",
                "date_of_birth": "1990-01-01",
                "date_of_joining": "2024-01-01",
                "company": self.company.company_name,

            }
        ).insert()

        # Llama al hook manualmente
        from cfcore.hr.employee_handler import ensure_default_shift_and_assign

        ensure_default_shift_and_assign(employee, None)

        # Verifica que el Shift Type por defecto fue creado
        self.assertTrue(frappe.db.exists("Shift Type", {"name": "Day Shift"}))

        employee.reload()
        self.assertEqual(employee.default_shift, "Day Shift")
        second_employee = frappe.get_doc(
            {
                "doctype": "Employee",
                "first_name": "Test Employee 2",
                "gender": "Female",
                "date_of_birth": "1992-02-02",
                "date_of_joining": "2024-02-01",
                "company": self.company.company_name,

            }
        ).insert()
        ensure_default_shift_and_assign(second_employee, None)
        second_employee.reload()
        self.assertEqual(second_employee.default_shift, "Day Shift")


