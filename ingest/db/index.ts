import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import normalizeUrl from "normalize-url";

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

export async function getTags(): Promise<Tag[]> {
  const result = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": { S: `tags`},
      ":sk": { S: `tag#` },
    },
  }));
  const tags = result.Items?.map((item) => ({
    tag: item.sk.S?.split("#")[1] as string,
    count: item.links.SS?.length as number,
  })) ?? [];
  return tags.sort((a, b) => b.count - a.count);
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
    links.push(...(result.Item?.links ?? []));
  } else {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `processed`,
        sk: `all`,
      },
    }));
    links.push(...(result.Item?.links ?? []));
  }
  const linksInPage = links.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const linkResponses = await Promise.all(linksInPage.map((url) => getLink(url)));
  return {
    links: (linkResponses.filter((link) => link !== undefined) as WebPage[])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    totalPages: Math.ceil(links.length / PAGE_SIZE)
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
