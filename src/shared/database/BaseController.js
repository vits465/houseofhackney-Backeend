class BaseController {

    constructor(service) {
        this.service = service;
    }

    // Create record
    create = async (req, res, next) => {
        try {
            const data = await this.service.create(req.body);

            return res.status(201).json({
                success: true,
                message: "Created successfully.",
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    // Get all records
    getAll = async (req, res, next) => {
        try {
            const data = await this.service.findAll();

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    // Get record by ID
    getById = async (req, res, next) => {
        try {
            const data = await this.service.findById(req.params.id);

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    // Update record by ID
    update = async (req, res, next) => {
        try {
            const data = await this.service.update(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Updated successfully.",
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    // Delete record by ID
    delete = async (req, res, next) => {
        try {
            await this.service.delete(req.params.id);

            return res.status(200).json({
                success: true,
                message: "Deleted successfully.",
            });
        } catch (error) {
            next(error);
        }
    };

}

export default BaseController;