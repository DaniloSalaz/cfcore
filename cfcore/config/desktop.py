from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "module_name": "My Application",
            "color": "grey",
            "icon": "octicon octicon-file-directory",
            "type": "module",
            "label": _("My Application"),
        }
    ]
