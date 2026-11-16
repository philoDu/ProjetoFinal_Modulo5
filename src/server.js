import app from './app.js'
import { env } from './config/env.js'
import { conectarBanco } from './config/database.js'

await conectarBanco()

app.listen(env.port, () => {
    console.log(`Servidor ouvindo na porta ${env.port}`)
})

