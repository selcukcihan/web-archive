import { archive } from './db';
import data from './seed.json';

const runLoop = async () => {
  for (const link of data) {
    await archive(link);
  }
}

runLoop();
