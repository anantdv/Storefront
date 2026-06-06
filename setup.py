from setuptools import setup, find_packages

# Fetch version from the package init
version = "0.0.1"

setup(
	name="courts_storefront",
	version=version,
	description="Courts E-Commerce Storefront customized for Frappe / ERPNext integration",
	author="Anantdv",
	author_email="enquiry@courts.com.pg",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=[]
)
