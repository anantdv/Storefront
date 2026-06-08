import frappe
from frappe import _

@frappe.whitelist()
def get_cart_quotation():
	user = frappe.session.user
	if user == "Guest":
		return {"doc": None}
	
	customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
	if not customer:
		customer = frappe.db.get_value("Customer", {"name": user}, "name")
	
	if not customer:
		return {"doc": None}

	quotation_name = frappe.db.get_value("Quotation", {
		"customer": customer,
		"docstatus": 0,
	}, "name", order_by="creation desc")
	
	if quotation_name:
		doc = frappe.get_doc("Quotation", quotation_name)
		return {"doc": doc.as_dict()}
	
	return {"doc": None}

@frappe.whitelist()
def update_cart(item_code, qty):
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Please log in to update your cart"))
		
	customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
	if not customer:
		customer = frappe.db.get_value("Customer", {"name": user}, "name")
	if not customer:
		# Auto-create customer if missing
		customer_doc = frappe.get_doc({
			"doctype": "Customer",
			"customer_name": user.split('@')[0],
			"customer_type": "Individual",
			"email_id": user,
		})
		customer_doc.insert(ignore_permissions=True)
		customer = customer_doc.name
		
	quotation_name = frappe.db.get_value("Quotation", {
		"customer": customer,
		"docstatus": 0,
	}, "name", order_by="creation desc")
	
	if quotation_name:
		quotation = frappe.get_doc("Quotation", quotation_name)
	else:
		quotation = frappe.get_doc({
			"doctype": "Quotation",
			"customer": customer,
			"transaction_date": frappe.utils.today(),
			"quotation_to": "Customer",
			"party_name": customer,
			"items": []
		})
		quotation.insert(ignore_permissions=True)
		
	item_found = False
	qty = float(qty)
	
	for item in quotation.items:
		if item.item_code == item_code:
			if qty <= 0:
				quotation.remove(item)
			else:
				item.qty = qty
			item_found = True
			break
			
	if not item_found and qty > 0:
		quotation.append("items", {
			"item_code": item_code,
			"qty": qty
		})
		
	if len(quotation.items) == 0:
		quotation.delete(ignore_permissions=True)
		return {"doc": None}
	else:
		quotation.flags.ignore_permissions = True
		quotation.save()
		return {"doc": quotation.as_dict()}

@frappe.whitelist()
def place_order():
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Please log in to place an order"))
		
	customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
	if not customer:
		customer = frappe.db.get_value("Customer", {"name": user}, "name")
	if not customer:
		frappe.throw(_("Customer record not found"))
		
	quotation_name = frappe.db.get_value("Quotation", {
		"customer": customer,
		"docstatus": 0,
	}, "name", order_by="creation desc")
	
	if not quotation_name:
		frappe.throw(_("No active cart found"))
		
	quotation = frappe.get_doc("Quotation", quotation_name)
	
	quotation.flags.ignore_permissions = True
	if quotation.docstatus == 0:
		quotation.submit()
		
	from erpnext.selling.doctype.quotation.quotation import make_sales_order
	so = make_sales_order(quotation.name)
	
	so.flags.ignore_permissions = True
	so.insert()
	so.submit()
	
	return so.name
