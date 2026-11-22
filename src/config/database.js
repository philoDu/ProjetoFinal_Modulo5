import mongoose from "mongoose";
import { env } from "./env.js";

const estados = ["desconectado", "conectado", "conectando", "desconectando"];

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function conectarBanco({
  tentativas = 5,
  intervaloMs = 3000,
} = {}) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("[MONGO] Conectado com sucesso");
      return;
    } catch (erro) {
      const total = Number.isFinite(tentativas) ? `/${tentativas}` : "";
      console.error(
        `[MONGO] Tentativa ${tentativa}${total} falhou:`,
        erro.message,
      );
      if (tentativa < tentativas) await esperar(intervaloMs);
    }
  }
  throw new Error("Não foi possível conectar ao MongoDB.");
}

export function estadoBanco() {
  return estados[mongoose.connection.readyState];
}
