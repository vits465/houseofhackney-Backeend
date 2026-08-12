class BaseRepository {

    constructor(model) {
        this.model = model;
    }

// Create
    async create(data) {
        return await this.model.create(data);
    }

// Bulk Create
    async bulkCreate(data = []) {
        return await this.model.insertMany(data);
    }

// Find One
    async findOne(filter = {}, projection = null, options = {}) {
        return await this.model.findOne(filter, projection, options);
    }

// Find By ID
    async findById(id, projection = null, options = {}) {
        return await this.model.findById(id, projection, options);
    }

// Find All
    async findAll(filter = {}, projection = null, options = {}) {
        return await this.model.find(filter, projection, options);
    }

// Find Active
    async findActive(filter = {}) {

        return await this.model.find({
            ...filter,
            status: "ACTIVE",
            deletedAt: null,
        });

    }

// Update By ID
    async update(id, data, options = {}) {

        return await this.model.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
                ...options,
            }
        );

    }

// Update One
    async updateOne(filter, data, options = {}) {
        return await this.model.updateOne(filter, data, options);
    }

// Delete
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

// Delete One
    async deleteOne(filter) {
        return await this.model.deleteOne(filter);
    }

// Soft Delete
    async softDelete(id, data = {}) {

        return await this.model.findByIdAndUpdate(
            id,
            {
                deletedAt: new Date(),
                ...data,
            },
            {
                new: true,
                runValidators: true,
            }
        );

    }

// Restore
    async restore(id) {

        return await this.model.findByIdAndUpdate(
            id,
            {
                deletedAt: null,
            },
            {
                new: true,
            }
        );

    }

// Exists
    async exists(filter = {}) {
        return await this.model.exists(filter);
    }

// Count
    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }

// Bulk Delete
    async bulkDelete(ids = []) {

        return await this.model.deleteMany({
            _id: {
                $in: ids,
            },
        });

    }

// Pagination
    async paginate(filter = {}, options = {}) {

        const {
            page = 1,
            limit = 10,
            sort = { createdAt: -1 },
            populate = "",
            projection = null,
        } = options;

        const skip = (page - 1) * limit;

        const query = this.model
            .find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        if (populate) {
            query.populate(populate);
        }

        const [data, total] = await Promise.all([
            query,
            this.count(filter),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

    }

}

export default BaseRepository;