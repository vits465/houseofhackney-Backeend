import BaseRepository from "../../../shared/database/BaseRepository.js";
import Permission from "./permission.model.js";
import { PERMISSION_POPULATE } from "../../../shared/populate/auth.populate.js";

class PermissionRepository extends BaseRepository {

  constructor() {
    super(Permission, PERMISSION_POPULATE);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug });
  }

  async findByModule(moduleId) {
    return await this.findAll(
      { moduleId },
      null,
      { sort: { sortOrder: 1 } }
    );
  }

  async findAll(filter = {}, projection = null, options = {}) {
    return await super.findAll(filter, projection, {
      sort: { sortOrder: 1, createdAt: -1 },
      ...options,
    });
  }

}

export default new PermissionRepository();