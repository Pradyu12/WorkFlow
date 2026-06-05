import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set. Add it to your .env.local file.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function chat(prompt: string, context?: string): Promise<string> {
  const client = getClient();
  const fullPrompt = context
    ? `Context:\n${context}\n\nUser: ${prompt}`
    : prompt;

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: fullPrompt,
  });
  return response.text || "";
}

export async function generateTaskSuggestions(
  projectName: string,
  existingTitles: string[]
): Promise<string[]> {
  const prompt = `Suggest 5 new task titles for the project "${projectName}".
Existing tasks: ${existingTitles.join(", ")}.
Return ONLY a JSON array of strings, nothing else.`;

  const text = await chat(prompt);
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const lines = text
      .split("\n")
      .map((l) => l.replace(/^[\d. \-*]+/, "").trim())
      .filter(Boolean);
    return lines.slice(0, 5);
  }
}

export async function generateTaskDescription(title: string): Promise<string> {
  const prompt = `Write a concise, actionable task description for: "${title}".
Return ONLY the description text, 1-2 sentences.`;

  return chat(prompt);
}

export async function suggestPriority(title: string, description: string): Promise<"low" | "medium" | "high"> {
  const prompt = `Given this task:
Title: "${title}"
Description: "${description}"

Suggest a priority: "low", "medium", or "high".
Return ONLY the word: low, medium, or high.`;

  const text = await chat(prompt);
  const cleaned = text.toLowerCase().trim();
  if (cleaned.includes("high")) return "high";
  if (cleaned.includes("medium")) return "medium";
  return "low";
}

export async function generateSprintSummary(
  tasks: { title: string; status: string; priority: string; assignee: string }[]
): Promise<string> {
  const taskList = tasks
    .map((t) => `- [${t.status}] ${t.title} (${t.priority}, ${t.assignee})`)
    .join("\n");

  const prompt = `Summarize this sprint's progress based on the following tasks.
Give a brief overview, highlight blockers, and suggest focus areas.

${taskList}`;

  return chat(prompt);
}
