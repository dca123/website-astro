import { Client, isFullPage } from "@notionhq/client";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type OutputProperties = PageObjectResponse["properties"]["string"];
type OString = Extract<OutputProperties, { type?: "rich_text" }>;
type OTitle = Extract<OutputProperties, { type?: "title" }>;

export class NotionDB<S extends Record<string, (data: string) => any>> {
  client: Client;
  databaseId: string;
  schema: S;

  constructor(config: { databaseId: string; schema: S }) {
    this.client = new Client({
      auth: import.meta.env.NOTION_API_KEY,
    });
    this.databaseId = config.databaseId;
    this.schema = config.schema;
  }

  async insert<T extends { [P in keyof S]: Parameters<S[P]>[0] }>(data: T) {
    const transformedData = this.schemaToNotion(data);
    const response = await this.client.pages.create({
      parent: {
        type: "database_id",
        database_id: this.databaseId,
      },
      properties: transformedData,
    });

    console.dir(response, { depth: null });
    type A = {
      [P in keyof S]: S[P] extends ReturnType<typeof string>
        ? OString
        : S[P] extends ReturnType<typeof title>
          ? OTitle
          : never;
    };
    if (isFullPage(response)) {
      return response as Omit<PageObjectResponse, "properties"> & {
        properties: A;
      };
    }
    throw new Error("Not full page");
  }

  schemaToNotion<T extends { [P in keyof S]: Parameters<ReturnType<S[P]>>[0] }>(
    data: T,
  ) {
    const res = {};

    for (const [key, value] of Object.entries(data)) {
      const transformer = this.schema[key];
      res[key] = transformer(value);
    }

    return res as CreatePageParametersProperties;
  }
}

type CreatePageParametersProperties = Extract<
  CreatePageParameters,
  { parent: { type?: "database_id"; database_id: string } }
>["properties"];

type Properties =
  CreatePageParametersProperties[keyof CreatePageParametersProperties];

type Title = Extract<Properties, { type?: "title" }>;

export function title() {
  return (data: string) => {
    return {
      title: [
        {
          type: "text",
          text: {
            content: data,
          },
        },
      ],
    } satisfies Title;
  };
}
type String = Extract<Properties, { type?: "rich_text" }>;

export function string() {
  return (data: string) => {
    return {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: {
            content: data,
          },
        },
      ],
    } satisfies String;
  };
}
