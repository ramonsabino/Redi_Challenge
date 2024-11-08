import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

describe('Testes de API de Categorias', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  it('Deve criar uma nova categoria', async () => {
    const response = await request(app).post('/categorias').send({
      nome: 'Categoria Teste',
      ativo: true,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.nome).toBe('Categoria Teste');
  });

  it('Deve listar todas as categorias', async () => {
    const response = await request(app).get('/categorias');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
