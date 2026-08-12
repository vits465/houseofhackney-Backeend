import Module from "./module.model.js";

class ModuleRepository {

    async create(data) {
        return await Module.create(data);
    }

    async findById(id) {
        return await Module.findById(id);
    }

    async findByName(name) {
        return await Module.findOne({ name });
    }

    async findBySlug(slug) {
        return await Module.findOne({ slug });
    }

    async findAll(filter = {}) {
        return await Module
            .find(filter)
            .sort({ sortOrder: 1, createdAt: -1 });
    }

    async update(id, data) {
        return await Module.findByIdAndUpdate(
            id,
            data,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );
    }

    async delete(id) {
        return await Module.findByIdAndDelete(id);
    }

    async updateStatus(id, status) {
        return await Module.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: 'after' }
        );
    }

}

export default new ModuleRepository();