import { Client, isFullBlock } from "@notionhq/client";
import type { TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import { clsx } from "clsx";

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY
});

const response = await notion.blocks.children.list({
  block_id: "063279a74b4c44ceb1d08849a1b39068",
});

const formatColorsToTailwind = (
  notionColor: TextRichTextItemResponse["annotations"]["color"],
) => {
  if (notionColor === "default") return "text-white";
  let color: string = notionColor;
  if (notionColor.endsWith("_background")) {
    color = color.replace("_background", "");
    return `bg-${color}-500`;
  }
  return `text-${color}-500`;
};

export default function Notion() {
  return response.results.map((block) => {
    if (isFullBlock(block)) {
      switch (block.type) {
        case "paragraph":
          const blocks = block.paragraph.rich_text.map((text) => {
            const { bold, color: notionColor, italic } = text.annotations;
            const color = formatColorsToTailwind(notionColor);
            console.log(color);
            return (
              <span
                className={clsx(
                  bold && "font-extrabold",
                  italic && "italic",
                  color,
                )}
              >
                {text.plain_text}
              </span>
            );
          });
          return blocks;
      }
    }
    return <p>Not a paragraph</p>;
  });
}
