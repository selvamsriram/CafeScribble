import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GitHubService, type ScribbleDocument } from '@/services/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  LogOut,
  Loader2,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';

export function DashboardPage() {
  const { user, logout, selectedRepo, setSelectedRepo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [documents, setDocuments] = useState<ScribbleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ScribbleDocument | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Track if we've loaded at least once
  const hasLoaded = useRef(false);
  // Track last load time to avoid rapid reloads
  const lastLoadTime = useRef(0);

  const { owner, repo } = selectedRepo
    ? GitHubService.parseRepoFullName(selectedRepo)
    : { owner: '', repo: '' };

  // Loads all scribbles from the selected repo (root `*.md`, excluding `README.md`).
  const loadDocuments = useCallback(async (showRefreshing = false) => {
    if (!selectedRepo) return;

    // Prevent rapid reloads (within 500ms)
    const now = Date.now();
    if (hasLoaded.current && now - lastLoadTime.current < 500) {
      return;
    }

    try {
      if (showRefreshing && hasLoaded.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const docs = await GitHubService.getScribbleDocuments(owner, repo);
      setDocuments(docs);
      hasLoaded.current = true;
      lastLoadTime.current = Date.now();
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRepo, owner, repo]);

  // Initial load and reload when coming back to this page
  useEffect(() => {
    if (!selectedRepo) {
      navigate('/repos');
      return;
    }
    
    // Always reload when the component mounts or location changes
    // This ensures fresh data when navigating back from editor
    loadDocuments(hasLoaded.current);
  }, [selectedRepo, navigate, loadDocuments, location.key]);

  // Reload when page becomes visible (e.g., switching tabs back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasLoaded.current) {
        loadDocuments(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadDocuments]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  const createDocument = () => {
    if (!newDocName.trim() || !selectedRepo) return;

    // Create the path from the name (same sanitization as `GitHubService.createScribble`).
    // Note: the file is not created on GitHub until the first explicit commit in the editor.
    const name = newDocName.trim();
    const path = `${name.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`;
    const defaultContent = `# ${name}\n\nStart writing here...`;

    setShowCreateDialog(false);
    setNewDocName('');
    
    // Navigate to the editor, passing initial content through navigation state.
    navigate(`/editor/${encodeURIComponent(path)}`, {
      state: {
        isNew: true,
        name,
        content: defaultContent,
      },
    });
  };

  const deleteDocument = async () => {
    if (!selectedDoc) return;

    try {
      setProcessing(true);
      setError(null);
      
      // Get fresh SHA before deleting to avoid stale SHA issues
      const freshMeta = await GitHubService.getFileMeta(owner, repo, selectedDoc.path);
      const currentSha = freshMeta?.sha || selectedDoc.sha;
      
      await GitHubService.deleteFile(owner, repo, selectedDoc.path, currentSha);
      
      // Optimistically remove from UI
      setDocuments(prev => prev.filter((d) => d.path !== selectedDoc.path));
      setShowDeleteDialog(false);
      setSelectedDoc(null);
      
      // Reload to ensure consistency after a short delay
      setTimeout(() => loadDocuments(true), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      console.error(err);
      
      // Reload documents to get fresh state
      loadDocuments(true);
    } finally {
      setProcessing(false);
    }
  };

  const renameDocument = async () => {
    if (!selectedDoc || !newDocName.trim()) return;

    try {
      setProcessing(true);
      setError(null);
      
      const renamedDoc = await GitHubService.renameScribble(owner, repo, selectedDoc, newDocName.trim());
      
      // Update local state
      setDocuments(prev => prev.map((d) => (d.path === selectedDoc.path ? renamedDoc : d)));
      setShowRenameDialog(false);
      setSelectedDoc(null);
      setNewDocName('');
      
      // Reload to ensure consistency
      setTimeout(() => loadDocuments(true), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename document';
      setError(errorMessage);
      console.error(err);
      
      // Reload documents to get fresh state
      loadDocuments(true);
    } finally {
      setProcessing(false);
    }
  };

  const openDocument = (doc: ScribbleDocument) => {
    navigate(`/editor/${encodeURIComponent(doc.path)}`);
  };

  const changeRepo = () => {
    setSelectedRepo('');
    navigate('/repos');
  };

  const handleManualRefresh = () => {
    loadDocuments(true);
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative overflow-hidden">
      {/* Decorative latte background (hidden on very small screens to avoid layout issues) */}
      <div className="hidden sm:block absolute top-[-4%] right-[-10%] pointer-events-none select-none z-0 opacity-18">
        <img
          src="/latte.png"
          alt=""
          className="w-[65vw] max-w-[820px] min-w-[520px] object-contain drop-shadow-2xl"
        />
      </div>

      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-[var(--color-text)] font-[var(--font-heading)]">Cafe Scribble</span>
            </div>
            
            {selectedRepo && (
              <button
                onClick={changeRepo}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{repo}</span>
              </button>
            )}
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

      <main className="container mx-auto px-6 py-10 max-w-5xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1 font-[var(--font-heading)]">Your Scribbles</h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              {documents.length} scribble{documents.length !== 1 ? 's' : ''} in {repo}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh documents"
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => {
                setNewDocName('');
                setShowCreateDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Scribble
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <Input
              type="text"
              placeholder="Search scribbles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]/60 text-center">
            Only the markdown documents in the root directory are shown
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-red-600 hover:text-red-800 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-2 font-[var(--font-heading)]">
              {searchQuery ? 'No scribbles match your search' : 'No scribbles yet'}
            </h3>
            <p className="text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term' : 'Create your first scribble and start capturing your thoughts.'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setNewDocName('');
                  setShowCreateDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Scribble
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.path}
                className="group relative p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 shadow-sm shadow-[var(--color-shadow)] hover:shadow-md hover:shadow-[var(--color-shadow-lg)] transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => openDocument(doc)}
              >
                
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <FileText className="w-5 h-5" />
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === doc.path ? null : doc.path);
                      }}
                      className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeMenu === doc.path && (
                      <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                            setNewDocName(doc.name);
                            setShowRenameDialog(true);
                            setActiveMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                            setShowDeleteDialog(true);
                            setActiveMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-[var(--color-surface)] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-2 truncate font-[var(--font-heading)]">
                  {doc.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                  {doc.content.substring(0, 100).replace(/^#\s*.*\n?/, '').trim() || 'Empty scribble'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Scribble</DialogTitle>
            <DialogDescription>
              Give your new scribble a name. You can always rename it later.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="My new scribble"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createDocument();
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createDocument}
              disabled={!newDocName.trim() || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Scribble'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scribble</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDoc?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteDocument}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Scribble</DialogTitle>
            <DialogDescription>
              Enter a new name for your scribble.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="New name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') renameDocument();
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowRenameDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={renameDocument}
              disabled={!newDocName.trim() || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
