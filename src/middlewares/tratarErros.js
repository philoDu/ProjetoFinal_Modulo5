import { AppError } from "../utils/AppError.js";

export default function tratarErros(erro, _req, res, _next) {
  if (erro instanceof AppError) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  if (erro.name === "ValidationError") {
    return res.status(400).json({
      erro: "Dados inválidos.",
      campos: Object.keys(erro.errors),
    });
  }

  if (erro.name === "CastError") {
    return res.status(400).json({
      erro: "Dados inválidos.",
      campos: [erro.path],
    });
  }

  if (erro.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ erro: "O corpo da requisição não é um JSON válido." });
  }

  console.error("[ERRO]", erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
}
