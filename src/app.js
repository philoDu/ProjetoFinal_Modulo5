import express from 'express'
import { estadoBanco } from './config/database.js'

const app = express()

app.use(express.json())

app.get('/', (_req, res) => {
    res.send('<h1>API do Felipe</h1>')
})

app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        node: process.version,
        uptime: process.uptime(),
        mongo: estadoBanco()
    })  
})

export default app