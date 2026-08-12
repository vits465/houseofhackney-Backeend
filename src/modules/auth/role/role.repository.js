import Role from "./role.model.js";

class RoleRepository {

  async create(data) {
    return await Role.create(data);
  }

  async findById(id) {
    return await Role.findById(id)
      .populate("permissions.permission");
  }

  async findBySlug(slug) {
    return await Role.findOne({ slug });
  }

  async findOne(filter = {}) {
    return await Role.findOne(filter);
  }

  async findAll(filter = {}) {
    return await Role.find(filter)
      .populate("permissions.permission")
      .sort({ priority: 1 });
  }

  async update(id, data) {
    return await Role.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
  }

  async delete(id) {
    return await Role.findByIdAndDelete(id);
  }

}

export default new RoleRepository();