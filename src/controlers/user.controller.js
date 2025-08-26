import asyncHandler from '../utils/asyncHandler.js';
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the access and refresh tokens")
    }
};


const registeruser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (
        [username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    };
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists.")
    };
    const user = await User.create(
        {
            username,
            email,
            password
        }
    );

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const createdUser = await User.findById(
        user._id
    ).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registring the user")
    };

    const options = {
        httpOnly: true,
        secure: true,        // for HTTPS only
        sameSite: "Lax",    // allows cross-site cookies
        maxAge: parseInt(process.env.COOKIE_EXPIRY) || 7 * 24 * 60 * 60 * 1000 // fallback: 7 days
    };


    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: createdUser,
                    accessToken
                },
                "User Registered and logged In successfully"
            ))


});

// uploadProfilePic
const uploadProfilePic = asyncHandler(async (req, res) => {
    const profileLocalPath = req.file?.path;

    if (!profileLocalPath) {
        throw new ApiError(400, "Profile pic file is missing");
    }

    const profilePic = await uploadOnCloudinary(profileLocalPath);

    if (!profilePic || !profilePic.secure_url || !profilePic.public_id) {
        throw new ApiError(400, "Error while uploading to Cloudinary");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // delete old pic if exists
    if (user.profilePic?.public_id) {
        await deleteFromCloudinary(user.profilePic.public_id);
    }

    // update new pic
    user.profilePic = {
        url: profilePic.secure_url,
        public_id: profilePic.public_id
    };

    const updatedUser = await user.save();

    const safeUser = await User.findById(updatedUser._id)
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, safeUser, "Profile picture updated successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, " Email required");
    };

    const user = await User.findOne(
        { $or: [{ username }, { email }] }
    );
    if (!user) {
        throw new ApiError(404, "User does not exists")
    };
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password , please try again");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true,        // for HTTPS only
        sameSite: "Lax",    // allows cross-site cookies
        maxAge: parseInt(process.env.COOKIE_EXPIRY) || 7 * 24 * 60 * 60 * 1000 // fallback: 7 days
    };



    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken
                },
                "User logged In successfully"
            ))


});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );
    console.log("User ID:", req.user?._id);
    const options = {
        httpOnly: true,
        secure: true,        // for HTTPS only
        sameSite: "Lax",    // allows cross-site cookies
        maxAge: parseInt(process.env.COOKIE_EXPIRY) || 7 * 24 * 60 * 60 * 1000 // fallback: 7 days
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logout Successfully")
        )
});


const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json(
            new ApiResponse(200, {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic?.url || null
            }, "Fetched current user successfully")
        );


    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unathorized request")
    };

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        };

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "refresh token  expired or already used")
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);


        const options = {
            httpOnly: true,
            secure: true,        // for HTTPS only
            sameSite: "Lax",    // allows cross-site cookies
            maxAge: parseInt(process.env.COOKIE_EXPIRY) || 7 * 24 * 60 * 60 * 1000 // fallback: 7 days
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken
                    },
                    "Access Token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "All  fields are required!")
    };

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { username, email: email }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated Successfully")
        )
});

export { registeruser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, updateAccountDetails, uploadProfilePic }




