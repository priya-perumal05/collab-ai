import { GoogleGenAI, Type } from "@google/genai";
import { User, Task } from "../types";
/* Support both AI Studio's injected process.env AND standard local Vite import.meta.env */ const getApiKey = () => {
  return typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY
    // @ts-ignore
    : import.meta.env.VITE_GEMINI_API_KEY;
};

let aiClient: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
  if (!aiClient) {
    const key = getApiKey();
    if (!key) {
      console.error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY or GEMINI_API_KEY.");
      aiClient = new GoogleGenAI({ apiKey: "dummy_key_to_prevent_crash_check_console" });
    } else {
      aiClient = new GoogleGenAI({ apiKey: key as string });
    }
  }
  return aiClient;
};
const withRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.status === 429 || error?.message?.includes("429") || error?.message?.toLowerCase().includes("rate") || error?.message?.toLowerCase().includes("quota"))) {
      console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const geminiService = {
  async suggestTeams(projectDescription: string, members: User[]) {
    const prompt = ` Project Description: ${projectDescription} Team Members: ${members.map((m) => `- ${m.name} (${m.role}): Skills: ${m.skills?.join(", ") || "Not specified"}, Department: ${m.department}`).join("\n")} Based on the project description and member skills/roles, suggest optimal sub-teams. For each team, provide: 1. Team Name 2. Purpose 3. Members (with why they were chosen) `;
    const response = await withRetry(() => getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert team builder. Output MUST be highly structured with H3 headings and bullet points. AVOID paragraphs. Keep it 'short and sweet'. Each team should be a clear, visually distinct section.",
      },
    }));
    return response.text;
  },
  async monitorWorkload(members: User[], tasks: Task[]) {
    const workloadData = members.map((m) => {
      const userTasks = tasks.filter((t) => t.assignees.includes(m.id));
      return {
        name: m.name,
        productivity: m.productivityScore,
        tasks: userTasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          progress: t.progress,
          deadline: t.deadline,
        })),
      };
    });
    const prompt = ` Current Workload Data: ${JSON.stringify(workloadData, null, 2)} Identify overloaded and underutilized members. Recommend task redistribution to balance the load more effectively. Consider task priority, deadlines, and member productivity scores. `;
    const response = await withRetry(() => getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a workload management expert. Output MUST be highly structured using H3 headings and bullet points. AVOID long paragraphs. Use 'Status: OK/WARNING/CRITICAL' for each person. Keep it extremely concise.",
      },
    }));
    return response.text;
  },
  async generateDocumentation(tasks: Task[], projectContext: string) {
    const prompt = ` Project Context: ${projectContext} Current Tasks and Progress: ${tasks.map((t) => `- ${t.title} (${t.status}): ${t.progress}% done. Deadline: ${t.deadline}`).join("\n")} Generate a professional project documentation/weekly status report. Include: 1. Executive Summary 2. Key Achievements 3. Pending Tasks and Blockers 4. Next Steps `;
    const response = await withRetry(() => getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a professional technical writer. Generate documentation using ONLY H3 headings and short, nested bullet points. NO PARAGRAPHS. Focus on speed of reading and clarity.",
      },
    }));
    return response.text;
  },
};
