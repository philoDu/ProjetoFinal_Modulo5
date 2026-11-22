import mongoose from 'mongoose'
import { TIPOS, STATUS, PRIORIDADES } from '../constants/tarefa.js'

const tarefaSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    tipo: { type: String, enum: TIPOS, default: 'tarefa' },
    titulo: { type: String, required: true, trim: true, maxlength: 120 },
    descricao: { type: String, default: '' },
    projeto: { type: String, default: null },
    status: { type: String, enum: STATUS, default: 'a-fazer' },
    prioridade: { type: String, enum: PRIORIDADES, default: 'media' },
    responsaveis: { type: [String], default: [] },
    dataInicio: { type: String, default: null },
    dataEntrega: { type: String, required: true },
    pontos: { type: Number, default: null },
    vinculadas: { type: [String], default: [] },
    solucao: { type: String, default: '' },
    concluidaEm: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  },
)

export const Tarefa = mongoose.model('Tarefa', tarefaSchema)