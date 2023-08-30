import { Client, isFullBlock, isFullPage } from "@notionhq/client";
import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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
      const { slug, name, description, skills, date } = page.properties;
      const { cover } = page;

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

      if (!cover || cover.type !== "external") {
        throw new Error(`Cover is not defined for page ${page.id}`);
      }

      if (date.type !== "date" || date.date === null) {
        throw new Error(`Date is not defined for page ${page.id}`);
      }

      return {
        slug: slug.rich_text[0].plain_text,
        page_id: page.id,
        title: name.title[0].plain_text,
        description: description.rich_text[0].plain_text,
        skills: skills.multi_select.map((skill) => skill.name).slice(0, 3),
        cover: cover.external.url,
        date: date.date.start,
      };
    } else {
      throw new Error("Page is not a full page");
    }
  });
};

export const getAlbums = async (database_id: string) => {
  const database = await notion.databases.query({
    database_id,
  });

  return database.results.map((page) => {
    if (isFullPage(page)) {
      const { name, description, date, slug } = page.properties;
      const { cover } = page;

      if (name.type !== "title") {
        throw new Error(`Name is not defined for page ${page.id}`);
      }
      if (description.type !== "rich_text") {
        throw new Error(`Description is not defined for page ${page.id}`);
      }
      if (date.type !== "date" || date.date === null) {
        throw new Error(`Date is not defined for page ${page.id}`);
      }
      if (slug.type !== "rich_text") {
        throw new Error(`Slug is not defined for page ${page.id}`);
      }
      if (!cover || cover.type !== "external") {
        throw new Error(`Cover is not defined for page ${page.id}`);
      }

      return {
        id: page.id,
        slug: slug.rich_text[0].plain_text,
        src: cover.external.url,
        alt: `Photo ${page.id}`,
        name: name.title[0].plain_text,
        description: description.rich_text[0].plain_text,
        date: date.date.start,
      };
    } else {
      throw new Error("Page is not a full page");
    }
  });
};

export const getPhotos = async (page_id: string) => {
  const pageBlocks = await notion.blocks.children.list({
    block_id: page_id,
  });
  const databaseBlock = pageBlocks.results.find(
    (block) => isFullBlock(block) && block.type === "child_database",
  ) as BlockObjectResponse | undefined;
  if (!databaseBlock) {
    throw new Error("Database not found");
  }
  const database = await notion.databases.query({
    database_id: databaseBlock.id,
  });

  return database.results.map((page) => {
    if (isFullPage(page)) {
      const { name, src, aspectRatio } = page.properties;
      if (name.type !== "title") {
        throw new Error(`Name is not defined for page ${page.id}`);
      }
      if (src.type !== "url" || src.url === null) {
        throw new Error(`Src is not defined for page ${page.id}`);
      }
      if (aspectRatio.type !== "select" || aspectRatio.select === null) {
        throw new Error(`Aspect Ratio is not defined for page ${page.id}`);
      }

      return {
        id: page.id,
        src: src.url,
        alt: `Photo ${page.id}`,
        name: name.title[0].plain_text,
        aspectRatio: aspectRatio.select.name as `${number}:${number}`,
      };
    } else {
      throw new Error("Page is not a full page");
    }
  });
};

export type Images = Awaited<ReturnType<typeof getPhotos>>;
