import { Client, isFullPage, } from "@notionhq/client";

export const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

export const response = (block_id: string) =>
  notion.blocks.children.list({
    block_id,
  });


export const slugs = async (database_id: string) => {
  const database = await notion.databases.query({
    database_id,
  });

  return database.results.map(page => {
    if (isFullPage(page)) {
      const slug = page.properties.slug
      if (slug.type !== 'rich_text') throw new Error(`Slug is not defined for page ${page.id}`);
      return { slug: slug.rich_text[0].plain_text, page_id: page.id }
    } else {
      throw new Error('Page is not a full page')
    }
  })

}