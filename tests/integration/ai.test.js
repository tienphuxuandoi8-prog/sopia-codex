import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('AI Socrates Integration Tests', () => {
  it('GET /api/v1/ai/quota should return quota for guest without 401', async () => {
    const res = await request(app).get('/api/v1/ai/quota');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.remaining).toBeGreaterThan(0);
  });

  it('POST /api/v1/ai/threads should create thread for guest without CSRF error', async () => {
    const res = await request(app)
      .post('/api/v1/ai/threads')
      .send({ bookId: null, chapterId: null, title: 'Đàm đạo với Socrates' });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('POST /api/v1/ai/threads/:id/messages should stream answers to philosophy questions', async () => {
    // 1. Create thread
    const threadRes = await request(app)
      .post('/api/v1/ai/threads')
      .send({ bookId: 'suy-tuong', title: 'Hỏi về sách' });
    
    const threadId = threadRes.body.data.id;

    // 2. Send question
    const res = await request(app)
      .post(`/api/v1/ai/threads/${threadId}/messages`)
      .send({
        message: 'sách suy tưởng có những điều hay gì'
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('Marcus');
    expect(res.text).toContain('Aurelius');
    expect(res.text).toContain('[DONE]');
  });
});
