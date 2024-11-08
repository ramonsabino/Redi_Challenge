import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoria extends Document {
  nome: string;
  ativo: boolean;
  pai?: mongoose.Types.ObjectId;
  filhas: mongoose.Types.ObjectId[];
}

const CategoriaSchema = new Schema<ICategoria>({
  nome: { type: String, required: true },
  ativo: { type: Boolean, default: true },
  pai: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', default: null },
  filhas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }],
});

CategoriaSchema.index({ nome: 1, pai: 1 }, { unique: true }); // Impede nomes duplicados

export const Categoria = mongoose.model<ICategoria>('Categoria', CategoriaSchema);
