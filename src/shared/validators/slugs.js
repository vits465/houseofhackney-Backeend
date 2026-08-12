import { body, param, query } from "express-validator";

const SLUG_REGEX = /^[a-z0-9-]+$/;
const MODULE_SLUG_REGEX = /^[a-z0-9.-]+$/;

const validatorMap = {
  body,
  param,
  query,
};

function getValidator(field, location) {
  const creator = validatorMap[location];
  if (!creator) {
    throw new Error(`Unsupported validator location: ${location}`);
  }
  return creator(field);
}

export const validateSlug = (
  field,
  location = "body",
  message = "Invalid slug",
  options = {}
) => {
  const validator = getValidator(field, location);
  if (options.optional) {
    validator.optional({ nullable: true });
  }
  return validator.matches(SLUG_REGEX).withMessage(message);
};

export const validatePermissionSlug = (
  field,
  location = "body",
  message = "Invalid slug",
  options = {}
) => {
  const validator = getValidator(field, location);
  if (options.optional) {
    validator.optional({ nullable: true });
  }
  return validator.matches(MODULE_SLUG_REGEX).withMessage(message);
};
