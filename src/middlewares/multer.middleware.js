import multer from "multer";
import path from "path";

const _dirname = path.resolve();

const storage = multer.diskStorage({
    destination:function(req, file , cb){
        const uploadPath = path.join(_dirname, "public", "temp");
        cb(null, uploadPath);
    },
    filename:function(req, file, cb){
        cb(null, file.originalname)
    }
});

export const upload = multer({
    storage: storage,
})