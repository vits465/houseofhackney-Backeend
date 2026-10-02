class BaseRepository {

    constructor(model, defaultPopulate = null) {
        this.model = model;
        this.defaultPopulate = defaultPopulate;
    }

    _applyPopulate(query, populate) {
        const pop = populate !== undefined ? populate : this.defaultPopulate;
        if (pop && query && typeof query.populate === "function") {
            query.populate(pop);
        }
        return query;
    }

// Create
    async create(data) {
        const doc = await this.model.create(data);
        if (this.defaultPopulate && doc && doc._id) {
            const populated = await this.findById(doc._id);
            return populated || doc;
        }
        return doc;
    }

// Bulk Create
    async bulkCreate(data = []) {
        return await this.model.insertMany(data);
    }

// Find One
    async findOne(filter = {}, projection = null, options = {}) {
        const { populate, sort, skip, limit, ...opts } = options || {};
        const query = this.model.findOne(filter, projection, opts);
        if (sort) query.sort(sort);
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
        return await this._applyPopulate(query, populate);
    }

// Find By ID
    async findById(id, projection = null, options = {}) {
        const { populate, ...opts } = options || {};
        const query = this.model.findById(id, projection, opts);
        return await this._applyPopulate(query, populate);
    }

// Find All
    async findAll(filter = {}, projection = null, options = {}) {
        const { populate, sort, skip, limit, ...opts } = options || {};
        const query = this.model.find(filter, projection, opts);
        if (sort) query.sort(sort);
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
        return await this._applyPopulate(query, populate);
    }

// Find Active
    async findActive(filter = {}, projection = null, options = {}) {
        return await this.findAll(
            {
                ...filter,
                status: "ACTIVE",
                deletedAt: null,
            },
            projection,
            options
        );
    }

// Update By ID
    async update(id, data, options = {}) {
        const { populate, ...opts } = options || {};
        const query = this.model.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
                ...opts,
            }
        );
        return await this._applyPopulate(query, populate);
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
            populate = this.defaultPopulate,
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