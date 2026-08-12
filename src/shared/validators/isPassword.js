import { body, param, query } from "express-validator";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

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

export const validatePassword = (
  field,
  location = "body",
  message = "Invalid password",
  options = {}
) => {
  const validator = getValidator(field, location);
  if (options.optional) {
    validator.optional({ nullable: true });
  }
  return validator.matches(PASSWORD_REGEX).withMessage(message);
};
