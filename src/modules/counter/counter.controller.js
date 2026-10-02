import counterService from "./counter.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";

class CounterController {

    async generateSku(req, res, next) {
        try {
            const productType = req.body.productType || "WALLPAPER";
            const sku = await counterService.generateSku(productType);

            return new ApiResponse(res, 200, "SKU generated successfully.", { sku }).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new CounterController();
