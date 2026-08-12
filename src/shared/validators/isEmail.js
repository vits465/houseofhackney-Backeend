import { body, param, query } from "express-validator";

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

export const validateEmail = (
  field,
  location = "body",
  message = "Invalid email address",
  options = {}
) => {
  const validator = getValidator(field, location);
  if (options.optional) {
    validator.optional({ nullable: true });
  }
  return validator.trim().isEmail().withMessage(message);
};
