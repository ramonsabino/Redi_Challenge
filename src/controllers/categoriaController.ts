import { Request, Response } from 'express';
import { Categoria } from '../models/Categoria';

// Função recursiva para calcular a profundidade
const calcularProfundidade = async (categoriaId: string, profundidade: number = 0): Promise<number> => {
  const categoria = await Categoria.findById(categoriaId);
  if (!categoria || !categoria.pai) {
    return profundidade;
  }
  return calcularProfundidade(categoria.pai.toString(), profundidade + 1); 
};

// Criar uma categoria
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
      const profundidade = await calcularProfundidade(pai.toString());
      if (profundidade >= 5) {
        return res.status(400).json({ message: 'Não é permitido criar categorias além do 5º nível de profundidade.' });
      }

      // Limitando categoria pai até 20 filhas
      if (categoriaPai.filhas.length >= 20) {
        return res.status(400).json({ message: 'O limite de 20 subcategorias foi atingido para esta categoria pai.' });
      }

      // Validando se há nome duplicado
      const categoriaDuplicada = await Categoria.findOne({ nome, pai });
      if (categoriaDuplicada) {
        return res.status(400).json({ message: 'Já existe uma subcategoria com este nome para esta categoria pai.' });
      }
    }

    const novaCategoria = new Categoria({ nome, ativo, pai });
    const categoriaCriada = await novaCategoria.save();

    // Atualizando a categoria Pai com a nova filha
    if (pai) {
      await Categoria.findByIdAndUpdate(pai.toString(), { $push: { filhas: categoriaCriada._id } });
    }

    res.status(201).json(categoriaCriada);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Erro ao Criar categorias', error: error.message });
    } else {
      res.status(500).json({ message: 'Erro ao Criar categorias', error: 'Erro desconhecido' });
    }
  }
};

// Listar todas as categorias com filtros e paginação
export const listarCategorias = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Pegando os parâmetros de consulta para paginação e filtros
    const { page = 1, size = 10 } = req.query;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'nome';

    const skip = (Number(page) - 1) * Number(size);
    const limit = Number(size);

    // Filtro de busca
    const filtro: any = {};

    // Filtro para categorias ativas
    if (req.query.ativo) {
      filtro.ativo = req.query.ativo === 'true'; 
    }

    // Pegando as categorias com base no filtro, limitando e ordenando
    const categorias = await Categoria.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: 1 }); 

    // Contagem do total de categorias sem filtro
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

    // Listar as subcategorias (filhas)
    const subcategorias = await Categoria.find({ _id: { $in: categoria.filhas } });

    res.json(subcategorias);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar subcategorias', error });
  }
};


// Atualizar uma categoria
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

// Função para deletar categoria Pai junto com as filhass
const deletarCategoriaRecursiva = async (categoriaId: string): Promise<void> => {
  const categoria = await Categoria.findById(categoriaId);

  if (categoria) {
    // Deletar todas as filhas
    for (const filhaId of categoria.filhas) {
      await deletarCategoriaRecursiva(filhaId.toString());
    }
    await Categoria.findByIdAndDelete(categoriaId);
  }
};

// Deletar uma categoria
export const deletarCategoria = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    await deletarCategoriaRecursiva(id);

    res.json({ message: 'Categoria e suas subcategorias foram deletadas com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar categoria', error });
  }
};
