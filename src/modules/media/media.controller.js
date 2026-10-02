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
			const body = {
				filename: req.body.filename || req.file?.filename || "sample_" + Date.now() + ".jpg",
				originalName: req.body.originalName || req.file?.originalname || "sample.jpg",
				mimeType: req.body.mimeType || req.file?.mimetype || "image/jpeg",
				url: req.body.url || "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
				secureUrl: req.body.secureUrl || req.body.url || "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
				publicId: req.body.publicId || "sample_" + Date.now(),
				folder: req.body.folder || "house_of_hackney",
				createdBy: req.user?._id,
				...req.body,
			};
			const media = await mediaService.create(body);
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
