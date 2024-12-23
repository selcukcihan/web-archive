import { convert } from "html-to-text";
import ogs from 'open-graph-scraper'

export const extractTextFromWebPage = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  return convert(html);
}

export interface HtmlMetaData {
  title: string;
  description: string;
  image: string;
}

export const extractHtmlMetaData = async (url: string) => {
  const { error, result } = await ogs({ url });
  if (error || result.ogTitle === undefined) {
    console.error('Error fetching metadata', error, result)
    return null
  }
  return {
    title: result.ogTitle,
    description: result.ogDescription || '',
    image: (result?.ogImage?.length || 0) > 0 ? result?.ogImage?.[0].url : '',
  } as HtmlMetaData;
}
