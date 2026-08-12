import AppError from "../shared/errors/AppError.js";

const permission = (requiredPermission) => {

    return (req, res, next) => {

        try {

            if (!req.user) {
                throw new AppError("Unauthorized.", 401);
            }

            const hasPermission = req.user.roles.some(role =>

                role.permissions.some(item =>
                    item.permission &&
                    item.permission.slug === requiredPermission
                )

            );

            if (!hasPermission) {
                throw new AppError("Permission denied.", 403);
            }

            next();

        } catch (error) {

            next(error);

        }

    };

};

export default permission;