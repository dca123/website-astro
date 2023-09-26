import { v2 as cloudinary } from "cloudinary";

const FOLDER_NAME = "devinda.me/blog";
export async function uploadToCloudinary(image: {
  src: string;
  blogId: string;
}) {
  console.log(`uploading ${image.src} to cloudinary`);
  const uploadedFile = await cloudinary.uploader.upload(image.src, {
    resource_type: "image",
    folder: FOLDER_NAME + "/" + image.blogId,
    use_filename: true,
    unique_filename: false,
  });
  return uploadedFile;
}
