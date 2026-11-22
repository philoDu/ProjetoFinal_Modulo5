import * as tarefasService from "../services/tarefasService.js";

export async function listar(_req, res) {
  res.json(await tarefasService.listar());
}

export async function buscar(req, res) {
  res.json(await tarefasService.buscarPorId(req.params.id));
}

export async function criar(req, res) {
  const tarefa = await tarefasService.criar(req.body);
  res.status(201).json(tarefa);
}

export async function atualizar(req, res) {
  res.json(await tarefasService.atualizar(req.params.id, req.body));
}

export async function substituir(req, res) {
  res.json(await tarefasService.substituir(req.params.id, req.body));
}

export async function excluir(req, res) {
  await tarefasService.excluir(req.params.id);
  res.status(204).send();
}
