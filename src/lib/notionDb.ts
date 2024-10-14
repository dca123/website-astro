import { Client, isFullPage } from "@notionhq/client";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type NonNullableObj<T> = { [K in keyof T]: NonNullable<T[K]> };

type OutputProperties = PageObjectResponse["properties"]["string"];
type OString = Extract<OutputProperties, { type?: "rich_text" }>;
export type OTitle = Extract<OutputProperties, { type?: "title" }>;
type OSelect = NonNullableObj<Extract<OutputProperties, { type?: "select" }>>;
type ODate = NonNullableObj<Extract<OutputProperties, { type?: "date" }>>;

export class NotionDB<
  S extends Record<
    string,
    | ReturnType<typeof title>
    | ReturnType<typeof string>
    | ReturnType<typeof select>
    | ReturnType<typeof date>
  >,
  A = {
    [P in keyof S]: S[P] extends ReturnType<typeof string>
      ? OString
      : S[P] extends ReturnType<typeof title>
        ? OTitle
        : S[P] extends ReturnType<typeof select>
          ? OSelect
          : S[P] extends ReturnType<typeof date>
            ? ODate
            : never;
  },
> {
  private client: Client;
  private databaseId: string;
  private schema: S;

  constructor(config: { databaseId: string; schema: S; client: Client }) {
    this.client = config.client;
    this.databaseId = config.databaseId;
    this.schema = config.schema;
  }

  async insert<T extends { [P in keyof S]: Parameters<S[P]["insert"]>[0] }>(
    data: T,
  ) {
    const transformedData = this.schemaToNotion(data);
    const response = await this.client.pages.create({
      parent: {
        type: "database_id",
        database_id: this.databaseId,
      },
      properties: transformedData,
    });

    console.dir(response, { depth: null });
    if (isFullPage(response)) {
      return response as Omit<PageObjectResponse, "properties"> & {
        properties: A;
      };
    }
    throw new Error("Not full page");
  }

  async findAll() {
    const response = await this.client.databases.query({
      database_id: this.databaseId,
    });
    const results = response.results.map((r) => {
      if (isFullPage(r)) {
        return this.notionToSchema(r);
      }
      throw new Error(`${r.id} is not a full page`);
    });

    console.log(results);
    return results;
  }

  private notionToSchema(data: PageObjectResponse) {
    const res = {};

    for (const [key, value] of Object.entries(data.properties)) {
      const transformer = this.schema[key].read as (data: any) => any;
      if (transformer === undefined)
        throw new Error("Tranformer not defined yet");
      res[key] = transformer(value);
    }

    return res as {
      [K in keyof S]: ReturnType<S[K]["read"]>;
    };
  }

  private schemaToNotion<
    T extends { [P in keyof S]: Parameters<S[P]["insert"]>[0] },
  >(data: T) {
    const res = {};

    for (const [key, value] of Object.entries(data)) {
      const transformer = this.schema[key].insert;
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
  return {
    insert: (data: string) => {
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
    },
    read: (data: OTitle) => data.title[0].plain_text,
  };
}

type String = Extract<Properties, { type?: "rich_text" }>;
export function string() {
  return {
    insert: (data: string) => {
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
    },
    read: (data: OString) => data.rich_text[0].plain_text,
  };
}

type Select = Extract<Properties, { type?: "select" }>;
export function select<const T extends string>(options: Array<T>) {
  return {
    insert: <F extends T>(data: F) => {
      return {
        type: "select",
        select: {
          name: data,
        } satisfies Select["select"],
      };
    },
    read: (data: OSelect) => data.select.name as T,
  };
}

type NDate = Extract<Properties, { type?: "date" }>;
export function date() {
  return {
    insert: (data: Date) => {
      return {
        type: "date",
        date: {
          start: data.toISOString(),
        },
      } satisfies NDate;
    },
    read: (data: ODate) => new Date(data.date.start),
  };
}
