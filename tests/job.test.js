const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Job = require('../models/job');

describe('Job API (integration)', () => {
  beforeAll(async () => {
    // connect to test db
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-test';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  test('GET /api/jobs should return 200 and jobs list', async () => {
    // ensure at least one job exists
    await Job.create({ positionName: 'Test', company: 'Acme' });
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('jobs');
    expect(Array.isArray(res.body.jobs)).toBe(true);
  });
});
