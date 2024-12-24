import { extractTags, summarize } from "../ai";
import { extractHtmlMetaData } from "../html";
import { addLink, getUnprocessedLinks, updateLink, storeImageOnS3 } from "../../nextjs/db";

export const archive = async (link: string) => {
  console.log(`Archiving ${link}`);
  await addLink(link);
  const unprocessed = await getUnprocessedLinks();
  console.log(JSON.stringify(unprocessed, null, 2));
  for (const link of unprocessed) {
    console.log(`Processing ${link.link}`);
    const metadata = await extractHtmlMetaData(link.link);
    if (!metadata) {
      console.error(`Error processing ${link.link}`);
      continue;
    }
    const summary = await summarize(link.link);
    const tags = await extractTags(link.link);
    const imageLink = metadata.image ? await storeImageOnS3(metadata.image) : undefined;

    console.log(`Saving ${link.link}`);
    await updateLink(link.link, {
      title: metadata.title,
      summary,
      image: imageLink || '',
      tags,
    });
  }
}
