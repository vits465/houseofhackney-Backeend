import { body, param, query } from "express-validator";

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

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

export const validatePhone = (
  field,
  location = "body",
  message = "Invalid phone number",
  options = {}
) => {
  const validator = getValidator(field, location);
  if (options.optional) {
    validator.optional({ nullable: true });
  }
  return validator.matches(PHONE_REGEX).withMessage(message);
};
