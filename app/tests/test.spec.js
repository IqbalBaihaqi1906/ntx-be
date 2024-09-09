const request = require('supertest');
const app = require('../../server');
const db = require('../models');

describe('Test root path', () => {
  it('should return hello message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Hello');
  })
})

const adminCredential = {
  digits: 'DFA',
  password: 'user123',
}

const userCredentials = {
  digits: 'HTA',
  password: 'user123',
}

describe('Test user registration', () => {
  let accessToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/user/login')
      .send(adminCredential);

    expect(loginResponse.statusCode).toBe(200);
    accessToken = loginResponse.body.data.accessToken;
  });

  it('should return 400 if required fields are not provided', async () => {
    const response = await request(app).post('/api/user/register')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        digits: '12345678',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Please provide all required fields');
  });

  it('should return 400 if user already exists', async () => {
    const response = await request(app).post('/api/user/register')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        digits: 'IQB',
        password: 'user123',
        fullname: 'Iqbal Baihaqi',
      })

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('User already exists');
  })

  it('should return 200 if user is successfully registered', async () => {
    const response = await request(app).post('/api/user/register')
      .set('authorization', `Bearer ${accessToken}`)
      .send({
        digits: 'ERF',
        password: 'user123',
        fullname: 'Erfan',
      })

    expect(response.statusCode).toBe(200);
    expect(response.body.data.digits).toBe('ERF');
    expect(response.body.data.fullname).toBe('Erfan');
  })

  afterAll(async () => {
    await db.sequelize.query(`DELETE FROM users WHERE digits = 'ERF'`);
  });
});

describe('Test user login', () => {
  it('should return 400 if required fields are not provided', async () => {
    const response = await request(app).post('/api/user/login')
      .send({
        digits: '12345678',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Please provide all required fields');
  });

  it('should return 400 if user is not found', async () => {
    const response = await request(app).post('/api/user/login')
      .send({
        digits: 'ERD',
        password: 'user123',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  })

  it('should return 400 if invalid credentials', async () => {
    const response = await request(app).post('/api/user/login')
      .send({
        digits: 'DFA',
        password: 'user1234',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  })

  it('should return 200 if user is successfully logged in', async () => {
    const response = await request(app).post('/api/user/login')
      .send(adminCredential);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
  })
})

describe('Test Refactor Endpoint', () => {
  let accessTokenUser;
  let accessTokenAdmin;

  beforeAll(async () => {
    const [loginResponseUser, loginResponseAdmin] = await Promise.all([
      request(app)
      .post('/api/user/login')
      .send(userCredentials),
      request(app)
      .post('/api/user/login')
      .send(adminCredential)
    ]);

    expect(loginResponseUser.statusCode).toBe(200);
    accessTokenUser = loginResponseUser.body.data.accessToken;

    expect(loginResponseAdmin.statusCode).toBe(200);
    accessTokenAdmin = loginResponseAdmin.body.data.accessToken;
  });

  it('should return 401 if token is not provided', async () => {
    const response = await request(app).get('/api/data/refactorme1');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Authorization Header is required');
  })

  describe('Test Refactor Endpoint 1', () => {
    it('should return 200 with average survey value', async () => {
      const response = await request(app).get('/api/data/refactorme1')
        .set('authorization', `Bearer ${accessTokenUser}`)

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    })
  })

  describe('Test Refactor Endpoint 2', () => {
    it('should return 401 if token is not provided', async () => {
      const response = await request(app).post('/api/data/refactorme2');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Authorization Header is required');
    })

    it('should return 400 if user already taken the survey', async () => {
      const response = await request(app).post('/api/data/refactorme2')
        .set('authorization', `Bearer ${accessTokenUser}`)
        .send({
          userId: 1,
          values: [100, 100, 90, 50]
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User has already taken the survey');
    })

    it('should return 403 if role is not user', async () => {
      const response = await request(app).post('/api/data/refactorme2')
        .set('authorization', `Bearer ${accessTokenAdmin}`)
        .send({
          userId: 3,
          values: [100, 100, 90, 50]
        })

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe('Forbidden Access');
    })

    it('should return 200 if survey is successfully sent', async () => {
      const response = await request(app).post('/api/data/refactorme2')
        .set('authorization', `Bearer ${accessTokenUser}`)
        .send({
          userId: 3,
          values: [100, 100, 90, 50]
        })

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeTruthy();

      await db.sequelize.query(`Delete FROM surveys WHERE id = ${response.body.data.id}`);
      await db.sequelize.query(`UPDATE users SET dosurvey = false WHERE id = 3`);
    })
  })
})

describe('Get Data Endpoint', () => {
  let accessToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/user/login')
      .send(adminCredential);

    expect(loginResponse.statusCode).toBe(200);
    accessToken = loginResponse.body.data.accessToken;
  });

  it('should return 401 if token is not provided', async () => {
    const response = await request(app).get('/api/data/attackers');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Authorization Header is required');
  })

  it('should return 400 if type query is not provided', async () => {
    const response = await request(app).get('/api/data/attackers')
      .set('authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid Request');
  })

  it('should return 400 if type is not valid', async () => {
    const response = await request(app).get('/api/data/attackers?type=random')
      .set('authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid Request');
  })

  it('should return 200 with data for type destinationCountry', async () => {
    const response = await request(app).get('/api/data/attackers?type=destinationCountry')
      .set('authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  })

  it('should return 200 with data for type sourceCountry', async () => {
    const response = await request(app).get('/api/data/attackers?type=sourceCountry')
      .set('authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('label');
    expect(response.body.data).toHaveProperty('total');
  })
})