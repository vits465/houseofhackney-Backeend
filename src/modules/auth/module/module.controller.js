import moduleService from "./module.service.js";

class ModuleController {
  // Create Module
  async createModule(req, res, next) {
    try {
      const module = await moduleService.createModule(req.body);

      return res.status(201).json({
        success: true,
        message: "Module created successfully",
        data: module,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get All Modules
  async getAllModules(req, res, next) {
    try {
      const modules = await moduleService.getAllModules(req.query);

      return res.status(200).json({
        success: true,
        count: modules.length,
        data: modules,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Module By ID
  async getModuleById(req, res, next) {
    try {
      const module = await moduleService.getModuleById(req.params.id);

      return res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update Module
  async updateModule(req, res, next) {
    try {
      const module = await moduleService.updateModule(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Module updated successfully",
        data: module,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete Module
  async deleteModule(req, res, next) {
    try {
      await moduleService.deleteModule(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Module deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ModuleController();
