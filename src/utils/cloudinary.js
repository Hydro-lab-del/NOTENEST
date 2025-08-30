import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (profileLocalPath) => {
    try {
        if (!profileLocalPath) return null;

        const response = await cloudinary.uploader.upload(profileLocalPath, {
            resource_type: 'auto'
        });


        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);

        fs.unlinkSync(profileLocalPath)
        return response;

    } catch (error) {
        try {
            if (profileLocalPath) {
                fs.unlinkSync(profileLocalPath); //remove the locally saved temporary file as the upload operation got failed
            }
        } catch (unlinkErr) {
            console.error("Error deleting local file after Cloudinary upload failure:", unlinkErr);
        }
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw error;
    }
};


export { uploadOnCloudinary, deleteFromCloudinary };