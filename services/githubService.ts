import { GithubRepoInfo, FetchedFile } from '../types';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const MAX_FILE_SIZE_BYTES = 1024 * 100; // 100KB limit for fetching file content to keep prompts manageable

const PREDEFINED_FILES_TO_FETCH = [
  'README.md',
  'package.json',
  'requirements.txt',
  'Pipfile',
  'pom.xml',
  'build.gradle',
  'composer.json',
  'Gemfile',
  // Add more common file names if needed
];

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') {
      return null;
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
    }
    return null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

async function fetchFileContentFromRepo(owner: string, repo: string, filePath: string): Promise<FetchedFile | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`);
    if (!response.ok) {
      // Don't throw an error for individual file not found, just log and return null or error status
      console.warn(`File not found or error fetching ${filePath}: ${response.status}`);
      return { path: filePath, content: '', error: `File not found or error fetching: ${response.status}` };
    }
    const fileData = await response.json();

    if (fileData.type !== 'file') {
      return { path: filePath, content: '', error: 'Not a file' };
    }
    if (fileData.size > MAX_FILE_SIZE_BYTES) {
      return { path: filePath, content: '', error: `File too large (${fileData.size} bytes)` };
    }
    if (fileData.encoding !== 'base64' || !fileData.content) {
      return { path: filePath, content: '', error: 'Unsupported encoding or no content' };
    }
    
    const content = atob(fileData.content); // Decode base64 content
    return { path: filePath, content };

  } catch (error) {
    console.error(`Error fetching file content for ${filePath}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching file';
    return { path: filePath, content: '', error: errorMessage };
  }
}


export const fetchProjectDetails = async (repoUrl: string): Promise<GithubRepoInfo> => {
  const repoPath = parseGithubUrl(repoUrl);
  if (!repoPath) {
    throw new Error('Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo');
  }

  const { owner, repo } = repoPath;

  try {
    // Fetch main repository data
    const repoResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`);
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new Error(`Repository not found: ${owner}/${repo}. Please check the URL.`);
      }
      throw new Error(`Failed to fetch repository data from GitHub. Status: ${repoResponse.status}`);
    }
    const repoData = await repoResponse.json();

    // Fetch languages data
    let languages: string[] = [];
    if (repoData.languages_url) {
      const langResponse = await fetch(repoData.languages_url);
      if (langResponse.ok) {
        const langData = await langResponse.json();
        languages = Object.keys(langData);
      } else {
        console.warn(`Could not fetch languages for ${owner}/${repo}. Status: ${langResponse.status}`);
      }
    }
    
    const topics: string[] = repoData.topics || [];

    // Fetch content of predefined files
    const fetchedFiles: FetchedFile[] = [];
    for (const filePath of PREDEFINED_FILES_TO_FETCH) {
      const fileDetail = await fetchFileContentFromRepo(owner, repo, filePath);
      if (fileDetail && !fileDetail.error && fileDetail.content) { // Only add if content was successfully fetched
        fetchedFiles.push(fileDetail);
      } else if (fileDetail && fileDetail.error) {
        console.log(`Skipping file ${filePath} due to error: ${fileDetail.error}`);
      }
    }

    return {
      name: repoData.name || '',
      description: repoData.description || null,
      languages: languages,
      topics: topics,
      licenseName: repoData.license?.name || null,
      html_url: repoData.html_url || `https://github.com/${owner}/${repo}`,
      clone_url: repoData.clone_url || `https://github.com/${owner}/${repo}.git`,
      ownerLogin: repoData.owner?.login || owner,
      fetchedFiles: fetchedFiles,
    };
  } catch (error) {
    console.error('Error fetching from GitHub API:', error);
    if (error instanceof Error) {
      throw error; // Re-throw specific errors
    }
    throw new Error('An unexpected error occurred while fetching project details from GitHub.');
  }
};