app_name = "courts_storefront"
app_title = "Courts Storefront"
app_publisher = "Anantdv"
app_description = "Courts E-Commerce Storefront customized for Frappe / ERPNext integration"
app_email = "enquiry@courts.com.pg"
app_license = "mit"

# Website routing rules
# Maps routes under /courts or subpaths directly to serve the courts.html template
website_route_rules = [
	{"from_route": "/courts/<path:app_path>", "to_route": "courts"},
	{"from_route": "/courts", "to_route": "courts"},
]
