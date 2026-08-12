import permissionRepository from "./permission.repository.js";
import moduleRepository from "../module/module.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class PermissionService {

  // Create Permission
  async createPermission(data) {

    // Check Module Exists
    const module = await moduleRepository.findById(data.moduleId);

    if (!module) {
      throw new AppError("Module not found.", 404);
    }

    // Check Duplicate Slug
    const existingSlug = await permissionRepository.findBySlug(data.slug);

    if (existingSlug) {
      throw new AppError("Permission slug already exists.", 409);
    }

    return await permissionRepository.create(data);
  }

  // Get All Permissions
  async getAllPermissions(filter = {}) {
    return await permissionRepository.findAll(filter);
  }

  // Get Permission By Id
  async getPermissionById(id) {

    const permission = await permissionRepository.findById(id);

    if (!permission) {
      throw new AppError("Permission not found.", 404);
    }

    return permission;
  }

  // Update Permission
  async updatePermission(id, data) {

    const permission = await permissionRepository.findById(id);

    if (!permission) {
      throw new AppError("Permission not found.", 404);
    }

    if (data.slug && data.slug !== permission.slug) {

      const slugExists = await permissionRepository.findBySlug(data.slug);

      if (slugExists) {
        throw new AppError("Permission slug already exists.", 409);
      }
    }

    return await permissionRepository.update(id, data);
  }

  // Delete Permission
  async deletePermission(id) {

    const permission = await permissionRepository.findById(id);

    if (!permission) {
      throw new AppError("Permission not found.", 404);
    }

    if (permission.isSystem) {
      throw new AppError("System permission cannot be deleted.", 400);
    }

    await permissionRepository.delete(id);

    return true;
  }

}

export default new PermissionService();