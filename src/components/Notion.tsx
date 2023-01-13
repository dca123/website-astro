import { Client, isFullBlock } from "@notionhq/client";
import type { ListBlockChildrenResponse, RichTextItemResponse, TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import { clsx } from "clsx";


const NotionColorMap: Record<
  TextRichTextItemResponse["annotations"]["color"],
  string
> = {
  blue: "text-blue-500",
  blue_background: "bg-blue-500",
  brown: "text-amber-500",
  brown_background: "bg-amber-500",
  gray: "text-gray-500",
  gray_background: "bg-gray-500",
  green: "text-green-500",
  green_background: "bg-green-500",
  orange: "text-orange-500",
  orange_background: "bg-orange-500",
  pink: "text-pink-500",
  pink_background: "bg-pink-500",
  purple: "text-purple-500",
  purple_background: "bg-purple-500",
  red: "text-red-500",
  red_background: "bg-red-500",
  yellow: "text-yellow-500",
  yellow_background: "bg-yellow-500",
  default: "text-white",
};

const RichTextSpan = (
  { content }: { content: Array<RichTextItemResponse> },
) => {
  const blocks = content.map((text) => {
    const { bold, color: notionColor, italic, code, strikethrough, underline } =
      text.annotations;
    const color = NotionColorMap[notionColor];
    return (
      <span
        key={text.plain_text}
        className={clsx(
          bold && "font-extrabold",
          italic && "italic",
          color,
          code && "bg-gray-700 text-red-300 px-2 rounded font-mono",
          strikethrough && "line-through",
          underline && "underline",
        )}
      >
        {text.plain_text}
      </span>
    );
  });

  return <>{blocks}</>;
  
};

export default function Notion({
  blocks,
}: {
  blocks: ListBlockChildrenResponse
}) {
  return blocks.results.map((block) => {
    if (isFullBlock(block)) {
      switch (block.type) {
        case "paragraph":
          return <p><RichTextSpan content={block.paragraph.rich_text}/></p>;
        case "heading_1":
          return <h1 className="text-3xl font-light"><RichTextSpan content={block.heading_1.rich_text} /></h1>;
        case "heading_2":
          return <h2 className="text-2xl font-light"><RichTextSpan content={block.heading_2.rich_text} /></h2>;
        case "heading_3":
          return <h3 className="text-xl font-light"><RichTextSpan content={block.heading_3.rich_text} /></h3>;
        case "bulleted_list_item":
          return <li className="list-disc text-white"><RichTextSpan content={block.bulleted_list_item.rich_text} /></li>;
        case "numbered_list_item":
          return <li className="list-decimal text-white"><RichTextSpan content={block.numbered_list_item.rich_text} /></li>;
        default:
          console.log(block);
          return <p className="text-white">{block.type} has not been configured </p>;
      }
    }
    return <p>Not a paragraph</p>;
  });
}
