import Permission from "./permission.model.js";

class PermissionRepository {

  async create(data) {
    return await Permission.create(data);
  }

  async findById(id) {
    return await Permission.findById(id).populate("moduleId");
  }

  async findBySlug(slug) {
    return await Permission.findOne({ slug });
  }

  async findByModule(moduleId) {
    return await Permission
      .find({ moduleId })
      .sort({ sortOrder: 1 });
  }

  async findAll(filter = {}) {
    return await Permission
      .find(filter)
      .populate("moduleId")
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async update(id, data) {
    return await Permission.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
  }

  async delete(id) {
    return await Permission.findByIdAndDelete(id);
  }

}

export default new PermissionRepository();