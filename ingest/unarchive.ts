import { removeLink } from "../nextjs/db";

const link = process.argv[3];
console.log(`Unarchiving ${link}`);

removeLink(link);
