import { Router } from "express";
import counterController from "./counter.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Generate SKU (admin)
router.post(
    "/generate",
    authMiddleware,
    authorize(["ADMIN"]),
    counterController.generateSku
);

export default router;
