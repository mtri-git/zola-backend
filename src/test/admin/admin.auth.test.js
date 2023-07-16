const request = require('supertest');
const app = require('../../app'); // Đây là file chứa Express app của bạn

describe('Admin Login', () => {
  let accessToken;

  it('should return a JWT token if the credentials are correct', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: '123' })
      .expect(200);
    accessToken = response.body.token;
    expect(response.body.token).toBeDefined();
  });

  it('should return 400 if the credentials are incorrect', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' })
      .expect(400);

    expect(response.body.message).toBe("Invalid Phone, Email, Username or Password");
  });

  it('should return 400 if account not exist', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ username: 'wrongusername', password: 'wrongpassword' })
      .expect(400);

    expect(response.body.message).toBe("This account has not existed");
  });
});