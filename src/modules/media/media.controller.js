import mediaService from "./media.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";

class MediaController {

	async getAll(req, res, next) {
		try {
			const items = await mediaService.findAll();
			return new ApiResponse(res, 200, "Media fetched successfully.", items).send();
		} catch (error) {
			next(error);
		}
	}

	async getById(req, res, next) {
		try {
			const item = await mediaService.findById(req.params.id);
			return new ApiResponse(res, 200, "Media fetched successfully.", item).send();
		} catch (error) {
			next(error);
		}
	}

	async create(req, res, next) {
		try {
			const media = await mediaService.create({ ...req.body, uploadedBy: req.user?._id });
			return new ApiResponse(res, 201, "Media uploaded successfully.", media).send();
		} catch (error) {
			next(error);
		}
	}

	async delete(req, res, next) {
		try {
			await mediaService.softDelete(req.params.id, { updatedBy: req.user?._id });
			return new ApiResponse(res, 200, "Media deleted successfully.").send();
		} catch (error) {
			next(error);
		}
	}

}

export default new MediaController();
