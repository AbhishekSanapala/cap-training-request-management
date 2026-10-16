const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { TrainingRequests, Courses, Employees } = this.entities;

  // Validation before creation/update
  this.before(['CREATE', 'UPDATE'], 'TrainingRequests', async (req) => {
    const { startDate, endDate, estimatedCost, employee_ID, status } = req.data;

    // Date validation
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        req.error(400, 'Start date cannot be in the past.', 'in/startDate');
      }
      if (end < start) {
        req.error(400, 'End date cannot be earlier than start date.', 'in/endDate');
      }
    }

    // Status transition rules on UPDATE
    if (req.event === 'UPDATE' && status) {
      const existing = await SELECT.one.from(TrainingRequests).where({ ID: req.data.ID });
      if (existing && existing.status === 'APPROVED' && status === 'SUBMITTED') {
        req.error(400, 'An already APPROVED request cannot be re-submitted.');
      }
    }

    // Budget check against employee limit
    if (employee_ID && estimatedCost) {
      const emp = await SELECT.one.from(Employees).where({ ID: employee_ID });
      if (emp) {
        const totalProjected = Number(emp.spentBudget || 0) + Number(estimatedCost);
        if (totalProjected > Number(emp.annualBudget)) {
          req.warn(400, `Estimated cost exceeds remaining annual budget limit by ${totalProjected - emp.annualBudget} ${emp.currency_code}.`);
        }
      }
    }
  });

  // Calculate virtual field daysUntilStart after READ
  this.after('READ', 'TrainingRequests', (results) => {
    const reqs = Array.isArray(results) ? results : [results];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    reqs.forEach((r) => {
      if (r && r.startDate) {
        const start = new Date(r.startDate);
        const diffTime = start.getTime() - today.getTime();
        r.daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    });
  });
});