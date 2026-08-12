import { Router } from "express";

import reviewController from "./review.controller.js";

import authMiddleware from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";
import validateRequest from "../../../middlewares/validateRequest.js";

import {
    createReviewValidation,
    updateReviewValidation,
    adminReplyValidation,
    updateStatusValidation,
    reviewIdParamValidation,
} from "./review.validation.js";

const router = Router({ mergeParams: true });

// Public routes
    router.get(
    "/",
    reviewController.getByProduct
);

router.get(
    "/summary",
    reviewController.getRatingSummary
);

// Authenticated user routes
    router.get(
    "/my-reviews",
    authMiddleware,
    reviewController.getMyReviews
);

router.post(
    "/",
    authMiddleware,
    createReviewValidation,
    validateRequest,
    reviewController.create
);

router.put(
    "/:id",
    authMiddleware,
    updateReviewValidation,
    validateRequest,
    reviewController.update
);

router.post(
    "/:id/like",
    authMiddleware,
    reviewIdParamValidation,
    validateRequest,
    reviewController.like
);

router.post(
    "/:id/dislike",
    authMiddleware,
    reviewIdParamValidation,
    validateRequest,
    reviewController.dislike
);

router.delete(
    "/:id",
    authMiddleware,
    reviewIdParamValidation,
    validateRequest,
    reviewController.delete
);

// Admin routes
    router.post(
    "/:id/reply",
    authMiddleware,
    authorize(["ADMIN"]),
    adminReplyValidation,
    validateRequest,
    reviewController.addReply
);

router.patch(
    "/:id/status",
    authMiddleware,
    authorize(["ADMIN"]),
    updateStatusValidation,
    validateRequest,
    reviewController.updateStatus
);

export default router;
