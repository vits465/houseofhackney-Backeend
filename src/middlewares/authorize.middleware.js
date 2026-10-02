import AppError from "../shared/errors/AppError.js";

export const authorize = (rolesInput = []) => {
  const requiredRoles = Array.isArray(rolesInput) ? rolesInput : [rolesInput];
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      const userRoles = req.user.roles?.map((role) => (typeof role === "string" ? role.toLowerCase() : role.slug?.toLowerCase())) || [];
      const requiredRoleSlugs = requiredRoles.map((role) => String(role).toLowerCase());

      const isAuthorized = requiredRoleSlugs.some((requiredRole) =>
        userRoles.includes(requiredRole) || userRoles.includes("super_admin") || userRoles.includes("super-admin") || userRoles.includes("admin")
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
