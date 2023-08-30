import { isFullBlock } from "@notionhq/client";
import type { ListBlockChildrenResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

export type Content = Awaited<ReturnType<typeof extractContent>>;

export const extractContent = async (blocks: ListBlockChildrenResponse) => {
  const transformedBlocks: Array<{
    type: 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3'
    content: Array<RichTextItemResponse>
  } | {
    type: 'bulleted_list_item' | 'numbered_list_item'
    content: Array<Array<RichTextItemResponse>>
  }> = [];

  for (let i = 0; i < blocks.results.length; i++) {
    const block = blocks.results[i];
    if (isFullBlock(block)) {
      switch (block.type) {
        case "paragraph":
          transformedBlocks.push(
            { type: "paragraph", content: block.paragraph.rich_text },
          );
          break;
        case "heading_1":
          transformedBlocks.push(
            { type: "heading_1", content: block.heading_1.rich_text },
          );
          break;
        case "heading_2":
          transformedBlocks.push(
            { type: "heading_2", content: block.heading_2.rich_text },
          );
          break;
        case "heading_3":
          transformedBlocks.push(
            { type: "heading_3", content: block.heading_3.rich_text },
          );
          break;
        case "bulleted_list_item": {
          const lastTransformedBlock =
            transformedBlocks[transformedBlocks.length - 1];

          if (lastTransformedBlock.type === "bulleted_list_item") {
            lastTransformedBlock.content = [...lastTransformedBlock.content, block.bulleted_list_item.rich_text]
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
            lastTransformedBlock.content = [...lastTransformedBlock.content, block.numbered_list_item.rich_text]
          } else {
            transformedBlocks.push({
              type: "numbered_list_item",
              content: [block.numbered_list_item.rich_text],
            });
          }
          break;
        }
      }
    }
  }

  return transformedBlocks;
}