const request = require('supertest');
const app = require('../../app'); // Đây là file chứa Express app của bạn

describe('Register new user', () => {
  // create random number by timestamp
  const randomNumber = Date.now();
    it('should return 200 OK', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullname: 'Vo Tri',
          password: '12345',
          email: `votri${randomNumber}@gmail.com`,
        })
        .expect(200);
      expect(response.body.message).toBe('Register successful');
    });
});

describe('POST Login', () => {
  let accessToken;
  let refreshToken;

  it('should return a JWT token if the credentials are correct', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'votri', password: '12345' })
      .expect(200);
    accessToken = response.body.token;
    refreshToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
    console.log(refreshToken)
    
    expect(response.body.token).toBeDefined();
  });

  it('should return 400 if account not exist', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'wrongusername', password: 'wrongpassword' })
      .expect(400);

    expect(response.body.message).toBe("This account has not registered yet");
  });

  describe('Change password', () => {
    it('should return 200 OK', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: '12345',
          password: '123456',
        })
        .expect(200);
      expect(response.body.message).toBe('Change password successfully');
    });
  });

  describe('Change password again', () => {
    it('should return 200 OK', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: '123456',
          password: '12345',
        })
        .expect(200);
      expect(response.body.message).toBe('Change password successfully');
    });
  });
  
});
