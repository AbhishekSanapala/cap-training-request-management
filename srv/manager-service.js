const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { TrainingRequests, Employees } = cds.entities('zrk01.training');

  // Bound Action: Approve Request
  this.on('approveRequest', async (req) => {
    const { requestID } = req.data;
    const tx = cds.tx(req);

    const request = await tx.run(SELECT.one.from(TrainingRequests).where({ ID: requestID }));
    if (!request) {
      return req.error(404, `Training Request ${requestID} not found.`);
    }

    await tx.run(
      UPDATE(TrainingRequests)
        .set({ status: 'APPROVED' })
        .where({ ID: requestID })
    );

    const emp = await tx.run(SELECT.one.from(Employees).where({ ID: request.employee_ID }));
    if (emp) {
      const newSpent = Number(emp.spentBudget || 0) + Number(request.estimatedCost || 0);
      await tx.run(
        UPDATE(Employees)
          .set({ spentBudget: newSpent })
          .where({ ID: request.employee_ID })
      );
    }

    return true;
  });

  // Bound Action: Reject Request
  this.on('rejectRequest', async (req) => {
    const { requestID, reason } = req.data;
    if (!reason) {
      return req.error(400, 'Rejection reason is mandatory.');
    }

    await UPDATE(TrainingRequests)
      .set({ status: 'REJECTED', rejectionReason: reason })
      .where({ ID: requestID });

    return true;
  });

  // Function: Get Pending Count
  this.on('getPendingCount', async () => {
    const result = await SELECT.from(TrainingRequests).where({ status: 'SUBMITTED' });
    return result.length;
  });
});