class BaseService {

    constructor(repository) {
        this.repository = repository;
    }

// Create
    async create(data) {
        return await this.repository.create(data);
    }

// Bulk Create
    async bulkCreate(data = []) {
        return await this.repository.bulkCreate(data);
    }

// Find By ID
    async findById(id) {
        return await this.repository.findById(id);
    }

// Find All
    async findAll(filter = {}, projection = null, options = {}) {
        return await this.repository.findAll(filter, projection, options);
    }

// Find Active
    async findActive(filter = {}) {
        return await this.repository.findActive(filter);
    }

// Update
    async update(id, data) {
        return await this.repository.update(id, data);
    }

// Delete
    async delete(id) {
        return await this.repository.delete(id);
    }

// Soft Delete
    async softDelete(id, data = {}) {
        return await this.repository.softDelete(id, data);
    }

// Restore
    async restore(id) {
        return await this.repository.restore(id);
    }

// Count
    async count(filter = {}) {
        return await this.repository.count(filter);
    }

// Exists
    async exists(filter = {}) {
        return await this.repository.exists(filter);
    }

// Bulk Delete
    async bulkDelete(ids = []) {
        return await this.repository.bulkDelete(ids);
    }

// Pagination
    async paginate(filter = {}, options = {}) {
        return await this.repository.paginate(filter, options);
    }

}

export default BaseService;