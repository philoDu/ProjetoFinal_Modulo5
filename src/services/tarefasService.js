import { tarefasRepository } from "../repositories/tarefasMongoRepository.js";
import { AppError } from "../utils/AppError.js";
import { TIPOS, STATUS, PRIORIDADES } from "../constants/tarefa.js";

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// Campos que o cliente pode enviar; o resto (id, codigo, datas do sistema) é ignorado
const CAMPOS_EDITAVEIS = [
  "tipo",
  "titulo",
  "descricao",
  "projeto",
  "status",
  "prioridade",
  "responsaveis",
  "dataInicio",
  "dataEntrega",
  "pontos",
  "vinculadas",
  "solucao",
];

function filtrarCampos(dados) {
  return Object.fromEntries(
    Object.entries(dados ?? {}).filter(([campo]) =>
      CAMPOS_EDITAVEIS.includes(campo),
    ),
  );
}

function dataDaqui(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

function dataValida(texto) {
  if (!FORMATO_DATA.test(texto)) return false;
  const [ano, mes, dia] = texto.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

function temAteDuasCasas(numero) {
  const centesimos = numero * 100;
  return Math.abs(centesimos - Math.round(centesimos)) < 1e-9;
}

// RN13: pontos guardados em centésimos, convertidos na entrada e na saída
function paraArmazenamento(tarefa) {
  return {
    ...tarefa,
    pontos: tarefa.pontos == null ? null : Math.round(tarefa.pontos * 100),
  };
}

function paraSaida(tarefa) {
  return {
    ...tarefa,
    pontos: tarefa.pontos == null ? null : tarefa.pontos / 100,
  };
}

function normalizar(tarefa) {
  if (typeof tarefa.titulo === "string") {
    tarefa.titulo = tarefa.titulo.trim();
  }
  return tarefa;
}

function validar(tarefa) {
  if (!TIPOS.includes(tarefa.tipo)) {
    throw new AppError(`Tipo inválido. Use: ${TIPOS.join(", ")}.`);
  }
  if (!STATUS.includes(tarefa.status)) {
    throw new AppError(`Status inválido. Use: ${STATUS.join(", ")}.`);
  }
  if (!PRIORIDADES.includes(tarefa.prioridade)) {
    throw new AppError(`Prioridade inválida. Use: ${PRIORIDADES.join(", ")}.`);
  }
  if (typeof tarefa.titulo !== "string" || !tarefa.titulo.trim()) {
    throw new AppError("O título é obrigatório.");
  }
  if (tarefa.titulo.length > 120) {
    throw new AppError("O título deve ter no máximo 120 caracteres.");
  }
  if (!tarefa.dataEntrega) {
    throw new AppError("A data de entrega é obrigatória.");
  }
  for (const campo of ["dataInicio", "dataEntrega"]) {
    if (tarefa[campo] && !dataValida(tarefa[campo])) {
      throw new AppError(
        `O campo '${campo}' deve ser uma data válida no formato AAAA-MM-DD.`,
      );
    }
  }
  // RN05
  if (tarefa.dataInicio && tarefa.dataEntrega < tarefa.dataInicio) {
    throw new AppError(
      "A data de entrega não pode ser anterior à data de início.",
    );
  }
  // RN12
  if (tarefa.pontos != null) {
    if (
      typeof tarefa.pontos !== "number" ||
      tarefa.pontos < 0 ||
      !temAteDuasCasas(tarefa.pontos)
    ) {
      throw new AppError(
        "Os pontos devem ser um número não negativo, com até duas casas decimais.",
      );
    }
  }
  for (const campo of ["responsaveis", "vinculadas"]) {
    if (!Array.isArray(tarefa[campo])) {
      throw new AppError(`O campo '${campo}' deve ser uma lista.`);
    }
  }
  // RN10
  if (tarefa.id && tarefa.vinculadas.includes(tarefa.id)) {
    throw new AppError("Uma tarefa não pode ser vinculada a si mesma.");
  }
  // RN14
  const temSolucao =
    typeof tarefa.solucao === "string" && tarefa.solucao.trim() !== "";
  if (
    tarefa.tipo === "chamado" &&
    tarefa.status === "concluida" &&
    !temSolucao
  ) {
    throw new AppError(
      "Um chamado só pode ser concluído com a solução preenchida.",
    );
  }
}

// RN15
function aplicarConclusao(nova, anterior) {
  if (nova.status === "concluida" && anterior?.status !== "concluida") {
    nova.concluidaEm = new Date().toISOString();
  }
  if (nova.status !== "concluida") {
    nova.concluidaEm = null;
  }
}

export async function listar() {
  const tarefas = await tarefasRepository.listar();
  return tarefas.map(paraSaida);
}

export async function buscarPorId(id) {
  const tarefa = await tarefasRepository.buscarPorId(id);
  if (!tarefa) throw new AppError("Tarefa não encontrada.", 404);
  return paraSaida(tarefa);
}

export async function criar(dados) {
  // RN01 e RN03: valores padrão; o que o cliente enviar substitui os padrões
  const tarefa = {
    tipo: "tarefa",
    descricao: "",
    projeto: null, // (futuro) obrigatório quando existirem projetos
    status: "a-fazer",
    prioridade: "media",
    responsaveis: [],
    dataInicio: null,
    dataEntrega: dataDaqui(30),
    pontos: null,
    vinculadas: [],
    solucao: "",
    ...filtrarCampos(dados),
  };
  normalizar(tarefa);
  validar(tarefa);
  aplicarConclusao(tarefa, null);
  const criada = await tarefasRepository.criar(paraArmazenamento(tarefa));
  return paraSaida(criada);
}

export async function atualizar(id, dados) {
  const atual = await tarefasRepository.buscarPorId(id);
  if (!atual) throw new AppError("Tarefa não encontrada.", 404);

  const anterior = paraSaida(atual);
  const nova = { ...anterior, ...filtrarCampos(dados) };
  normalizar(tarefa);
  validar(tarefa);
  aplicarConclusao(nova, anterior);

  const atualizada = await tarefasRepository.atualizar(
    id,
    paraArmazenamento(nova),
  );
  return paraSaida(atualizada);
}

export async function excluir(id) {
  const excluiu = await tarefasRepository.excluir(id);
  if (!excluiu) throw new AppError("Tarefa não encontrada.", 404);
  await tarefasRepository.removerDosVinculos(id); // RN11
}
