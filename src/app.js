import express from 'express'
import { estadoBanco } from './config/database.js'
import logger from './middlewares/logger.js'
import rotaNaoEncontrada from './middlewares/rotaNaoEncontrada.js'
import tratarErros from './middlewares/tratarErros.js'
import tarefasRoutes from './routes/tarefasRoutes.js'
import { paginaInicial } from './pages/paginaInicial.js'

const app = express()

app.use(logger)
app.use(express.json())


app.get('/', (_req, res) => {
    res.send(paginaInicial)
})

app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        node: process.version,
        uptime: process.uptime(),
        mongo: estadoBanco()
    })  
})

app.use('/tarefas', tarefasRoutes)
app.use(rotaNaoEncontrada)
app.use(tratarErros)

export default app