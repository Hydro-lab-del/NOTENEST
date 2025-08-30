import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

const _dirname = path.resolve();

const storage = multer.diskStorage({
    destination: function (_, file, cb) {
        const uploadPath = path.join(_dirname, "public", "temp");
        cb(null, uploadPath);
    },
    filename: function (_, file, cb) {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Get original file extension
        cb(null, file.fieldname + '_' + uniqueSuffix + ext);


    }
});
const fileFilter = (_, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    }
    else {
        cb(new ApiError(400, "Only .png, .jpg and .jpeg allowed"), false);
    }
}
export const upload = multer({
    storage: storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});