const cds = require('@sap/cds');

describe('Training Request Management Integration Tests', () => {
  const testServer = cds.test(__dirname + '/..');

  // Test 1: Block unauthenticated access to Admin service
  it('1. Should block unauthenticated access to Admin service', async () => {
    try {
      await testServer.get('/admin/Employees');
    } catch (err) {
      expect([401, 403]).toContain(err.response.status);
    }
  });

  // Test 2: Employee role fetch requests
  it('2. Should allow Employee role to fetch training requests', async () => {
    const res = await testServer.get('/employee/TrainingRequests', {
      auth: { username: 'employee', password: '' }
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.value)).toBe(true);
  });

  // Test 3: Business Validation Error - Past Start Date
  it('3. Should reject request creation when start date is in the past', async () => {
    try {
      await testServer.post(
        '/employee/TrainingRequests',
        {
          employee_ID: 'E001',
          course_ID: 'c3218ad2-1111-4111-a111-111111111111',
          startDate: '2020-01-01',
          endDate: '2020-01-05',
          estimatedCost: 500,
          currency_code: 'USD',
          status: 'NEW'
        },
        { auth: { username: 'employee', password: '' } }
      );
    } catch (err) {
      expect(err.response.status).toBe(400);
      expect(err.response.data.error.message).toContain('Start date cannot be in the past');
    }
  });

  // Test 4: Manager Action - Approve Request
  it('4. Should allow Manager to approve a submitted request', async () => {
    const res = await testServer.post(
      '/manager/approveRequest',
      { requestID: 'd4318bd3-1111-4111-a111-111111111111' },
      { auth: { username: 'manager', password: '' } }
    );
    expect(res.status).toBe(200);
    expect(res.data.value).toBe(true);
  });

  // Test 5: Manager Function - Get Pending Count
  it('5. Should execute getPendingCount function for manager', async () => {
    const res = await testServer.get('/manager/getPendingCount()', {
      auth: { username: 'manager', password: '' }
    });
    expect(res.status).toBe(200);
    expect(typeof res.data.value).toBe('number');
  });

  // Test 6: Admin Role CRUD Access
  it('6. Should allow Admin role full access to Employees', async () => {
    const res = await testServer.get('/admin/Employees', {
      auth: { username: 'admin', password: '' }
    });
    expect(res.status).toBe(200);
    expect(res.data.value.length).toBeGreaterThan(0);
  });
});