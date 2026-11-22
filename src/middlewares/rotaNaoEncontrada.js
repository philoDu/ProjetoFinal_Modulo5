export default function rotaNaoEncontrada(req, res) {
  res
    .status(404)
    .json({ erro: `Rota ${req.method} ${req.url} não encontrada.` });
}
