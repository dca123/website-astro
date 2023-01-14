import { Client, isFullPage } from "@notionhq/client";

export const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

export const response = (block_id: string) =>
  notion.blocks.children.list({
    block_id,
  });

export const getProjects = async (database_id: string) => {
  const database = await notion.databases.query({
    database_id,
  });

  return database.results.map((page) => {
    if (isFullPage(page)) {
      console.log(page.properties);
      const slug = page.properties.slug;
      const name = page.properties.name;
      const description = page.properties.description;
      const skills = page.properties.skills;

      if (slug.type !== "rich_text") {
        throw new Error(`Slug is not defined for page ${page.id}`);
      }
      if (name.type !== "title") {
        throw new Error(`Name is not defined for page ${page.id}`);
      }
      if (description.type !== "rich_text") {
        throw new Error(`Description is not defined for page ${page.id}`);
      }

      if (skills.type !== "multi_select") {
        throw new Error(`Skills is not defined for page ${page.id}`);
      }

      return {
        slug: slug.rich_text[0].plain_text,
        page_id: page.id,
        title: name.title[0].plain_text,
        description: description.rich_text[0].plain_text,
        skills: skills.multi_select.map(skill => skill.name).slice(0, 3),
      };
    } else {
      throw new Error("Page is not a full page");
    }
  });
};
