import { GithubRepoInfo, AiGeneratedSections, FetchedFile } from '../types';

const OPENROUTER_API_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free"; // "mistralai/mistral-7b-instruct:free"; //
const APP_NAME = "GitHub README Generator";
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'; // Or your app's deployed URL

const commonHeaders = (apiKey: string) => ({
  "Authorization": `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "HTTP-Referer": SITE_URL,
  "X-Title": APP_NAME,
});

export const generateDescriptionWithAI = async (
  apiKey: string, 
  projectName: string, 
  currentDescription?: string | null
): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenRouter API Key is not configured. Cannot generate description.");
  }

  let userMessageContent = `Generate a concise and engaging project description (1-2 sentences) for a GitHub project titled "${projectName}".`;
  if (currentDescription && currentDescription.trim() !== '') {
    userMessageContent += ` The project's current description (possibly fetched from GitHub) is: "${currentDescription}". You can use this as inspiration, refine it, or generate a new one if it's not suitable. Focus on its main purpose and target audience.`;
  } else {
    userMessageContent += ` Focus on its main purpose and target audience. Make it catchy and informative. Output only the description text.`;
  }

  try {
    const response = await fetch(`${OPENROUTER_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: commonHeaders(apiKey),
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant that generates concise project descriptions." },
          { role: "user", content: userMessageContent }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error response:", errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No text returned from OpenRouter API for description generation.");
    }
    return text.trim();
  } catch (error) {
    console.error("Error calling OpenRouter API for description:", error);
    if (error instanceof Error) {
      throw error; // Re-throw if already an Error instance
    }
    throw new Error("An unknown error occurred while communicating with the OpenRouter API.");
  }
};

export const generateReadmeSectionsFromCodeWithAI = async (
  apiKey: string,
  githubInfo: GithubRepoInfo
): Promise<AiGeneratedSections | null> => {
  if (!apiKey) {
    console.warn("OpenRouter API Key is not configured. Cannot generate README sections from code.");
    return null;
  }
  if (!githubInfo.fetchedFiles || githubInfo.fetchedFiles.length === 0) {
    console.warn("No file content provided to generate README sections.");
    return null;
  }

  const MAX_CONTENT_PER_FILE_PROMPT = 1500; // Max characters per file to keep prompt size reasonable

  let fileContentsString = githubInfo.fetchedFiles
    .filter(file => file.content && !file.error)
    .map(file => `File: ${file.path}\nContent (first ${MAX_CONTENT_PER_FILE_PROMPT} chars):\n${file.content.substring(0, MAX_CONTENT_PER_FILE_PROMPT)}\n---\n`)
    .join('');

  if (!fileContentsString.trim()) {
    fileContentsString = "No relevant file contents could be retrieved or they were empty.";
  }
  
  const systemInstructionForJson = `You are an AI assistant specialized in analyzing GitHub repositories and generating high-quality, well-structured README.md content.
Your response MUST be a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
The JSON object must adhere to the following schema:
{
  "overview": "string (a detailed project overview for the 'About The Project' section)",
  "features": ["string array (key features of the project)"],
  "installation": "string (markdown-formatted, step-by-step installation instructions. Infer from files like package.json, requirements.txt, etc.)",
  "technologies": ["string array (primary technologies, frameworks, and libraries used, beyond basic languages)"],
  "prerequisites": "string (markdown-formatted, list of prerequisites like Node.js version, package managers, etc. Inferred from files like package.json, .tool-versions, etc.)"
}

Example for installation value: "1. Clone the repo\\n   \`\`\`sh\\n   git clone ${githubInfo.clone_url || 'YOUR_REPO_URL_HERE'}\\n   \`\`\`\\n2. Navigate to project directory\\n   \`\`\`sh\\n   cd ${githubInfo.name || 'your_project_directory'}\\n   \`\`\`\\n3. Install dependencies (Update with specific commands if identifiable, e.g., npm install or pip install -r requirements.txt)"
Example for prerequisites value: "Ensure you have the following installed:\\n- Node.js (v18.x or higher)\\n- npm (v9.x or higher) or yarn"
`;

  const userPromptForSections = `
Analyze the following GitHub repository data and generate content for its README.md file.
Project Name: ${githubInfo.name}
Project Description (from GitHub API): ${githubInfo.description || 'Not available'}
Languages (from GitHub API): ${githubInfo.languages.join(', ') || 'Not specified'}
Topics (from GitHub API): ${githubInfo.topics.join(', ') || 'Not specified'}
Clone URL: ${githubInfo.clone_url}

Fetched File Contents Summary:
${fileContentsString}

Based on all the above information, provide the content for the overview, features, installation, technologies, and prerequisites sections.
Return your response ONLY as a valid JSON object matching the schema provided in the system instructions.
Ensure the installation and prerequisites instructions are practical and markdown formatted.
Identify specific frameworks or key libraries from file contents for the 'technologies' list.
`;

  try {
    const response = await fetch(`${OPENROUTER_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: commonHeaders(apiKey),
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemInstructionForJson },
          { role: "user", content: userPromptForSections }
        ],
        // Some models/OpenRouter might support a response_format field,
        // but it's not universal. Strong prompting is more reliable.
        // response_format: { type: "json_object" }, // Example, might not work with all models
        temperature: 0.5,
        top_p: 0.9,
        // max_tokens: 2000, // Adjust if needed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error response for sections:", errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }
    
    const data = await response.json();
    let jsonText = data.choices?.[0]?.message?.content;

    if (!jsonText) {
      throw new Error("No JSON text returned from OpenRouter API for README sections.");
    }
    
    jsonText = jsonText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonText.match(fenceRegex);
    if (match && match[2]) {
        jsonText = match[2].trim();
    }

    const parsedData: AiGeneratedSections = JSON.parse(jsonText);
    
    if (typeof parsedData.overview !== 'string' && parsedData.overview !== undefined) throw new Error("AI response 'overview' is not a string.");
    if (!Array.isArray(parsedData.features) && parsedData.features !== undefined) throw new Error("AI response 'features' is not an array.");
    if (typeof parsedData.installation !== 'string' && parsedData.installation !== undefined) throw new Error("AI response 'installation' is not a string.");
    if (!Array.isArray(parsedData.technologies) && parsedData.technologies !== undefined) throw new Error("AI response 'technologies' is not an array.");
    if (typeof parsedData.prerequisites !== 'string' && parsedData.prerequisites !== undefined) throw new Error("AI response 'prerequisites' is not a string.");

    return parsedData;

  } catch (error) {
    console.error("Error generating README sections with OpenRouter:", error);
    if (error instanceof Error && error.message.startsWith("OpenRouter API error:")) {
      throw error;
    }
    if (error instanceof SyntaxError) { // JSON parsing error
       throw new Error(`Failed to parse AI response as JSON. Raw response might be: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating README sections with OpenRouter.");
  }
};