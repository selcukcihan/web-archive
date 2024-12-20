import { links, Link } from './data'

const ITEMS_PER_PAGE = 10

export async function getLinks(tag?: string | null, page: number = 1): Promise<{ links: Link[], totalPages: number }> {
  let filteredLinks = tag ? links.filter(link => link.tags.includes(tag)) : links;
  
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  const paginatedLinks = filteredLinks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLinks.length / ITEMS_PER_PAGE);

  return { links: paginatedLinks, totalPages };
}

interface TagCount {
  tag: string;
  count: number;
}

export async function getTags(): Promise<TagCount[]> {
  const tagCounts: { [key: string]: number } = {};
  
  // Count occurrences of each tag
  links.forEach(link => {
    link.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Convert to array and sort by count descending
  const sortedTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return sortedTags;
}

