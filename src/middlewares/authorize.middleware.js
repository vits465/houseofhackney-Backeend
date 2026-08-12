import AppError from "../shared/errors/AppError.js";

export const authorize = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      const userRoles = req.user.roles?.map((role) => role.slug?.toLowerCase()) || [];
      const requiredRoleSlugs = requiredRoles.map((role) => role.toLowerCase());

      const isAuthorized = requiredRoleSlugs.some((requiredRole) =>
        userRoles.includes(requiredRole),
      );

      if (!isAuthorized) {
        throw new AppError("Permission denied.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
