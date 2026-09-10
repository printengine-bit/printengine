import { v2 as cloudinary } from "cloudinary";

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configure() {
  if (!cloudinaryConfigured()) throw new Error("Artwork storage is not configured.");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadArtwork(file: string, filename?: string) {
  configure();
  const result = await cloudinary.uploader.upload(file, {
    folder: "printengine/artwork",
    type: "authenticated",
    resource_type: "image",
    use_filename: Boolean(filename),
    filename_override: filename,
    unique_filename: true,
  });
  return {
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

export async function uploadProductImage(file:string,filename?:string){configure();const result=await cloudinary.uploader.upload(file,{folder:"printengine/products",type:"upload",resource_type:"image",use_filename:Boolean(filename),filename_override:filename,unique_filename:true,overwrite:false});return {url:result.secure_url,publicId:result.public_id,format:result.format,width:result.width,height:result.height};}

export function signedArtworkUrl(publicId: string, format?: string) {
  configure();
  return cloudinary.url(publicId, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    resource_type: "image",
    format,
  });
}

export function artworkProxyUrl(publicId: string, format?: string) {
  const query = new URLSearchParams({ publicId });
  if (format) query.set("format", format);
  return `/api/assets/view?${query.toString()}`;
}
