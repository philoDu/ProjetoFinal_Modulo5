import app from "./app.js";
import { env } from "./config/env.js";
import { conectarBanco } from "./config/database.js";

try {
  await conectarBanco({
    tentativas: env.nodeEnv === "production" ? 5 : Infinity,
  });
} catch (erro) {
  console.error("[BOOT]", erro.message);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`Servidor ouvindo na porta ${env.port}`);
});
