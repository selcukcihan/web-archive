import { getLinks as getLinksFromDb, getTags as getTagsFromDb, WebPage, Tag } from "../../ingest/db";

export async function getLinks(tag?: string, page: number = 1): Promise<{ links: WebPage[], totalPages: number }> {
  const { links, totalPages } = await getLinksFromDb(tag, page - 1);
  
  return { links, totalPages };
}

export async function getTags(): Promise<Tag[]> {
  return await getTagsFromDb();
}
