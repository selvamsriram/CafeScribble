// GitHub API Service for repository and file operations
import { AuthService } from './auth';

const GITHUB_API = 'https://api.github.com';

interface GitHubApiOptions {
  method?: string;
  body?: unknown;
}

async function githubFetch<T>(endpoint: string, options: GitHubApiOptions = {}): Promise<T> {
  const token = AuthService.getAccessToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
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
      const contents = await githubFetch<FileContent | FileContent[]>(`/repos/${owner}/${repo}/contents/${path}`);
      return Array.isArray(contents) ? contents : [contents];
    } catch (error) {
      // Return empty array if path doesn't exist
      if ((error as Error).message.includes('404')) {
        return [];
      }
      throw error;
    }
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
    const file = await githubFetch<FileContent>(`/repos/${owner}/${repo}/contents/${path}`);
    
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

  // Create or update a file
  async saveFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<{ sha: string }> {
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

    return { sha: response.content.sha };
  },

  // Delete a file
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
  },

  // Create a new scribble document
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

    return {
      name,
      path,
      sha: result.sha,
      content,
    };
  },

  // Update an existing scribble document
  async updateScribble(
    owner: string,
    repo: string,
    document: ScribbleDocument,
    newContent: string
  ): Promise<ScribbleDocument> {
    const result = await this.saveFile(
      owner,
      repo,
      document.path,
      newContent,
      `Update scribble: ${document.name}`,
      document.sha // Pass the SHA to update existing file
    );

    return {
      ...document,
      content: newContent,
      sha: result.sha,
    };
  },

  // Rename a scribble document
  async renameScribble(
    owner: string,
    repo: string,
    document: ScribbleDocument,
    newName: string
  ): Promise<ScribbleDocument> {
    const newPath = `${newName.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`;
    
    // Create new file with new name
    const result = await this.saveFile(
      owner,
      repo,
      newPath,
      document.content,
      `Rename scribble: ${document.name} -> ${newName}`
    );

    // Delete old file
    await this.deleteFile(owner, repo, document.path, document.sha);

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

