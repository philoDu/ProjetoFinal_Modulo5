import { Router } from "express";
import validarTarefa from "../middlewares/validarTarefa.js";
import * as controller from "../controllers/tarefasController.js";

const router = Router();

router.get("/", controller.listar);
router.post("/", validarTarefa, controller.criar);
router.get("/:id", controller.buscar);
router.patch("/:id", controller.atualizar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.excluir);

export default router;
