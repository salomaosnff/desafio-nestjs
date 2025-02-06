/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/infra/nest/app.module';

describe('AppController (e2e)', () => {
  const username = `e2e-user-${crypto.randomUUID()}`;
  let app: INestApplication<App>;

  function getToken(): Promise<string> {
    return request(app.getHttpServer())
      .post('/login')
      .send({
        username,
        password: 'abcd',
      })
      .then((response) => response.body.token);
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /register should register a user and return a user', () => {
    return request(app.getHttpServer())
      .post('/register')
      .send({
        username,
        password: 'abcd',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: expect.any(String),
          username,
        });
      });
  });

  it('POST /login should login a user and return a token and user', () => {
    return request(app.getHttpServer())
      .post('/login')
      .send({
        username,
        password: 'abcd',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          token: expect.any(String),
          user: {
            id: expect.any(String),
            username,
          },
        });
      });
  });

  it('GET /tasks should return a paged list of tasks', async () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          items: expect.any(Array),
          total_items: expect.any(Number),
          page: expect.any(Number),
          page_size: expect.any(Number),
        });
      });
  });

  it('POST /tasks should create a task', async () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'First task',
        description: 'First task description',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: expect.any(String),
          title: 'First task',
          description: 'First task description',
        });
      });
  });

  it('POST /tasks should return an error when input is missing', async () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({})
      .expect(400);
  });

  it('POST /tasks should return an error when title is missing', async () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)

      .send({
        description: 'First task description',
      })
      .expect(400);
  });

  it('PATCH /tasks/:id should update a task', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'Not updated Task',
        description: 'Not updated Task description',
      })
      .expect(201);

    return request(app.getHttpServer())
      .patch(`/tasks/${body.id}`)
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'Updated title',
        description: 'Updated description',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: body.id,
          title: 'Updated title',
          description: 'Updated description',
        });

        expect(response.body.updated_at).not.toEqual(body.updated_at);
      });
  });

  it('PATCH /tasks/:id should return an error when task is not found', async () => {
    return request(app.getHttpServer())
      .patch('/tasks/invalid-id')
      .set('Authorization', `Bearer ${await getToken()}`)

      .send({
        title: 'Updated title',
        description: 'Updated description',
      })
      .expect(404);
  });

  it('GET /tasks/:id should return a task', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'Task to find by id',
        description: 'Task to find by id description',
      })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/tasks/${body.id}`)
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: body.id,
          title: 'Task to find by id',
          description: 'Task to find by id description',
        });
      });
  });

  it('GET /tasks/:id should return an error when task is not found', async () => {
    return request(app.getHttpServer())
      .get('/tasks/invalid-id')
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(404);
  });

  it('DELETE /tasks/:id should delete a task', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'Task to delete',
        description: 'Task to delete description',
      })
      .expect(201);

    return request(app.getHttpServer())
      .delete(`/tasks/${body.id}`)
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(204);
  });

  it('DELETE /tasks/:id should return an error when task is not found', async () => {
    return request(app.getHttpServer())
      .delete('/tasks/invalid-id')
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(404);
  });

  it('GET /tasks?status=DONE should return a paged list of tasks with status DONE', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'Task done',
        description: 'Task done description',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${body.id}`)
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        status: 'DONE',
      })
      .expect(200);

    return request(app.getHttpServer())
      .get('/tasks?status=DONE')
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          items: expect.any(Array),
          total_items: expect.any(Number),
          page: expect.any(Number),
          page_size: expect.any(Number),
        });

        expect(response.body.items.length).toBeGreaterThan(0);

        response.body.items.forEach((item) => {
          expect(item.status).toBe('DONE');
        });
      });
  });

  it('GET /tasks?title=Task should return a paged list of tasks with title containing Task', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${await getToken()}`)
      .send({
        title: 'Task to find by title',
        description: 'Task to find by title description',
      })
      .expect(201);

    return request(app.getHttpServer())
      .get('/tasks?title=Task')
      .set('Authorization', `Bearer ${await getToken()}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          items: expect.any(Array),
          total_items: expect.any(Number),
          page: expect.any(Number),
          page_size: expect.any(Number),
        });

        expect(response.body.items.length).toBeGreaterThan(0);

        response.body.items.forEach((item) => {
          expect(item.title).toMatch(/Task/);
        });
      });
  });
});
