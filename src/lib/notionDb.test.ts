import { expect, test } from "vitest";
import { NotionDB, string, title } from "./notionDb";

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
