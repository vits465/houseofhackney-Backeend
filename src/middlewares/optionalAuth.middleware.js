import tokenService from "../modules/auth/token/token.service.js";
import userService from "../modules/user/user.service.js";

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
            return next();
        }

        let token = authorization.slice(7).trim();
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1).trim();
        }

        if (!token) {
            return next();
        }

        const payload = tokenService.verifyAccessToken(token);
        if (payload?.sub) {
            const user = await userService.findById(payload.sub);
            if (user && user.status === "ACTIVE") {
                req.user = user;
                req.token = token;
                req.jwtPayload = payload;
            }
        }
        return next();
    } catch {
        // Silently proceed for optional auth if token is expired or invalid
        return next();
    }
};

export default optionalAuthMiddleware;
