import { Router } from "express";

import mediaController from "./media.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Public
    router.get("/", mediaController.getAll);
router.get("/:id", mediaController.getById);

// Admin
    router.post(
	"/",
	authMiddleware,
	authorize(["ADMIN"]),
	mediaController.create
);

router.delete(
	"/:id",
	authMiddleware,
	authorize(["ADMIN"]),
	mediaController.delete
);

export default router;
