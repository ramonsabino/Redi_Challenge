import { Categoria } from '../models/Categoria';

// Função recursiva para calcular profundidade
const calcularProfundidade = async (categoriaId: string, profundidade: number = 0): Promise<number> => {
  const categoria = await Categoria.findById(categoriaId);
  if (!categoria || !categoria.pai) {
    return profundidade;
  }
  return calcularProfundidade(categoria.pai.toString(), profundidade + 1); 
};

// Função para validar nome duplicado
const validarNomeDuplicado = async (nome: string, pai: string): Promise<boolean> => {
  const categoriaDuplicada = await Categoria.findOne({ nome, pai });
  return categoriaDuplicada ? true : false;
};

// Função para verificar limite de filhas
const validarLimiteFilhas = (categoriaPai: any): boolean => {
  return categoriaPai.filhas.length >= 20;
};

// Função para criar uma nova categoria
const criarCategoria = async (nome: string, ativo: boolean, pai: string) => {
  const novaCategoria = new Categoria({ nome, ativo, pai });
  return await novaCategoria.save();
};

// Função para deletar uma categoria e suas filhas
const deletarCategoriaRecursiva = async (categoriaId: string): Promise<void> => {
  const categoria = await Categoria.findById(categoriaId);
  if (categoria) {
    for (const filhaId of categoria.filhas) {
      await deletarCategoriaRecursiva(filhaId.toString());
    }
    await Categoria.findByIdAndDelete(categoriaId);
  }
};

export class CategoriaService {
  static async calcularProfundidade(categoriaId: string): Promise<number> {
    return calcularProfundidade(categoriaId);
  }

  static async validarNomeDuplicado(nome: string, pai: string): Promise<boolean> {
    return validarNomeDuplicado(nome, pai);
  }

  static validarLimiteFilhas(categoriaPai: any): boolean {
    return validarLimiteFilhas(categoriaPai);
  }

  static async criarCategoria(nome: string, ativo: boolean, pai: string) {
    return await criarCategoria(nome, ativo, pai);
  }

  static async deletarCategoria(id: string) {
    return await deletarCategoriaRecursiva(id);
  }
}
