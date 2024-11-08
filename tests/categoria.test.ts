import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

describe('Testes de API de Categorias', () => {
  beforeAll(async () => {
    // Conectar ao banco de dados de testes
    await mongoose.connect(process.env.MONGODB_URI as string);
  });

  afterAll(async () => {
    // Limpar o banco de dados e fechar a conexão após os testes
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
    expect(response.body.ativo).toBe(true);  // Verifica o campo 'ativo'
  });

  it('Deve retornar erro ao criar uma categoria sem nome', async () => {
    const response = await request(app).post('/categorias').send({
      nome: '',
      ativo: true,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Nome da categoria é obrigatório.');
  });

  it('Deve listar todas as categorias', async () => {
    const response = await request(app).get('/categorias');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.categorias)).toBe(true); // Verifica se a propriedade 'categorias' é um array
    expect(response.body.categorias.length).toBeGreaterThan(0); // Verifica se há categorias
    expect(response.body.total).toBeGreaterThan(0); // Verifica se o total de categorias é maior que 0
    expect(response.body.totalPages).toBeGreaterThan(0); // Verifica se o total de páginas é maior que 0
  });
  

  it('Deve retornar erro 404 ao tentar deletar uma categoria inexistente', async () => {
    const response = await request(app).delete('/categorias/invalidid');
    
    expect(response.status).toBe(500); // Certifique-se de que o erro correto é retornado
    expect(response.body.message).toBe('Erro ao deletar categoria');
  });
  it('Deve deletar uma categoria', async () => {
    // Criar uma categoria para testar a exclusão
    const createResponse = await request(app).post('/categorias').send({
      nome: 'Categoria para Deletar',
      ativo: true,
    });

    const categoriaId = createResponse.body._id;

    const deleteResponse = await request(app).delete(`/categorias/${categoriaId}`);
    
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Categoria e suas subcategorias foram deletadas com sucesso');
  });

  it('Deve listar as subcategorias de uma categoria', async () => {
    // Criar uma categoria pai
    const categoriaPaiResponse = await request(app).post('/categorias').send({
      nome: 'Categoria Pai',
      ativo: true,
    });

    const categoriaPaiId = categoriaPaiResponse.body._id;

    // Criar uma subcategoria para a categoria pai
    const subcategoriaResponse = await request(app).post('/categorias').send({
      nome: 'Subcategoria Teste',
      ativo: true,
      pai: categoriaPaiId,
    });

    const subcategoriaId = subcategoriaResponse.body._id;

    // Testar a listagem de subcategorias
    const response = await request(app).get(`/categorias/${categoriaPaiId}/filhas`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0]._id).toBe(subcategoriaId); // Verifica se a subcategoria criada está na resposta
  });
});
