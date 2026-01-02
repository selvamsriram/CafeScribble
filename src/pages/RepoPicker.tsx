import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GitHubService, type Repository } from '@/services/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LatteArt } from '@/components/PlantSVG';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Lock, 
  Globe,
  LogOut,
  Loader2,
  ArrowRight,
  Coffee,
} from 'lucide-react';

export function RepoPickerPage() {
  const { user, logout, setSelectedRepo } = useAuth();
  const navigate = useNavigate();
  
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRepoName, setNewRepoName] = useState('scribble-notes');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      setLoading(true);
      const repositories = await GitHubService.getRepositories();
      setRepos(repositories);
    } catch (err) {
      setError('Failed to load repositories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectRepo = (repo: Repository) => {
    setSelectedRepo(repo.full_name);
    navigate('/dashboard');
  };

  const createRepo = async () => {
    if (!newRepoName.trim()) return;

    try {
      setCreating(true);
      const repo = await GitHubService.createRepository(
        newRepoName.trim(),
        'My scribbles - Created by Cafe-Scribble',
        isPrivate
      );
      setShowCreateDialog(false);
      selectRepo(repo);
    } catch (err) {
      setError('Failed to create repository');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-sm">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[var(--color-text)] font-[var(--font-heading)]">Cafe-Scribble</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-8 h-8 rounded-full ring-2 ring-[var(--color-border)]"
                  onError={(e) => {
                    // Fallback to GitHub identicon if avatar fails to load
                    e.currentTarget.src = `https://github.com/identicons/${user.login}.png`;
                  }}
                />
                <span className="text-sm text-[var(--color-text-muted)] hidden sm:inline">{user.login}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-[var(--color-text-muted)]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Title Section */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <LatteArt className="w-36 h-40 mx-auto opacity-70" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3 font-[var(--font-heading)]">
            Where should we save your scribbles?
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Choose an existing repository or create a new one for your notes.
          </p>
        </div>

        {/* Create New Repo Button */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full mb-6 h-14"
          variant="accent"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Repository
        </Button>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <Input
              type="text"
              placeholder="Search your repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]/60 text-center">
            New repositories may take a minute to show up after creation
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : (
          /* Repository List */
          <div className="space-y-2">
            {filteredRepos.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                {searchQuery ? 'No repositories match your search' : 'No repositories found'}
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => selectRepo(repo)}
                  className="w-full p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-hover)] transition-all duration-200 text-left group flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                      {repo.private ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {repo.name}
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {repo.owner.login} • {repo.private ? 'Private' : 'Public'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                </button>
              ))
            )}
          </div>
        )}
      </main>

      {/* Create Repository Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Repository</DialogTitle>
            <DialogDescription>
              This will create a new GitHub repository to store your scribbles.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                Repository Name
              </label>
              <Input
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="scribble-notes"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPrivate(false)}
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  !isPrivate
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <Globe className={`w-5 h-5 mx-auto mb-2 ${!isPrivate ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                <div className={`text-sm font-medium ${!isPrivate ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                  Public
                </div>
              </button>
              <button
                onClick={() => setIsPrivate(true)}
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  isPrivate
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <Lock className={`w-5 h-5 mx-auto mb-2 ${isPrivate ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                <div className={`text-sm font-medium ${isPrivate ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                  Private
                </div>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createRepo}
              disabled={!newRepoName.trim() || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Repository'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
