import express from 'express';
import mongoose from 'mongoose';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import categoriaRoutes from './routes/categoriaRoutes';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Erro de conexão com o MongoDB Atlas:', err);
  });

  //Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Categorias',
      version: '1.0.0',
      description: 'API para gerenciar categorias de produtos em um sistema de e-commerce.',
    },
    components: {
      schemas: {
        Categoria: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único da categoria',
            },
            nome: {
              type: 'string',
              description: 'Nome da categoria',
            },
            ativo: {
              type: 'boolean',
              description: 'Status de ativação da categoria',
            },
            pai: {
              type: 'string',
              description: 'ID da categoria pai (se houver)',
            },
            filhas: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Lista de IDs das categorias filhas',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use('/categorias', categoriaRoutes);

export default app;
