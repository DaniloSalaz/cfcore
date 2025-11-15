from enum import Enum


class WorkRateMode(Enum):
    """Work Rate calculation modes"""

    PER_DAY = "Per Day"
    PER_HOUR = "Per Hour"

    # @classmethod
    # def choices(cls):
    #     """Return choices for Frappe select fields"""
    #     return [mode.value for mode in cls]

    # @classmethod
    # def get_display_options(cls):
    #     """Return options in Frappe format"""
    #     return "\n".join(cls.choices())


class LogType(Enum):
    """Employee Checkin log types"""

    IN = "IN"
    OUT = "OUT"


class DocStatusType(Enum):
    """Document status types"""

    DRAFT = 0
    SUBMITTED = 1
    CANCELLED = 2
