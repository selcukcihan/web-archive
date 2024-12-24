import { getLinks as getLinksFromDb, getTags as getTagsFromDb, WebPage, Tag } from "../db";

export async function getLinks(tag?: string, page: number = 1): Promise<{ links: WebPage[], totalPages: number, totalLinks: number }> {
  return await getLinksFromDb(tag, page - 1);
}

export async function getTags(): Promise<Tag[]> {
  return await getTagsFromDb();
}
