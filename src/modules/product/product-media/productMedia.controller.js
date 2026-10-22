import productMediaService from "./productMedia.service.js";
import productService from "../product/product.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";
import AppError from "../../../shared/errors/AppError.js";

class ProductMediaController {

    async create(req, res, next) {
        try {
            const productId = req.body.product || req.params.productId;

            const media = await productMediaService.createMedia({
                ...req.body,
                product: productId,
                createdBy: req.user?._id,
            });

            return new ApiResponse(res, 201, "Product media created successfully.", media).send();
        } catch (error) {
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const { productId } = req.params;

            const product = (await productService.findById(productId)) || (await productService.getBySlug(productId));
            if (!product || product.deletedAt) {
                throw new AppError("Product not found.", 404);
            }

            const media = await productMediaService.getMedia(product._id);

            // Construct formatted media response
            const primaryThumbnail =
                media?.thumbnail?.secureUrl ||
                media?.thumbnail?.url ||
                product.thumbnail ||
                product.images?.[0] ||
                null;

            const seenUrls = new Set();
            const formattedGallery = [];

            if (media?.gallery && Array.isArray(media.gallery)) {
                // Sort by sortOrder
                const sortedGallery = [...media.gallery].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

                sortedGallery.forEach((item, index) => {
                    const m = item.media || item;
                    const url = m?.secureUrl || m?.url;
                    if (url && !seenUrls.has(url)) {
                        seenUrls.add(url);
                        formattedGallery.push({
                            _id: item._id,
                            media: {
                                _id: m._id,
                                url: m.url || url,
                                secureUrl: m.secureUrl || url,
                                altText: m.altText || product.name,
                                caption: m.caption || product.name,
                                folder: m.folder || "",
                            },
                            isPrimary: item.isPrimary ?? (index === 0),
                            sortOrder: item.sortOrder ?? index,
                        });
                    }
                });
            }

            // If gallery was empty, populate from product.images
            if (formattedGallery.length === 0 && Array.isArray(product.images)) {
                product.images.forEach((imgUrl, index) => {
                    if (imgUrl && !seenUrls.has(imgUrl)) {
                        seenUrls.add(imgUrl);
                        formattedGallery.push({
                            media: {
                                url: imgUrl,
                                secureUrl: imgUrl,
                                altText: `${product.name} image ${index + 1}`,
                                caption: product.name,
                            },
                            isPrimary: index === 0,
                            sortOrder: index,
                        });
                    }
                });
            }

            const responseData = {
                product: product._id,
                thumbnail: {
                    url: primaryThumbnail,
                    secureUrl: primaryThumbnail,
                    altText: `${product.name} main image`,
                },
                gallery: formattedGallery,
                images: Array.from(seenUrls),
                videos: media?.videos || [],
                documents: media?.documents || [],
            };

            return new ApiResponse(res, 200, "Product media fetched successfully.", responseData).send();
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const media = await productMediaService.updateMedia(
                req.params.productId,
                {
                    ...req.body,
                    updatedBy: req.user?._id,
                }
            );

            return new ApiResponse(res, 200, "Product media updated successfully.", media).send();
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await productMediaService.deleteMedia(
                req.params.productId,
                req.user?._id
            );

            return new ApiResponse(res, 200, "Product media deleted successfully.").send();
        } catch (error) {
            next(error);
        }
    }

}

export default new ProductMediaController();