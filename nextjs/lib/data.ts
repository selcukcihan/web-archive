import { getLinks as getLinksFromDb, WebPage } from "../db";


export interface Link extends WebPage {
  url: string;
  id: string;
}

export async function getLinks(tag?: string, page: number = 1): Promise<{ links: Link[], totalPages: number, totalLinks: number }> {
  const links = await getLinksFromDb(tag, page - 1);
  return {
    links: links.links.map((l) => ({
      ...l,
      id: l.link,
      url: l.link,
    })),
    totalPages: links.totalPages,
    totalLinks: links.totalLinks,
  }
}
