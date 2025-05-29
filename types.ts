export interface ReadmeData {
  projectName: string;
  description: string | null; // Can be null if not provided or fetched
  overview: string;
  features: string[];
  technologies: string[];
  installation: string;
  usage: string;
  contributing: string;
  license: string; // Will now store the full license text
  contact: string;
  acknowledgements: string;
  prerequisites: string;
  liveDemoUrl?: string;
  screenshots?: string[]; // URLs or paths to screenshots
  roadmap?: string;
  faq?: Array<{ question: string; answer: string }>;
}

export type SectionKey = keyof ReadmeData;

export interface SelectOption {
  name: string;  // Display name for the option
  value: string; // Actual value for the option (e.g., full license text)
}

export interface SectionConfig {
  key: SectionKey;
  title: string;
  description?: string;
  placeholder?: string;
  type: 'input' | 'textarea' | 'array' | 'select';
  noun?: string; // For ArrayInputField, e.g., "feature", "technology"
  options?: SelectOption[]; // Updated to use SelectOption interface
}

export interface FetchedFile {
  path: string;
  content: string;
  error?: string; // Optional error message if fetching this specific file failed
}

export interface GithubRepoInfo {
  name: string;
  description: string | null;
  languages: string[];
  topics: string[];
  licenseName: string | null;
  html_url: string;
  clone_url: string;
  ownerLogin: string;
  fetchedFiles?: FetchedFile[]; // Array of fetched file contents
}

export interface AiGeneratedSections {
  overview?: string;
  features?: string[];
  installation?: string;
  technologies?: string[];
  prerequisites?: string;
}