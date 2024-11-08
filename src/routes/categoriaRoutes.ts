import { Router, Request, Response } from 'express';
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategorias } from '../controllers/categoriaController';

const router = Router();

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Cria uma nova categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Erro ao criar categoria
 */
router.post('/', async (req: Request, res: Response) => {
  await criarCategoria(req, res);
});

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Retorna uma lista de categorias
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get('/', async (req: Request, res: Response) => {
  await listarCategorias(req, res);
});

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Atualiza uma categoria através do ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da categoria a ser atualizada
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: Erro ao atualizar categoria
 *       404:
 *         description: Categoria não encontrada
 */
router.put('/:id', async (req: Request, res: Response) => {
  await atualizarCategoria(req, res);
});

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Deleta uma categoria através do ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da categoria a ser deletada
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/:id', async (req: Request, res: Response) => {
  await deletarCategoria(req, res);
});

export default router;
