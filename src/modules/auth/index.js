import express from "express";
import moduleRoutes from "./module/index.js";
import roleRoutes from "./role/index.js";
import permissionRoutes from "./permission/index.js";
import authRoutes from "./auth/index.js";
import { sessionService } from "./session/index.js";
import { tokenService } from "./token/index.js";
import { otpService } from "./otp/index.js";

const router = express.Router();

router.use("/modules", moduleRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);

export default router;
export { authRoutes, sessionService, tokenService, otpService };
