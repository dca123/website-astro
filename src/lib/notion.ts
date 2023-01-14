import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

export const response = (block_id: string) =>
  notion.blocks.children.list({
    block_id,
  });
