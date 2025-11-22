import frappe
from frappe.utils import get_datetime, today

DEFAULT_SHIFT_NAME = "Day Shift"

def ensure_default_shift_and_assign(doc, method):
    """
    Hook: se ejecuta cada vez que se crea un Employee.
    - Asegura que exista el Shift Type por defecto (si no existe, lo crea).
    - Asigna ese shift como default_shift al empleado recién creado.
    """

    shift_name = ensure_default_shift_type()

    if not doc.default_shift:
        frappe.db.set_value("Employee", doc.name, "default_shift", shift_name)


def ensure_default_shift_type():
    """
    Devuelve el nombre del Shift Type por defecto.
    Si no existe, lo crea con configuración básica 00:00–23:59.
    """

    existing = frappe.db.exists("Shift Type", {"name": DEFAULT_SHIFT_NAME})
    if existing:
        return DEFAULT_SHIFT_NAME

    shift = frappe.new_doc("Shift Type")
    shift.name = DEFAULT_SHIFT_NAME

    shift.start_time = "00:00:00"
    shift.end_time = "23:59:00"

    # Tolerancias
    shift.begin_check_in_before_shift_start_time = 0      # minutos
    shift.allow_check_out_after_shift_end_time = 0        # minutos

    # Auto Attendance
    if hasattr(shift, "enable_auto_attendance"):
        shift.enable_auto_attendance = 1

    shift.insert(ignore_permissions=True)
    frappe.db.commit()

    return shift.name
