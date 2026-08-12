import { body } from "express-validator";
import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const createVariantValidation = [

    validateMongoId(
        "product",
        "body",
        "Invalid product id"
    ),

    body("name")
        .trim()
        .notEmpty(),

];

export const updateVariantValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid variant id"
    ),

];

export const deleteVariantValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid variant id"
    ),

];

export const getVariantValidation = [

    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),

];