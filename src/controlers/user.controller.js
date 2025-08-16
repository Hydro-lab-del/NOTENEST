import asyncHandler from '../utils/asyncHandler.js';
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
        secure: true,         // ✅ required for HTTPS
        sameSite: 'None'      // ✅ allows cross-origin cookies
    };


    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: createdUser, accessToken, refreshToken
                },
                "User Registered and logged In successfully"
            ))


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
    const isPasswordValid = user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "invalid Password , please try again");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true,         // ✅ required for HTTPS
        sameSite: 'None'      // ✅ allows cross-origin cookies
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In successfully"
            ))


});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    console.log("User ID:", req.user?._id);
    const options = {
        httpOnly: true,
        secure: true,         // ✅ required for HTTPS
        sameSite: 'None'      // ✅ allows cross-origin cookies
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

        res.status(200).json({
            name: user.username, // or user.fullName, depending on your schema
            email: user.email,
            id: user._id
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

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
            secure: true,
            sameSite: 'None'
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access Token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

export { registeruser, loginUser, logoutUser, getCurrentUser, refreshAccessToken }




