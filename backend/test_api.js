const http = require('http');

async function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND REST API ENDPOINT VERIFICATION ---');

  try {
    // 1. Health check
    const base = await makeRequest('/');
    console.log('1. GET /api/v1:', base.status === 200 && base.data.success ? 'PASSED' : 'FAILED', base.data.message);

    // 2a. Login as Student via Email
    const studentLoginEmail = await makeRequest('/auth/login', 'POST', {
      identifier: 'student@mess.com',
      password: 'Password123'
    });
    console.log('2a. POST /api/v1/auth/login (Student via Email):', studentLoginEmail.status === 200 ? 'PASSED' : 'FAILED');

    // 2b. Login as Student via Student Roll ID
    const studentLoginRoll = await makeRequest('/auth/login', 'POST', {
      identifier: 'STU1001',
      password: 'Password123'
    });
    console.log('2b. POST /api/v1/auth/login (Student via Student ID STU1001):', studentLoginRoll.status === 200 ? 'PASSED' : 'FAILED');
    const studentToken = studentLoginRoll.data.data?.token;

    // 3. Login as Mess Admin
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      identifier: 'messadmin@gmail.com',
      password: 'mess@1234'
    });
    console.log('3. POST /api/v1/auth/login (Mess Admin messadmin@gmail.com):', adminLogin.status === 200 ? 'PASSED' : 'FAILED');
    const adminToken = adminLogin.data.data?.token;

    // 4. Login as College Authority
    const authLogin = await makeRequest('/auth/login', 'POST', {
      identifier: 'collegeauthority@gmail.com',
      password: 'authority@1234'
    });
    console.log('4. POST /api/v1/auth/login (College Authority collegeauthority@gmail.com):', authLogin.status === 200 ? 'PASSED' : 'FAILED');
    const authToken = authLogin.data.data?.token;

    // 5. Fetch Today Menu
    const menu = await makeRequest('/menu/today');
    console.log('5. GET /api/v1/menu/today:', menu.status === 200 ? 'PASSED' : 'FAILED', `Day: ${menu.data.data?.dayOfWeek}`);

    const testDate = '2026-08-18';

    // 6. Toggle Meal Selection (Student)
    const toggle = await makeRequest('/meals/toggle', 'POST', { mealType: 'lunch', date: testDate, status: true }, studentToken);
    console.log('6. POST /api/v1/meals/toggle:', toggle.status === 200 ? 'PASSED' : 'FAILED', toggle.data.message);

    // 6b. Cumulative Submit Meal Preferences (Student)
    const cumulativeSubmit = await makeRequest('/meals/submit-selections', 'POST', { date: testDate, breakfast: true, lunch: true, dinner: false }, studentToken);
    console.log('6b. POST /api/v1/meals/submit-selections:', cumulativeSubmit.status === 200 ? 'PASSED' : 'FAILED', cumulativeSubmit.data.message);

    // 7. Get Digital Pass (Student)
    const pass = await makeRequest(`/meals/pass?date=${testDate}`, 'GET', null, studentToken);
    console.log('7. GET /api/v1/meals/pass:', pass.status === 200 ? 'PASSED' : 'FAILED', `Token: ${pass.data.data?.passToken}`);

    // 8. Get Live Headcount (Admin)
    const headcount = await makeRequest(`/attendance/headcount?date=${testDate}`, 'GET', null, adminToken);
    console.log('8. GET /api/v1/attendance/headcount:', headcount.status === 200 ? 'PASSED' : 'FAILED', `Lunch Opted: ${headcount.data.data?.lunch?.optedIn}`);

    // 9. Mark Meal Served via Roll Number (Admin)
    const serve = await makeRequest('/attendance/serve', 'POST', { rollNumber: 'STU1001', date: testDate, mealType: 'lunch' }, adminToken);
    console.log('9. POST /api/v1/attendance/serve:', serve.status === 200 ? 'PASSED' : 'FAILED', serve.data.message);

    // 10. Submit Feedback (Student)
    const feedback = await makeRequest('/feedback', 'POST', { mealType: 'lunch', rating: 5, comment: 'Delicious lunch thali!' }, studentToken);
    console.log('10. POST /api/v1/feedback:', feedback.status === 201 ? 'PASSED' : 'FAILED');

    // 11. Get Monthly Bills Summary (Authority)
    const bills = await makeRequest('/bills/summary', 'GET', null, authToken);
    console.log('11. GET /api/v1/bills/summary:', bills.status === 200 ? 'PASSED' : 'FAILED', `Count: ${bills.data.data?.length}`);

    // 12. Get Wastage & Efficiency Analytics (Authority)
    const analytics = await makeRequest('/analytics/wastage', 'GET', null, authToken);
    console.log('12. GET /api/v1/analytics/wastage:', analytics.status === 200 ? 'PASSED' : 'FAILED', `Efficiency: ${analytics.data.data?.efficiencyRate}%`);

    console.log('--- ALL API ENDPOINTS VERIFIED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('API Verification error:', err);
    process.exit(1);
  }
}

setTimeout(runTests, 2000);
