import permissionService from "./permission.service.js";

class PermissionController {

  async createPermission(req, res, next) {
    try {
      const permission = await permissionService.createPermission(req.body);

      return res.status(201).json({
        success: true,
        message: "Permission created successfully",
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPermissions(req, res, next) {
    try {
      const permissions = await permissionService.getAllPermissions(req.query);

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPermissionById(req, res, next) {
    try {
      const permission = await permissionService.getPermissionById(req.params.id);

      return res.status(200).json({
        success: true,
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePermission(req, res, next) {
    try {
      const permission = await permissionService.updatePermission(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Permission updated successfully",
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePermission(req, res, next) {
    try {
      await permissionService.deletePermission(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Permission deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PermissionController();