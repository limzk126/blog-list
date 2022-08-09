const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./test_helper');
const User = require('../models/user');

describe('Adding a new user', () => {
  test('missing required properties returns 400', async () => {
    const wrongUser = {
      username: 'Adriana Checik',
      name: 'AC',
    };

    await api
      .post('/api/users')
      .send(wrongUser)
      .set('Accept', 'applciation/json')
      .expect(400)
      .expect('Content-type', /application\/json/);
  });

  test('Invalid username/password returns 400', async () => {
    const wrongUser = {
      username: 'ab',
      name: 'abc',
      password: '12',
    };

    await api
      .post('/api/users')
      .send(wrongUser)
      .set('Accept', 'applciation/json')
      .expect(400)
      .expect('Content-type', /application\/json/);
  });
});
