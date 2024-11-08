import { Request, Response } from 'express';
import { Categoria } from '../models/Categoria';


// Criar uma categoria
export const criarCategoria = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { nome, ativo, pai } = req.body;

    if (pai) {
      const categoriaPai = await Categoria.findById(pai);
      if (categoriaPai) {
        // Validação de limite de 20 filhas
        if (categoriaPai.filhas.length >= 20) {
          return res.status(400).json({ message: 'O limite de 20 subcategorias foi atingido.' });
        }

        // Validação de nome duplicado
        const categoriaDuplicada = await Categoria.findOne({ nome, pai });
        if (categoriaDuplicada) {
          return res.status(400).json({ message: 'Já existe uma subcategoria com este nome.' });
        }
      }
    }

    const novaCategoria = new Categoria({ nome, ativo, pai });
    const categoriaCriada = await novaCategoria.save();

    // Atualizar o pai com a nova filha
    if (pai) {
      await Categoria.findByIdAndUpdate(pai, { $push: { filhas: categoriaCriada._id } });
    }

    res.status(201).json(categoriaCriada);
  } catch (error) {
    console.log(error, 'mensagem de error do post')
    res.status(500).json({ message: 'Erro ao criar categoria', error });
  }
};


// Listar todas as categorias
export const listarCategorias = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (error) {
    console.log('Erro ao listar categorias:', error)
    res.status(500).json({ message: 'Erro ao listar categorias', error });
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

// Função recursiva para deletar uma categoria e suas filhas
const deletarCategoriaRecursiva = async (categoriaId: string): Promise<void> => {
  const categoria = await Categoria.findById(categoriaId);

  if (categoria) {
    // Deletar todas as filhas
    for (const filhaId of categoria.filhas) {
      await deletarCategoriaRecursiva(filhaId.toString());
    }

    // Deletar a própria categoria
    await Categoria.findByIdAndDelete(categoriaId);
  }
};

// Deletar uma categoria
export const deletarCategoria = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Checar se a categoria existe
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    // Deletar a categoria e suas filhas recursivamente
    await deletarCategoriaRecursiva(id);

    res.json({ message: 'Categoria e suas subcategorias foram deletadas com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar categoria', error });
  }
};
