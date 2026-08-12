import creditLimitService from "./creditLimit.service.js";
import ApiResponse from "../../../shared/responses/ApiResponse.js";

class CreditLimitController {

    // Set company credit limit (Admin)
    async setLimit(req, res, next) {
        try {
            const credit = await creditLimitService.setCreditLimit(req.user._id, req.body);

            return new ApiResponse(
                res,
                200,
                "Company credit limit configured successfully.",
                credit
            ).send();
        } catch (error) {
            next(error);
        }
    }

    // Get current user credit account
    async getMyCredit(req, res, next) {
        try {
            const credit = await creditLimitService.getUserCreditLimit(req.user._id);

            return new ApiResponse(
                res,
                200,
                "Credit account fetched successfully.",
                credit
            ).send();
        } catch (error) {
            next(error);
        }
    }

}

export default new CreditLimitController();
