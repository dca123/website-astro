import { expect, test } from "vitest";
import { NotionDB, select, string, title } from "./notionDb";

test("inserts title to page", async () => {
  const client = new NotionDB({
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      Name: title(),
    },
  });

  const name = "Hello World";
  const response = await client.insert({
    Name: name,
  });

  expect(response.properties.Name.title[0].plain_text).toBe(name);
});

test("inserts string to page", async () => {
  const client = new NotionDB({
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      summary: string(),
    },
  });

  const summary = "Hello, here is a summary";
  const response = await client.insert({
    summary,
  });

  expect(response.properties.summary.rich_text[0].plain_text).toBe(summary);
});

test("inserts select to page", async () => {
  const client = new NotionDB({
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      whitespace: select(["hello", "world"]),
    },
  });

  const response = await client.insert({
    whitespace: "hello",
  });

  expect(response.properties.whitespace.select?.name).toBe("hello");
});
