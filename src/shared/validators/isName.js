import { body, param, query } from "express-validator";

const NAME_REGEX = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/;

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

export const validateName = (
  field,
  location = "body",
  message = "Invalid name",
  options = {}
) => {
  const validator = getValidator(field, location);
  if (options.optional) {
    validator.optional({ nullable: true });
  }
  return validator.matches(NAME_REGEX).withMessage(message);
};
