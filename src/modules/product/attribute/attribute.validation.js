import { body } from "express-validator";

import { validateMongoId } from "../../../shared/validators/isMongoId.js";

// Attribute
    export const
    createAttributeValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Attribute name is required"),

    body("inputType")
        .optional()
        .isString(),

];

export const updateAttributeValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid attribute id"
    ),

];

export const deleteAttributeValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid attribute id"
    ),

];

export const getAttributeValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid attribute id"
    ),

];

// Attribute Values
    export const
    addValueValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid attribute id"
    ),

    body("label")
        .trim()
        .notEmpty()
        .withMessage("Value label is required"),

];

export const updateValueValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid attribute id"
    ),

    validateMongoId(
        "valueId",
        "param",
        "Invalid value id"
    ),

];

export const deleteValueValidation = [

    validateMongoId(
        "id",
        "param",
        "Invalid attribute id"
    ),

    validateMongoId(
        "valueId",
        "param",
        "Invalid value id"
    ),

];