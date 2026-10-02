import crypto from "crypto";
import jwt from "jsonwebtoken";
import jwtConfig from "../../../config/jwt.js";

class TokenService {
  #createToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn });
  }

  #verifyToken(token, secret) {
    return jwt.verify(token, secret);
  }

  generateTokenPair(payload) {
    const accessToken = this.#createToken(
      payload,
      jwtConfig.accessSecret,
      jwtConfig.accessExpiresIn || "1d"
    );

    const refreshToken = this.#createToken(
      payload,
      jwtConfig.refreshSecret,
      jwtConfig.refreshExpiresIn || "30d"
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    return this.#verifyToken(token, jwtConfig.accessSecret);
  }

  verifyRefreshToken(token) {
    return this.#verifyToken(token, jwtConfig.refreshSecret);
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  compareTokenHash(token, hash) {
    const computedHash = this.hashToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(hash)
    );
  }
}

export default new TokenService();
