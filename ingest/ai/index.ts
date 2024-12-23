import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromWebPage } from "../html";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function summarize(url: string) {
  const text = await extractTextFromWebPage(url);
  // const prompt = "What is the main idea in the following body of text taken from a web page \n" + text;
  const prompt = "Read and analyze the content of this web page. Provide a concise and clear summary, capturing the main ideas, key points, and essential details without additional commentary or framing.\n" + text;
  const result = await model.generateContent([prompt]);
  const retval = result.response.text();
  console.log(retval);
  return retval;
}

export async function extractTags(url: string): Promise<string[]> {
  const text = await extractTextFromWebPage(url);
  const prompt = "Extract the main topics and themes from the following body of text taken from a web page. Provide them as comma separated values. \n" + text;
  const result = await model.generateContent([prompt]);
  const retval = result.response.text();
  console.log(retval);
  return retval.split(",").map((tag: string) => tag.trim().toLowerCase());
}
