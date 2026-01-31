// GitHub API Service for repository and file operations
import { AuthService } from './auth';

const GITHUB_API = 'https://api.github.com';

// Retry configuration for eventual consistency
const CONSISTENCY_CHECK_INTERVAL = 1000; // ms between checks
const CONSISTENCY_MAX_ATTEMPTS = 8; // max retries

interface GitHubApiOptions {
  method?: string;
  body?: unknown;
}

// Helper to wait for a specified time
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to retry until a condition is met or max attempts reached
async function waitForCondition(
  checkFn: () => Promise<boolean>,
  maxAttempts: number = CONSISTENCY_MAX_ATTEMPTS,
  interval: number = CONSISTENCY_CHECK_INTERVAL
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (await checkFn()) {
      return true;
    }
    if (attempt < maxAttempts - 1) {
      await wait(interval);
    }
  }
  return false;
}

async function githubFetch<T>(endpoint: string, options: GitHubApiOptions = {}): Promise<T> {
  const token = AuthService.getAccessToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  download_url: string | null;
}

export interface ScribbleDocument {
  name: string;
  path: string;
  sha: string;
  content: string;
  lastModified?: string;
}

export const GitHubService = {
  // Get user's repositories
  async getRepositories(): Promise<Repository[]> {
    const repos = await githubFetch<Repository[]>('/user/repos?sort=updated&per_page=100');
    return repos;
  },

  // Create a new repository
  async createRepository(name: string, description: string = 'My Scribble Documents', isPrivate: boolean = false): Promise<Repository> {
    const repo = await githubFetch<Repository>('/user/repos', {
      method: 'POST',
      body: {
        name,
        description,
        private: isPrivate,
        auto_init: true, // Initialize with README
      },
    });
    return repo;
  },

  // Get repository contents (list files)
  async getContents(owner: string, repo: string, path: string = ''): Promise<FileContent[]> {
    try {
      const contents = await githubFetch<FileContent | FileContent[]>(
        `/repos/${owner}/${repo}/contents/${path}`
      );
      return Array.isArray(contents) ? contents : [contents];
    } catch (error) {
      // Return empty array if path doesn't exist
      if ((error as Error).message.includes('404')) {
        return [];
      }
      throw error;
    }
  },

  // Get fresh file metadata (sha) for a specific file
  async getFileMeta(owner: string, repo: string, path: string): Promise<FileContent | null> {
    try {
      const file = await githubFetch<FileContent>(
        `/repos/${owner}/${repo}/contents/${path}`
      );
      return file;
    } catch {
      return null;
    }
  },

  // Check if a file exists in the repository
  async fileExists(owner: string, repo: string, path: string): Promise<boolean> {
    try {
      await githubFetch<FileContent>(
        `/repos/${owner}/${repo}/contents/${path}`
      );
      return true;
    } catch {
      return false;
    }
  },

  // Wait until the file listing is consistent (file exists or doesn't exist as expected)
  async waitForFileConsistency(
    owner: string,
    repo: string,
    path: string,
    shouldExist: boolean
  ): Promise<boolean> {
    return waitForCondition(async () => {
      const exists = await this.fileExists(owner, repo, path);
      return exists === shouldExist;
    });
  },

  // Get all markdown files in the repository root
  async getScribbleDocuments(owner: string, repo: string): Promise<ScribbleDocument[]> {
    const contents = await this.getContents(owner, repo);
    const markdownFiles = contents.filter(
      (file) => file.type === 'file' && file.name.endsWith('.md') && file.name !== 'README.md'
    );

    // Fetch content for each file
    const documents: ScribbleDocument[] = await Promise.all(
      markdownFiles.map(async (file) => {
        const content = await this.getFileContent(owner, repo, file.path);
        return {
          name: file.name.replace('.md', ''),
          path: file.path,
          sha: file.sha,
          content: content,
        };
      })
    );

    return documents;
  },

  // Get file content
  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const file = await githubFetch<FileContent>(
      `/repos/${owner}/${repo}/contents/${path}`
    );
    
    if (file.content && file.encoding === 'base64') {
      // Properly decode base64 + UTF-8 content
      const base64 = file.content.replace(/\n/g, '');
      const binaryString = atob(base64);
      // Convert binary string to UTF-8
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }
    
    // Fallback to raw content
    if (file.download_url) {
      const response = await fetch(file.download_url);
      return response.text();
    }
    
    return '';
  },

  // Create or update a file - returns updated file info
  async saveFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<{ sha: string; content: FileContent }> {
    // Properly encode UTF-8 content to base64
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Content = btoa(binary);

    const body: {
      message: string;
      content: string;
      sha?: string;
    } = {
      message,
      content: base64Content,
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await githubFetch<{ content: FileContent }>(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body,
    });

    return { sha: response.content.sha, content: response.content };
  },

  // Delete a file and wait for consistency
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    sha: string,
    message: string = 'Delete scribble document'
  ): Promise<void> {
    await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      body: {
        message,
        sha,
      },
    });

    // Wait for deletion to be reflected in GitHub's API
    const isConsistent = await this.waitForFileConsistency(owner, repo, path, false);
    if (!isConsistent) {
      console.warn(`File deletion may not be fully propagated yet: ${path}`);
    }
  },

  // Create a new scribble document and wait for consistency
  async createScribble(
    owner: string,
    repo: string,
    name: string,
    content: string = '# New Scribble\n\nStart writing here...'
  ): Promise<ScribbleDocument> {
    const path = `${name.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`;
    const result = await this.saveFile(
      owner,
      repo,
      path,
      content,
      `Create scribble: ${name}`
    );

    // Wait for file to be visible in GitHub's API
    const isConsistent = await this.waitForFileConsistency(owner, repo, path, true);
    if (!isConsistent) {
      console.warn(`File creation may not be fully propagated yet: ${path}`);
    }

    return {
      name,
      path,
      sha: result.sha,
      content,
    };
  },

  // Update an existing scribble document - fetches fresh SHA first to avoid conflicts
  async updateScribble(
    owner: string,
    repo: string,
    document: ScribbleDocument,
    newContent: string
  ): Promise<ScribbleDocument> {
    // Always get fresh SHA to avoid "SHA mismatch" errors
    const freshMeta = await this.getFileMeta(owner, repo, document.path);
    const currentSha = freshMeta?.sha || document.sha;

    const result = await this.saveFile(
      owner,
      repo,
      document.path,
      newContent,
      `Update scribble: ${document.name}`,
      currentSha
    );

    return {
      ...document,
      content: newContent,
      sha: result.sha,
    };
  },

  // Rename a scribble document and wait for consistency
  async renameScribble(
    owner: string,
    repo: string,
    document: ScribbleDocument,
    newName: string
  ): Promise<ScribbleDocument> {
    const newPath = `${newName.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`;
    const oldPath = document.path;
    
    // Get fresh SHA for the old file
    const freshMeta = await this.getFileMeta(owner, repo, oldPath);
    const currentSha = freshMeta?.sha || document.sha;
    
    // Create new file with new name
    const result = await this.saveFile(
      owner,
      repo,
      newPath,
      document.content,
      `Rename scribble: ${document.name} -> ${newName}`
    );

    // Wait for new file to be visible
    await this.waitForFileConsistency(owner, repo, newPath, true);

    // Delete old file (this also waits for consistency)
    await this.deleteFile(owner, repo, oldPath, currentSha);

    // Final verification: ensure both conditions are met
    const isFullyConsistent = await waitForCondition(async () => {
      const [newExists, oldExists] = await Promise.all([
        this.fileExists(owner, repo, newPath),
        this.fileExists(owner, repo, oldPath),
      ]);
      return newExists && !oldExists;
    });

    if (!isFullyConsistent) {
      console.warn(`Rename operation may not be fully propagated. New: ${newPath}, Old: ${oldPath}`);
    }

    return {
      name: newName,
      path: newPath,
      sha: result.sha,
      content: document.content,
    };
  },

  // Parse repo full name into owner and repo
  parseRepoFullName(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split('/');
    return { owner, repo };
  },
};
