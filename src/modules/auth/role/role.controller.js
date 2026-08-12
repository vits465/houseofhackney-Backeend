import roleService from "./role.service.js";

class RoleController {

  async createRole(req, res, next) {
    try {

      const role = await roleService.createRole(req.body);

      return res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role,
      });

    } catch (error) {
      next(error);
    }
  }

  async getAllRoles(req, res, next) {
    try {

      const roles = await roleService.getAllRoles(req.query);

      return res.status(200).json({
        success: true,
        data: roles,
      });

    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {

      const role = await roleService.getRoleById(req.params.id);

      return res.status(200).json({
        success: true,
        data: role,
      });

    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {

      const role = await roleService.updateRole(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role,
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {

      await roleService.deleteRole(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Role deleted successfully",
      });

    } catch (error) {
      next(error);
    }
  }

}

export default new RoleController();