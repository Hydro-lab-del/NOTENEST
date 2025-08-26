import { Router } from "express";
import { loginUser, registeruser, logoutUser, getCurrentUser, refreshAccessToken } from "../controlers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

router.route('/register').post(registeruser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);

router.route("/refresh-token").post(refreshAccessToken);


export default router;