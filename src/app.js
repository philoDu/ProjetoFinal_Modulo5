import express from "express";
import { estadoBanco } from "./config/database.js";
import logger from "./middlewares/logger.js";
import rotaNaoEncontrada from "./middlewares/rotaNaoEncontrada.js";
import tratarErros from "./middlewares/tratarErros.js";
import tarefasRoutes from "./routes/tarefasRoutes.js";
import { paginaInicial } from "./pages/paginaInicial.js";
import { env } from "./config/env.js";

const app = express();
app.disable("x-powered-by");

app.use(logger);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send(paginaInicial);
});

// 503 sem banco, para a plataforma de hospedagem perceber a falha
app.get("/health", (_req, res) => {
  const mongo = estadoBanco();
  const ok = mongo === "conectado";
  res.status(ok ? 200 : 503).json({
    ok,
    node: process.version,
    uptime: process.uptime(),
    mongo,
    ambiente: env.nodeEnv,
  });
});

app.use("/tarefas", tarefasRoutes);
app.use(rotaNaoEncontrada);
app.use(tratarErros);

export default app;
