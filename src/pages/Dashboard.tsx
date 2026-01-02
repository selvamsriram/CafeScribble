import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GitHubService, type ScribbleDocument } from '@/services/github';
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
  FileText,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  LogOut,
  Loader2,
  FolderOpen,
  Coffee,
} from 'lucide-react';

export function DashboardPage() {
  const { user, logout, selectedRepo, setSelectedRepo } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<ScribbleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ScribbleDocument | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { owner, repo } = selectedRepo
    ? GitHubService.parseRepoFullName(selectedRepo)
    : { owner: '', repo: '' };

  useEffect(() => {
    if (!selectedRepo) {
      navigate('/repos');
      return;
    }
    loadDocuments();
  }, [selectedRepo, navigate]);

  const loadDocuments = async () => {
    if (!selectedRepo) return;

    try {
      setLoading(true);
      setError(null);
      const docs = await GitHubService.getScribbleDocuments(owner, repo);
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = () => {
    if (!newDocName.trim() || !selectedRepo) return;

    // Create the path from the name (same logic as GitHubService.createScribble)
    const name = newDocName.trim();
    const path = `${name.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`;
    const defaultContent = `# ${name}\n\nStart writing here...`;

    setShowCreateDialog(false);
    setNewDocName('');
    
    // Navigate to editor with new document state
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
      await GitHubService.deleteFile(owner, repo, selectedDoc.path, selectedDoc.sha);
      setDocuments(documents.filter((d) => d.path !== selectedDoc.path));
      setShowDeleteDialog(false);
      setSelectedDoc(null);
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const renameDocument = async () => {
    if (!selectedDoc || !newDocName.trim()) return;

    try {
      setProcessing(true);
      const renamedDoc = await GitHubService.renameScribble(owner, repo, selectedDoc, newDocName.trim());
      setDocuments(documents.map((d) => (d.path === selectedDoc.path ? renamedDoc : d)));
      setShowRenameDialog(false);
      setSelectedDoc(null);
      setNewDocName('');
    } catch (err) {
      setError('Failed to rename document');
      console.error(err);
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

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-sm">
                <Coffee className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-[var(--color-text)] font-[var(--font-heading)]">Cafe-Scribble</span>
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

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1 font-[var(--font-heading)]">Your Scribbles</h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              {documents.length} scribble{documents.length !== 1 ? 's' : ''} in {repo}
            </p>
          </div>
          
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

        {/* Search */}
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
            Newly committed scribbles may take a minute to appear
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
        ) : filteredDocs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mb-6">
              <LatteArt className="w-40 h-44 mx-auto opacity-60" />
            </div>
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
          /* Document Grid */
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

      {/* Create Document Dialog */}
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

      {/* Delete Document Dialog */}
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

      {/* Rename Document Dialog */}
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
