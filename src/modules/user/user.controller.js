import BaseController from "../../shared/database/BaseController.js";
import userService from "./user.service.js";

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

// Register User
    register = async (req, res, next) => {
        try {

            const user = await this.service.registerUser(req.body);

            return res.status(201).json({
                success: true,
                message: "User registered successfully.",
                data: user,
            });

        } catch (error) {
            next(error);
        }
    };

}

export default new UserController();