import { validateMongoId } from "../../../shared/validators/isMongoId.js";

export const createProductMediaValidation = [

    validateMongoId(
        "product",
        "body",
        "Invalid product id",
        { optional: true }
    ),

    validateMongoId(
        "productId",
        "param",
        "Invalid product id",
        { optional: true }
    ),

    validateMongoId(
        "thumbnail",
        "body",
        "Invalid thumbnail",
        { optional: true }
    ),

];

export const updateProductMediaValidation = [

    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),

];

export const deleteProductMediaValidation = [

    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),

];

export const getProductMediaValidation = [

    validateMongoId(
        "productId",
        "param",
        "Invalid product id"
    ),

];