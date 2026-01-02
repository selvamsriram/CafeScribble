// GitHub OAuth Device Flow Authentication Service
// Uses our own serverless proxy to avoid third-party CORS proxies

// GitHub OAuth Client ID - loaded from environment variable for flexibility
// In production, set VITE_GITHUB_CLIENT_ID in your hosting environment
// Note: Client IDs are public (not secret), but using env vars allows easier rotation
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liAv9nE0bXbTS0rs';
const OAUTH_PROXY_URL = '/api/github-oauth';
const STORAGE_KEYS = {
  accessToken: 'github_access_token',
  selectedRepo: 'selected_repo',
  user: 'github_user',
};

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DeviceFlowCallbacks {
  onCodeReceived: (data: { userCode: string; verificationUri: string }) => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Polling state
let pollingAbortController: AbortController | null = null;

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    // If parsing fails, clear the corrupted value
    return null;
  }
}

export const AuthService = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  // Get stored user (with safe JSON parsing)
  getUser(): GitHubUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.user);
    const user = safeJsonParse<GitHubUser>(userStr);
    if (!user && userStr) {
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    return user;
  },

  // Get selected repo
  getSelectedRepo(): string | null {
    return localStorage.getItem(STORAGE_KEYS.selectedRepo);
  },

  // Set selected repo
  setSelectedRepo(repo: string): void {
    localStorage.setItem(STORAGE_KEYS.selectedRepo, repo);
  },

  // Validate token by making a test API call
  async validateToken(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 401) {
        // Token is invalid, clear auth state
        this.logout();
        return false;
      }

      return response.ok;
    } catch {
      // Network error, assume token might still be valid
      return true;
    }
  },

  // Start Device Flow login
  async startDeviceFlow(callbacks: DeviceFlowCallbacks): Promise<void> {
    try {
      // Step 1: Request device code via our secure proxy
      const codeResponse = await fetch(OAUTH_PROXY_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'https://github.com/login/device/code',
          client_id: GITHUB_CLIENT_ID,
          scope: 'repo user',
        }),
      });

      if (!codeResponse.ok) {
        const errorData = await codeResponse.json().catch(() => ({}));
        console.error('Device code error:', errorData);
        throw new Error(errorData.error || 'Failed to get device code');
      }

      const codeData: DeviceCodeResponse = await codeResponse.json();
      
      // Show the code to the user
      callbacks.onCodeReceived({
        userCode: codeData.user_code,
        verificationUri: codeData.verification_uri,
      });

      // Step 2: Poll for the access token
      pollingAbortController = new AbortController();
      await this.pollForToken(codeData, callbacks, pollingAbortController.signal);
      
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        callbacks.onError((error as Error).message || 'Authentication failed');
      }
    }
  },

  // Poll GitHub for the access token
  async pollForToken(
    codeData: DeviceCodeResponse,
    callbacks: DeviceFlowCallbacks,
    signal: AbortSignal
  ): Promise<void> {
    const interval = (codeData.interval || 5) * 1000; // Convert to ms
    const expiresAt = Date.now() + codeData.expires_in * 1000;

    while (Date.now() < expiresAt) {
      if (signal.aborted) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));

      if (signal.aborted) {
        return;
      }

      try {
        // Use our secure proxy instead of third-party CORS proxy
        const tokenResponse = await fetch(OAUTH_PROXY_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: 'https://github.com/login/oauth/access_token',
            client_id: GITHUB_CLIENT_ID,
            device_code: codeData.device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          if (tokenData.error === 'authorization_pending') {
            // User hasn't completed authorization yet, keep polling
            continue;
          } else if (tokenData.error === 'slow_down') {
            // We're polling too fast, wait longer
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          } else if (tokenData.error === 'expired_token') {
            callbacks.onError('The code has expired. Please try again.');
            return;
          } else if (tokenData.error === 'access_denied') {
            callbacks.onError('Access was denied. Please try again.');
            return;
          } else {
            callbacks.onError(tokenData.error_description || tokenData.error);
            return;
          }
        }

        if (tokenData.access_token) {
          // Success! Store the token
          localStorage.setItem(STORAGE_KEYS.accessToken, tokenData.access_token);

          // Fetch and store user info
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
          }

          callbacks.onSuccess();
          return;
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Polling error:', error);
        }
      }
    }

    callbacks.onError('The code has expired. Please try again.');
  },

  // Cancel ongoing device flow
  cancelDeviceFlow(): void {
    if (pollingAbortController) {
      pollingAbortController.abort();
      pollingAbortController = null;
    }
  },

  // Logout
  logout(): void {
    this.cancelDeviceFlow();
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.selectedRepo);
  },

  // Get the GitHub Client ID (for configuration)
  getClientId(): string {
    return GITHUB_CLIENT_ID;
  },

  // Check if the app is configured
  isConfigured(): boolean {
    return GITHUB_CLIENT_ID.length > 0 && !GITHUB_CLIENT_ID.includes('YOUR_');
  },
};
