import path from "path";

import mediaService from "./media.service.js";
import cloudinaryService from "./cloudinary.service.js";

class UploadService {

    async upload(file, folder, uploadedBy = null) {

        const result = await cloudinaryService.upload(
            file.buffer,
            folder
        );

        return await mediaService.create({

            fileName: result.public_id,

            originalName: file.originalname,

            mimeType: file.mimetype,

            extension: path.extname(file.originalname),

            size: file.size,

            width: result.width,

            height: result.height,

            format: result.format,

            publicId: result.public_id,

            url: result.url,

            secureUrl: result.secure_url,

            folder,

            uploadedBy,

        });

    }

}

export default new UploadService();