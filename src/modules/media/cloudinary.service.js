import cloudinary from "../../config/cloudinary.js";

class CloudinaryService {

    async upload(buffer, folder) {

        return new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(

                {
                    folder,
                    resource_type: "image",
                },

                (error, result) => {

                    if (error) {

                        return reject(error);

                    }

                    resolve(result);

                }

            );

            stream.end(buffer);

        });

    }

    async delete(publicId) {

        return await cloudinary.uploader.destroy(publicId);

    }

}

export default new CloudinaryService();