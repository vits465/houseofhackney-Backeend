import { Router } from "express";

import wishlistController from "./wishlist.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    addItemValidation,
    removeItemValidation,
} from "./wishlist.validation.js";

const router = Router();

// All wishlist operations require authentication
    router.use(authMiddleware);

router.get(
    "/",
    wishlistController.getWishlist
);

router.post(
    "/",
    addItemValidation,
    validateRequest,
    wishlistController.add
);

router.delete(
    "/:productId",
    removeItemValidation,
    validateRequest,
    wishlistController.remove
);

router.delete(
    "/",
    wishlistController.clear
);

export default router;
