# Copyright (c) 2025, Danilo Salaz and contributors
# For license information, please see license.txt

import frappe
from cfcore.services.geo_reverse_services import get_or_create_reverse_geocode
from frappe.model.document import Document


def normalize_coords(lat: float, lon: float, digits: int = 4) -> tuple[float, float]:
    return round(lat, digits), round(lon, digits)

class GeoReverseCache(Document):
	def before_save(self):
		self.norm_latitude, self.norm_longitude = normalize_coords(
			self.latitude, self.longitude
		)

	@frappe.whitelist()
	def test_get_address(self):
		return 'test calle roca'

	@frappe.whitelist(methods=["POST"])
	def get_address_from_coords(lat: float, lon: float):
		"""Devuelve dirección formateada usando caché + Azure"""
		return "Calle Roca 24, Valencia, España"
		# lat = float(lat)
		# lon = float(lon)
		# result = get_or_create_reverse_geocode(lat, lon)
		# return {
		# 	"address": result.get("formatted_address"),
    	# }
