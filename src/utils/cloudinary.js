import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadImage(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        Readable.from(buffer).pipe(stream);
    });
}

export function destroyImage(publicId) {
    cloudinary.uploader.destroy(publicId).catch((error) => {
        console.error("failed to destroy cloudinary image:", error);
    });
}
