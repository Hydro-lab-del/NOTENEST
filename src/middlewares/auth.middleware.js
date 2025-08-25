import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {

        // const token = req.cookies?.accessToken 
        // || req.header("Authorization")?.replace("Bearer", "").trim();
        const token =
            req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
        if (!token) {
            throw new ApiError(401, "Access token missing");
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "invalid access token");
        };

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
});