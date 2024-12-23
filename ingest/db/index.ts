import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
// import normalizeUrl from "normalize-url";

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE ?? "10");

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

/*

WebPage:
- link: string
- originalUrl: string
- createdAt: string
- tags: string[]
- title: string
- summary: string

Tag:
- name: string

*/

export interface WebPageDetails {
  title: string;
  summary: string;
  image: string;
  tags: string[];
}

export interface UnprocessedWebPage {
  link: string;
  originalUrl: string;
}

interface IndexedWebPage {
  link: string;
  tags: string[];
}

export interface WebPage extends IndexedWebPage, UnprocessedWebPage, WebPageDetails {
  createdAt: string;
}

/**
 * Add an unprocessed web page to the database
 * @param link link of the web page
 */
export const addLink = async (originalUrl: string) => {
  // const link = normalizeUrl(originalUrl, { stripHash: true });
  const link = originalUrl;
  const existing = await getLink(link);
  if (existing) {
    return;
  }
  await ddbDocClient.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `unprocessed`,
      sk: `link#${link}`,
    },
    UpdateExpression: "SET link = :link, originalUrl = :originalUrl",
    ExpressionAttributeValues: {
      ":link": link,
      ":originalUrl": originalUrl,
    },
  }));
}

/**
 * Get all unprocessed web pages from the database
 */
export async function getUnprocessedLinks(): Promise<UnprocessedWebPage[]> {
  const result = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": { S: `unprocessed`},
      ":sk": { S: `link#` },
    },
  }));
  console.log(JSON.stringify(result, null, 2));
  return result.Items?.map((item) => ({
    link: item.link.S as string,
    originalUrl: item.originalUrl.S as string,
  })) ?? [];
}

export const updateLink = async (link: string, details: WebPageDetails) => {
  const createdAt = new Date().toISOString();
  await ddbDocClient.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `web-page#${link}`,
      sk: `web-page`,
    },
    UpdateExpression: "SET title = :title, summary = :summary, image = :image, tags = :tags, createdAt = :createdAt, link = :link, originalUrl = :originalUrl",
    ExpressionAttributeValues: {
      ":title": details.title,
      ":summary": details.summary,
      ":image": details.image,
      ":tags": details.tags,
      ":createdAt": createdAt,
      ":link": link,
      ":originalUrl": link,
    },
  }));

  await ddbDocClient.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `processed`,
      sk: `all`,
    },
    UpdateExpression: "SET #link = list_append(if_not_exists(#link, :emptyList), :newLink)",
    ExpressionAttributeNames: {
      "#link": "links",
    },
    ExpressionAttributeValues: {
      ":newLink": [link],
      ":emptyList": [],
    },
  }));

  for (const tag of details.tags) {
    await ddbDocClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `tags`,
        sk: `tag#${tag}`,
      },
      UpdateExpression: "SET #link = list_append(if_not_exists(#link, :emptyList), :newLink)",
      ExpressionAttributeNames: {
        "#link": "links",
      },
      ExpressionAttributeValues: {
        ":newLink": [link],
        ":emptyList": [],
      },
    }));
  }

  await ddbDocClient.send(new DeleteCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `unprocessed`,
      sk: `link#${link}`,
    },
  }));
}

export const getTags = async () => {
  const result = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: `tags` },
    },
  }));
  return result.Items?.map((item) => item.sk.S as string) ?? [];
}

export const getLinks = async (tagFilter: string | undefined, page: number) => {
  const links = [];
  if (tagFilter !== undefined) {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `tags`,
        sk: `tag#${tagFilter}`,
      },
    }));
    links.push(...(result.Item?.links.SS ?? []));
  } else {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `processed`,
        sk: `all`,
      },
    }));
    links.push(...(result.Item?.links.SS ?? []));
  }
  const linksInPage = links.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const linkResponses = await Promise.all(linksInPage.map((url) => getLink(url)));
  return (linkResponses.filter((link) => link !== undefined) as WebPage[])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLink(link: string): Promise<WebPage | undefined> {
  const result = await ddbDocClient.send(new GetCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `web-page#${link}`,
      sk: `web-page`,
    },
  }));
  if (!result.Item) {
    return undefined;
  }
  return {
    link,
    originalUrl: link,
    title: result.Item.title.S as string,
    summary: result.Item.summary.S as string,
    image: result.Item.image.S as string,
    tags: result.Item.tags.SS,
    createdAt: result.Item.createdAt.S as string,
  };
}
