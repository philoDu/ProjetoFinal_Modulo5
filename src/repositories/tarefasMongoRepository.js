import mongoose from "mongoose";
import { Tarefa } from "../models/Tarefa.js";
import { Contador } from "../models/Contador.js";

// Converte o documento do MongoDB para o formato usado pela aplicação
function paraObjeto(documento) {
  if (!documento) return null;
  const { _id, __v, ...campos } = documento;
  return { id: _id.toString(), ...campos };
}

async function proximoCodigo() {
  const contador = await Contador.findOneAndUpdate(
    { _id: "tarefas" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return `TF-${contador.seq}`;
}

export const tarefasRepository = {
  async listar() {
    const documentos = await Tarefa.find().sort({ criadoEm: -1 }).lean();
    return documentos.map(paraObjeto);
  },

  async buscarPorId(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return paraObjeto(await Tarefa.findById(id).lean());
  },

  async criar(dados) {
    const documento = await Tarefa.create({
      ...dados,
      codigo: await proximoCodigo(),
    });
    return paraObjeto(documento.toObject());
  },

  async atualizar(id, dados) {
    if (!mongoose.isValidObjectId(id)) return null;
    // Campos controlados pelo sistema não são regravados
    const { id: _id, codigo, criadoEm, atualizadoEm, ...campos } = dados;
    const documento = await Tarefa.findByIdAndUpdate(id, campos, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
    return paraObjeto(documento);
  },

  async excluir(id) {
    if (!mongoose.isValidObjectId(id)) return false;
    const documento = await Tarefa.findByIdAndDelete(id);
    return documento !== null;
  },

  // Dos ids informados, devolve os que pertencem a tarefas existentes
  async idsExistentes(ids) {
    const validos = ids.filter((id) => mongoose.isValidObjectId(id));
    const documentos = await Tarefa.find(
      { _id: { $in: validos } },
      { _id: 1 },
    ).lean();
    return documentos.map((documento) => documento._id.toString());
  },

  async removerDosVinculos(id) {
    await Tarefa.updateMany({ vinculadas: id }, { $pull: { vinculadas: id } });
  },
};
