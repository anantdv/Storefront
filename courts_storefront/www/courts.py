import os
import frappe

def get_context(context):
	context.no_cache = 1
	
	# Resolve compiled assets dynamically from courts_storefront/public/dist/assets
	assets_dir = frappe.get_app_path("courts_storefront", "public", "dist", "assets")
	
	js_file = ""
	css_file = ""
	
	if os.path.exists(assets_dir):
		for f in os.listdir(assets_dir):
			if f.endswith(".js"):
				js_file = f"/assets/courts_storefront/dist/assets/{f}"
			elif f.endswith(".css"):
				css_file = f"/assets/courts_storefront/dist/assets/{f}"
				
	context.js_file = js_file
	context.css_file = css_file
