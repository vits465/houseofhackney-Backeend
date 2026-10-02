import BaseRepository from "../../../shared/database/BaseRepository.js";
import Role from "./role.model.js";
import { ROLE_POPULATE } from "../../../shared/populate/auth.populate.js";

class RoleRepository extends BaseRepository {

  constructor() {
    super(Role, ROLE_POPULATE);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug });
  }

  async findAll(filter = {}, projection = null, options = {}) {
    return await super.findAll(filter, projection, {
      sort: { priority: 1 },
      ...options,
    });
  }

}

export default new RoleRepository();