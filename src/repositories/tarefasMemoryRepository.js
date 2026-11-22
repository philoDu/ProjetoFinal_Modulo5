import { randomUUID } from "node:crypto";

// O "banco de dados" em memória: some quando o servidor reinicia
const tarefas = [];
let ultimoCodigo = 0;

// Devolve uma cópia, para ninguém alterar os dados guardados por fora
function copiar(tarefa) {
  return structuredClone(tarefa);
}

export const tarefasRepository = {
  async listar() {
    return tarefas.map(copiar);
  },

  async buscarPorId(id) {
    const tarefa = tarefas.find((t) => t.id === id);
    return tarefa ? copiar(tarefa) : null;
  },

  async criar(dados) {
    ultimoCodigo++;
    const agora = new Date().toISOString();
    const tarefa = {
      ...dados,
      id: randomUUID(),
      codigo: `TF-${ultimoCodigo}`,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    tarefas.push(tarefa);
    return copiar(tarefa);
  },

  async atualizar(id, dados) {
    const indice = tarefas.findIndex((t) => t.id === id);
    if (indice === -1) return null;
    tarefas[indice] = {
      ...tarefas[indice],
      ...dados,
      id,
      atualizadoEm: new Date().toISOString(),
    };
    return copiar(tarefas[indice]);
  },

  async excluir(id) {
    const indice = tarefas.findIndex((t) => t.id === id);
    if (indice === -1) return false;
    tarefas.splice(indice, 1);
    return true;
  },

  async idsExistentes(ids) {
    return ids.filter((id) => tarefas.some((t) => t.id === id));
  },

  async removerDosVinculos(id) {
    for (const tarefa of tarefas) {
      tarefa.vinculadas = (tarefa.vinculadas ?? []).filter((v) => v !== id);
    }
  },
};
