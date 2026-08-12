import roleRepository from "./role.repository.js";
import permissionRepository from "../permission/permission.repository.js";
import moduleRepository from "../module/module.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class RoleService {

  async createRole(data) {

    const existingRole = await roleRepository.findBySlug(data.slug);

    if (existingRole) {
      throw new AppError("Role slug already exists.", 409);
    }

    if (data.permissions?.length) {
      const normalized = [];
      for (const item of data.permissions) {
        const permId = typeof item === "object" ? (item.permission || item._id) : item;
        if (!permId) continue;
        const permission = await permissionRepository.findById(permId);
        if (permission) {
          normalized.push(typeof item === "object" && item.permission ? item : { permission: permId });
        }
      }
      data.permissions = normalized;
    }

    return await roleRepository.create(data);
  }

  async getAllRoles(filter = {}) {
    return await roleRepository.findAll(filter);
  }

  async getRoleById(id) {

    const role = await roleRepository.findById(id);

    if (!role) {
      throw new AppError("Role not found.", 404);
    }

    return role;
  }

  async updateRole(id, data) {

    const role = await roleRepository.findById(id);

    if (!role) {
      throw new AppError("Role not found.", 404);
    }

    if (data.permissions?.length) {
      const normalized = [];
      for (const item of data.permissions) {
        const permId = typeof item === "object" ? (item.permission || item._id) : item;
        if (!permId) continue;
        const permission = await permissionRepository.findById(permId);
        if (permission) {
          normalized.push(typeof item === "object" && item.permission ? item : { permission: permId });
        }
      }
      data.permissions = normalized;
    }

    return await roleRepository.update(id, data);
  }

  async deleteRole(id) {

    const role = await roleRepository.findById(id);

    if (!role) {
      throw new AppError("Role not found.", 404);
    }

    if (role.isSystem) {
      throw new AppError("System Role cannot be deleted.", 400);
    }

    await roleRepository.delete(id);

    return true;
  }

}

export default new RoleService();