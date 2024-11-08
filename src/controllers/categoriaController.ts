import { Request, Response } from 'express';
import { Categoria } from '../models/Categoria';
import { CategoriaService } from '../services/CategoriaService';

export const criarCategoria = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { nome, ativo, pai } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
    }

    if (pai) {
      const categoriaPai = await Categoria.findById(pai);
      if (!categoriaPai) {
        return res.status(404).json({ message: 'Categoria pai não encontrada.' });
      }

      // Verificando se há mais de 5 niveis de profundidade
      const profundidade = await CategoriaService.calcularProfundidade(pai.toString());
      if (profundidade >= 5) {
        return res.status(400).json({ message: 'Não é permitido criar categorias além do 5º nível de profundidade.' });
      }

      // Limitando categoria pai até 20 filhas
      if (CategoriaService.validarLimiteFilhas(categoriaPai)) {
        return res.status(400).json({ message: 'O limite de 20 subcategorias foi atingido para esta categoria pai.' });
      }

      // Validando se há nome duplicado
      if (await CategoriaService.validarNomeDuplicado(nome, pai)) {
        return res.status(400).json({ message: 'Já existe uma subcategoria com este nome para esta categoria pai.' });
      }
    }

    const categoriaCriada = await CategoriaService.criarCategoria(nome, ativo, pai);

    // Atualizando a categoria Pai com a nova filha
    if (pai) {
      await Categoria.findByIdAndUpdate(pai.toString(), { $push: { filhas: categoriaCriada._id } });
    }

    res.status(201).json(categoriaCriada);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Erro ao Criar categoria', error: error.message });
    } else {
      res.status(500).json({ message: 'Erro ao Criar categoria', error: 'Erro desconhecido' });
    }
  }
};

export const listarCategorias = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { page = 1, size = 10 } = req.query;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'nome';

    const skip = (Number(page) - 1) * Number(size);
    const limit = Number(size);

    const filtro: any = {};

    if (req.query.ativo) {
      filtro.ativo = req.query.ativo === 'true'; 
    }

    const categorias = await Categoria.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: 1 });

    const totalCategorias = await Categoria.countDocuments(filtro);

    res.json({
      total: totalCategorias,
      page: Number(page),
      size: Number(size),
      totalPages: Math.ceil(totalCategorias / Number(size)),
      categorias,
    });
  } catch (error) {
    console.log('Erro ao listar categorias:', error);
    res.status(500).json({ message: 'Erro ao listar categorias', error });
  }
};

export const listarSubcategorias = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria pai não encontrada' });
    }

    const subcategorias = await Categoria.find({ _id: { $in: categoria.filhas } });

    res.json(subcategorias);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar subcategorias', error });
  }
};

export const atualizarCategoria = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { nome, ativo } = req.body;

    const categoriaAtualizada = await Categoria.findByIdAndUpdate(
      id,
      { nome, ativo },
      { new: true, runValidators: true }
    );

    if (!categoriaAtualizada) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.json(categoriaAtualizada);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar categoria', error });
  }
};

export const deletarCategoria = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    await CategoriaService.deletarCategoria(id);

    res.json({ message: 'Categoria e suas subcategorias foram deletadas com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar categoria', error });
  }
};
