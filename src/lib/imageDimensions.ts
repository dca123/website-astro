import sharp from "sharp";

export async function calculateDesiredHeight(input: string, width = 1080) {
  const metadata = await sharp(input).metadata();
  if (metadata.height === undefined || metadata.width === undefined) {
    throw new Error("Could not get image dimensions");
  }
  const desiredHeight = Math.round((width / metadata.width) * metadata.height);
  return desiredHeight;
}
