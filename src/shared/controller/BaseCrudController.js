class BaseCrudController {
    constructor(service) {
        this.service = service;
    }

    async getAll(req, res, next) {}
    async getById(req, res, next) {}
    async create(req, res, next) {}
    async update(req, res, next) {}
    async delete(req, res, next) {}
}