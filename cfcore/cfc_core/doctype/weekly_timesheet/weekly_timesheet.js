// Copyright (c) 2025, Danilo Salaz and contributors
// For license information, please see license.txt

frappe.ui.form.on("Weekly Timesheet", {
	// refresh(frm) {},
	
  async get_work_rate(frm) {
    try {
      const work_rate = await  frm.call('get_work_rate');
      console.log("Employee Designation:", work_rate);
      frm.set_value("work_rate", work_rate.message.name);
    } catch (error) {
      frm.set_value("work_rate", null);
      frappe.msgprint({
        title: __("No Work Rate Found"),
        message: __("No Work Rate found for the selected employee's designation."),
        indicator: "yellow"
      });
    }
  },

	employee(frm) {
    frm.trigger("get_work_rate");
  },

});


frappe.ui.form.on("Expense Entry", {
  amount(frm, cdt, cdn) {
    frm.set_value("total_expenses", frm.doc.expenses_detail.reduce((total, entry) => total + (entry.amount || 0), 0));
  }
})