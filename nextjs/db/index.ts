import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import normalizeUrl from "normalize-url";

/*
DynamoDB entities used in this project:
- unprocessed
  - link#{link}
    - link: string
    - originalUrl: string

- web-page#{link}
  - web-page
    - title: string
    - summary: string
    - image: string
    - tags: string[]
    - createdAt: string
    - link: string
    - originalUrl: string

- processed
  - all
    - links: string[]

- tags
  - tag#{tag}
    - links: string[]
*/

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE ?? "10");

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const s3 = new S3Client({
  region: "eu-west-1",
});

export interface WebPageDetails {
  title: string;
  summary: string;
  image: string;
  tags: string[];
}

interface UnprocessedWebPage {
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

export interface Tag {
  tag: string;
  count: number;
}

const checkUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

const getSortableLink = (createdAt: string, url: string) => {
  return `${createdAt}#${url}`;
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
  if (!checkUrl(link)) {
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

export const removeLink = async (link: string) => {
  const existing = await getLink(link);
  if (!existing) {
    return;
  }
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: existing.image.replace(`https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`, ""),
  }));

  await ddbDocClient.send(new DeleteCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `web-page#${link}`,
      sk: `web-page`,
    },
  }));
  for (const tag of existing.tags) {
    await ddbDocClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `tags`,
        sk: `tag#${tag}`,
      },
      UpdateExpression: "DELETE #link :link",
      ExpressionAttributeNames: {
        "#link": "links",
      },
      ExpressionAttributeValues: {
        ":link": new Set([link]),
      },
    }));
  }

  await ddbDocClient.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      pk: `processed`,
      sk: `all`,
    },
    UpdateExpression: `DELETE #link :link`,
    ExpressionAttributeNames: {
      "#link": "links",
    },
    ExpressionAttributeValues: {
      ":link": new Set([getSortableLink(existing.createdAt, link)]),
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
    UpdateExpression: "ADD #link :newLink",
    ExpressionAttributeNames: {
      "#link": "links",
    },
    ExpressionAttributeValues: {
      ":newLink": new Set([getSortableLink(createdAt, link)]),
    },
  }));

  for (const tag of details.tags) {
    await ddbDocClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `tags`,
        sk: `tag#${tag}`,
      },
      UpdateExpression: "ADD #link :newLink",
      ExpressionAttributeNames: {
        "#link": "links",
      },
      ExpressionAttributeValues: {
        ":newLink": new Set([link]),
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

export async function getTags(): Promise<Tag[]> {
  const result = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": { S: `tags`},
      ":sk": { S: `tag#` },
    },
    FilterExpression: "attribute_exists(links)",
  }));
  const tags = result.Items?.map((item) => ({
    tag: item.sk.S?.split("#")[1] as string,
    count: item.links.SS?.length as number,
  })) ?? [];
  return tags.sort((a, b) => b.count - a.count);
}

export const getLinks = async (tagFilter: string | undefined, page: number) => {
  let links: string[] = [];
  if (tagFilter !== undefined) {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `tags`,
        sk: `tag#${tagFilter}`,
      },
    }));
    links = [...(result.Item?.links ?? [])];
  } else {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `processed`,
        sk: `all`,
      },
    }));
    links = [...(result.Item?.links ?? [])]
      .sort((a, b) => a > b ? -1 : 1)
      .map((sortableLink: string) => sortableLink.split("#")[1]);
  }
  const linksInPage = links.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const linkResponses = await Promise.all(linksInPage.map((url) => getLink(url)));
  return {
    links: (linkResponses.filter((link) => link !== undefined) as WebPage[])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    totalPages: Math.ceil(links.length / PAGE_SIZE),
    totalLinks: links.length,
  };
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
    title: result.Item.title as string,
    summary: result.Item.summary as string,
    image: result.Item.image as string,
    tags: result.Item.tags,
    createdAt: result.Item.createdAt as string,
  };
}

export const storeImageOnS3 = async (imageUrl: string) => {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(imageUrl).toString("base64");

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `images/${base64}`,
    Body: new Uint8Array(buffer),
    ACL: "public-read",
  }));

  return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/images/${base64}`;
}
