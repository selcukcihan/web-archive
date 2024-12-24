import { archive } from './db';

const link = process.argv[3];
console.log(`Archiving ${link}`);
archive(link);
