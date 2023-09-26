import { isFullBlock } from "@notionhq/client";
import type {
  ListBlockChildrenResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { uploadToCloudinary } from "./cloudinary";
import { getImage } from "astro/assets";
import { imageConfig } from "astro:assets";
import type { GetImageResult } from "astro";

export type Content = Awaited<ReturnType<typeof extractContent>>;

export const extractContent = async (
  blocks: ListBlockChildrenResponse,
  blogId: string,
) => {
  const transformedBlocks: Array<
    | {
        type: "paragraph" | "heading_1" | "heading_2" | "heading_3";
        content: Array<RichTextItemResponse>;
      }
    | {
        type: "code";
        content: Array<RichTextItemResponse>;
        language: string;
      }
    | {
        type: "image";
        content: {
          caption: Array<RichTextItemResponse>;
          transformedImage: GetImageResult;
        };
      }
    | {
        type: "bulleted_list_item" | "numbered_list_item";
        content: Array<Array<RichTextItemResponse>>;
      }
    | { type: "unknown"; content: string }
  > = [];

  for (let i = 0; i < blocks.results.length; i++) {
    const block = blocks.results[i];
    if (isFullBlock(block)) {
      switch (block.type) {
        case "paragraph":
          transformedBlocks.push({
            type: "paragraph",
            content: block.paragraph.rich_text,
          });
          break;
        case "heading_1":
          transformedBlocks.push({
            type: "heading_1",
            content: block.heading_1.rich_text,
          });
          break;
        case "heading_2":
          transformedBlocks.push({
            type: "heading_2",
            content: block.heading_2.rich_text,
          });
          break;
        case "heading_3":
          transformedBlocks.push({
            type: "heading_3",
            content: block.heading_3.rich_text,
          });
          break;
        case "bulleted_list_item": {
          const lastTransformedBlock =
            transformedBlocks[transformedBlocks.length - 1];

          if (lastTransformedBlock.type === "bulleted_list_item") {
            lastTransformedBlock.content = [
              ...lastTransformedBlock.content,
              block.bulleted_list_item.rich_text,
            ];
          } else {
            transformedBlocks.push({
              type: "bulleted_list_item",
              content: [block.bulleted_list_item.rich_text],
            });
          }
          break;
        }
        case "numbered_list_item": {
          const lastTransformedBlock =
            transformedBlocks[transformedBlocks.length - 1];

          if (lastTransformedBlock.type === "numbered_list_item") {
            lastTransformedBlock.content = [
              ...lastTransformedBlock.content,
              block.numbered_list_item.rich_text,
            ];
          } else {
            transformedBlocks.push({
              type: "numbered_list_item",
              content: [block.numbered_list_item.rich_text],
            });
          }
          break;
        }
        case "code": {
          transformedBlocks.push({
            type: "code",
            content: block.code.rich_text,
            language: block.code.language,
          });
          break;
        }
        case "image": {
          if (block.image.type === "file") {
            const uploadedFile = await uploadToCloudinary({
              src: block.image.file.url,
              blogId,
            });

            const transformedImage = await getImage(
              {
                src: uploadedFile.secure_url,
                width: 1080,
              },
              imageConfig,
            );
            transformedBlocks.push({
              type: "image",
              content: {
                caption: block.image.caption,

                transformedImage,
              },
            });
          } else {
            const uploadedFile = await uploadToCloudinary({
              src: block.image.external.url,
              blogId,
            });
            const transformedImage = await getImage(
              {
                src: uploadedFile.secure_url,
                width: 1080,
              },
              imageConfig,
            );
            transformedBlocks.push({
              type: "image",
              content: {
                caption: block.image.caption,

                transformedImage,
              },
            });
          }
          break;
        }
        default:
          transformedBlocks.push({ type: "unknown", content: block.type });
      }
    }
  }

  return transformedBlocks;
};
