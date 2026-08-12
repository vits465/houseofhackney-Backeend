import jwt from "jsonwebtoken";
import jwtConfig from "../../../config/jwt.js";

const createToken = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, { expiresIn });

const verifyToken = (token, secret) => jwt.verify(token, secret);

const generateTokenPair = (payload) => {
  const accessToken = createToken(
    payload,
    jwtConfig.accessSecret,
    jwtConfig.accessExpiresIn,
  );

  const refreshToken = createToken(
    payload,
    jwtConfig.refreshSecret,
    jwtConfig.refreshExpiresIn,
  );

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) =>
  verifyToken(token, jwtConfig.accessSecret);

const verifyRefreshToken = (token) =>
  verifyToken(token, jwtConfig.refreshSecret);

export default {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};