import mongoose from 'mongoose'
import { env } from './env.js'

const estados = ['desconectado', 'conectado', 'conectando', 'desconectando']

export async function conectarBanco() {
    try {
        await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 })
        console.log('[MONGO] Conectado com sucesso')
    } catch (erro) {
        console.error('[MONGO] Falha ao conectar:', erro.message)
    }
}

export function estadoBanco() {
    return estados[mongoose.connection.readyState]
}