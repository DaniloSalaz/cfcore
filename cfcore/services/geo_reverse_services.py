import json
import frappe
from cfcore.integrations.azure_maps import reverse_geocode_azure

CACHE_DOCTYPE = "Geo Reverse Cache"

def get_or_create_reverse_geocode(lat: float, lon: float) -> dict:
    # Normalizar
    norm_lat, norm_lon = round(lat, 4), round(lon, 4)

    # Buscar en cache
    cache = frappe.get_all(
        CACHE_DOCTYPE,
        filters={
            "norm_latitude": norm_lat,
            "norm_longitude": norm_lon,
        },
        fields=["name", "formatted_address", "hits"],
        limit_page_length=1,
    )

    if cache:
        doc = cache[0]
        # actualizar hits y last_used_at
        frappe.db.set_value(
            CACHE_DOCTYPE,
            doc["name"],
            {
                "hits": (doc["hits"] or 0) + 1,
                "last_used_at": frappe.utils.now_datetime(),
            },
        )
        return doc

    # No hay en cache → llamar a Azure
    azure_data = reverse_geocode_azure(lat, lon)

    new_doc = frappe.get_doc({
        "doctype": CACHE_DOCTYPE,
        "latitude": lat,
        "longitude": lon,
        "norm_latitude": norm_lat,
        "norm_longitude": norm_lon,
        "provider": "azure",
        "formatted_address": azure_data["formatted_address"],
        "hits": 1,
        "last_used_at": frappe.utils.now_datetime(),
    })

    new_doc.insert(ignore_permissions=True)

    return {
        "name": new_doc.name,
        "formatted_address": new_doc.formatted_address,
        "hits": new_doc.hits,
    }
