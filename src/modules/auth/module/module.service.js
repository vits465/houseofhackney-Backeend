import moduleRepository from "./module.repository.js";
import AppError from "../../../shared/errors/AppError.js";

class ModuleService {

    async createModule(data) {

        // Check duplicate name
        const existingName = await moduleRepository.findByName(data.name);

        if (existingName) {
            throw new AppError("Module name already exists.", 409);
        }

        // Check duplicate slug
        const existingSlug = await moduleRepository.findBySlug(data.slug);

        if (existingSlug) {
            throw new AppError("Module slug already exists.", 409);
        }

        // Save Module
        const module = await moduleRepository.create(data);

        return module;
    }

    async getAllModules(filter = {}) {
        return await moduleRepository.findAll(filter);
    }

    async getModuleById(id) {

        const module = await moduleRepository.findById(id);

        if (!module) {
            throw new AppError("Module not found.", 404);
        }

        return module;
    }

    async updateModule(id, data) {

        const module = await moduleRepository.findById(id);

        if (!module) {
            throw new AppError("Module not found.", 404);
        }

        return await moduleRepository.update(id, data);
    }

    async deleteModule(id) {

        const module = await moduleRepository.findById(id);

        if (!module) {
            throw new AppError("Module not found.", 404);
        }

        if (module.isSystem) {
            throw new AppError("System module cannot be deleted.", 400);
        }

        await moduleRepository.delete(id);

        return true;
    }

}

export default new ModuleService();