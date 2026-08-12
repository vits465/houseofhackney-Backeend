import tokenService from "../modules/auth/token/token.service.js";
import userService from "../modules/user/user.service.js";
import AppError from "../shared/errors/AppError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError("Authorization header is required.", 401);
    }

    if (!authorization.toLowerCase().startsWith("bearer ")) {
      throw new AppError("Invalid authorization format.", 401);
    }

    let token = authorization.slice(7).trim();

    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1).trim();
    }

    if (!token) {
      throw new AppError("Authorization token is required.", 401);
    }

    const payload = tokenService.verifyAccessToken(token);

    const user = await userService.findById(payload.sub);

    if (!user) {
      throw new AppError("User not found.", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("User account is inactive.", 403);
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new AppError("Session expired. Please login again.", 401);
    }

    req.user = user;
    req.token = token;
    req.jwtPayload = payload;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new AppError("Invalid or expired authorization token.", 401));
    }

    next(error);
  }
};

export default authMiddleware;