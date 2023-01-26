import type {
  RichTextItemResponse,
  TextRichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { clsx } from "clsx";
import type { Content } from "../lib/notionExtracter";

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
  blocks: Content;
}) {
  return blocks.map(({ content, type }) => {
    switch (type) {
      case "paragraph":
        return <p className="pt-1">{RichTextSpan({ content: content })}</p>;
      case "heading_1":
        return (
          <h1 className="text-3xl font-light font-title pt-5">
            <RichTextSpan content={content} />
          </h1>
        );
      case "heading_2":
        return (
          <h2 className="text-2xl font-light font-title pt-4">
            <RichTextSpan content={content} />
          </h2>
        );
      case "heading_3":
        return (
          <h3 className="text-xl font-light font-title pt-2">
            <RichTextSpan content={content} />
          </h3>
        );
      case "bulleted_list_item":
        return (
          <ul className="list-disc list-inside text-white">
            {content.map((content, idx) => (
              <li key={idx}>
                <RichTextSpan content={content} />
              </li>
            ))}
          </ul>
        );
      case "numbered_list_item":
        return (
          <ol className="list-decimal list-inside text-white space-y-2">
            {content.map((content, idx) => (
              <li key={idx}>
                <span className="pl-1">
                  <RichTextSpan content={content} />
                </span>
              </li>
            ))}
          </ol>
        );
    }
  });
}
