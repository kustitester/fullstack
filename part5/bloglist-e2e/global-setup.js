const { request } = require('@playwright/test');

module.exports = async () => {
  const req = await request.newContext();
  await req.post('http://localhost:3003/api/testing/reset');
  await req.dispose();
}; 