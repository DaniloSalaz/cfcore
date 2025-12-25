# cfcore/integrations/azure_maps.py

import requests
import frappe


def reverse_geocode_azure(lat: float, lon: float) -> dict | None:
    """
    Llama a Azure Maps y devuelve un dict con dirección y datos básicos.
    Si algo falla o no hay resultados, devuelve None.
    """
    settings = frappe.get_single("Azure Maps Settings")

    # Podés tener estos valores fijos o en el DocType
    url = settings.base_url or "https://atlas.microsoft.com/search/address/reverse/json"
    api_version = settings.api_version or "1.0"

    params = {
        "api-version": api_version,
        # Azure reverse: query = "{lat},{lon}"
        "query": f"{lat},{lon}",
        "subscription-key": settings.subscription_key,
    }

    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
    except requests.RequestException as exc:
        frappe.log_error(frappe.get_traceback(), "Azure Maps reverse_geocode_azure error")
        return None

    data = resp.json()

    # NUEVO: ahora la respuesta tiene 'addresses', no 'features'
    addresses = data.get("addresses") or []
    if not addresses:
        return None

    first = addresses[0]

    # La info viene dentro de 'address'
    address = first.get("address") or {}
    formatted_address = address.get("freeformAddress")
    if not formatted_address:
        return None

    # Extra: ciudad, CP, país usando tu JSON de ejemplo
    city = (
        address.get("localName")
        or address.get("municipality")
    )
    postcode = address.get("postalCode")
    country = address.get("country") or address.get("countryCode")

    position = first.get("position")  # "lat,lon" en string, por si te sirve

    return {
        "formatted_address": formatted_address,
    }
