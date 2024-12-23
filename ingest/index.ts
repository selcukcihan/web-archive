import { extractTags, summarize } from "./ai";
import { extractHtmlMetaData } from "./html";
import { addLink, getUnprocessedLinks, updateLink } from "./db";

const links = [
  "https://www.allthingsdistributed.com/2024/12/tech-predictions-for-2025-and-beyond.html",
  "https://netflixtechblog.com/netflixs-distributed-counter-abstraction-8d0c45eb66b2",
  "https://aws.amazon.com/blogs/aws/top-announcements-of-aws-reinvent-2024/"
]

console.log(process.env);

const runLoop = async () => {
  for (const link of links) {
    console.log(`Adding ${link}`);
    await addLink(link);

  }

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
    console.log(`Saving ${link.link}`);
    await updateLink(link.link, {
      title: metadata.title,
      summary,
      image: metadata.image,
      tags,
    });
  }
}
// summarize(process.argv[2]).then(_ => extractTags(process.argv[2]));

runLoop();
