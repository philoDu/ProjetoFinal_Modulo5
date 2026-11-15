import express from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'

const app = express()
const port = parseInt(process.env.PORT, 10) || 3000
const uri = process.env.MONGODB_URI
const mongoState = ['desconectado', 'conectado', 'conectando', 'desconectando']

// Conexão com o banco
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('[MONGO] Conectado com sucesso'))
    .catch((erro) => console.error('[MONGO] Falha ao conectar:', erro.message))

// Rotas
app.get('/', (_req, res) => {
    res.send('<h1>API do Felipe</h1>')
})

app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        node: process.version,
        uptime: process.uptime(),
        mongo: mongoState[mongoose.connection.readyState]
    })  
})

// Listen
app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`)
})