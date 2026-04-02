import axios from "axios";

const SYSTEM_PROMPT = `
Extract structured product search filters from user query.

Return JSON only:
{
  "category": string | null,
  "color": string | null,
  "maxPrice": number | null,
  "keywords": string[]
}
`;

// OpenAI Parser
const parseWithOpenAI = async (query) => {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    },
  );

  const content = res.data.choices[0].message.content;
  return JSON.parse(content);
};

// Ollama Parser (Local LLM)
const parseWithOllama = async (query) => {
  const res = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
    model: process.env.OLLAMA_MODEL,
    prompt: `${SYSTEM_PROMPT}\nUser Query: ${query}`,
    stream: false,
  });

  return JSON.parse(res.data.response);
};

//Main AI Parser with fallback
export const aiParseQuery = async (query) => {
  const provider = process.env.AI_PROVIDER;

  try {
    if (provider === "openai") {
      return await parseWithOpenAI(query);
    }

    if (provider === "ollama") {
      return await parseWithOllama(query);
    }

    throw new Error("Invalid AI provider");
  } catch (error) {
    console.error("⚠️ AI parsing failed, fallback to rule-based");

    // fallback
    const { parseQuery } = await import("./parser.js");
    return parseQuery(query);
  }
};
