export default function validarTarefa(req, res, next) {
    const { titulo } = req.body ?? {};
    if (typeof titulo !== 'string' || titulo.trim() === '') {
        return res.status(400).json({ erro: "O campo 'titulo' é obrigatório."})
    }
    next()
}