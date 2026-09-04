import multer from "multer";

function imagesOnly(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("only image uploads are allowed"));
    }
    cb(null, true);
}

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imagesOnly,
});
