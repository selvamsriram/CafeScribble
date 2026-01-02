import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Editor } from '@tiptap/react';
import { useAuth } from '@/hooks/useAuth';
import { GitHubService, type ScribbleDocument } from '@/services/github';
import { ScribbleEditor } from '@/components/Editor';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Coffee,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Link as LinkIcon,
  Minus,
  Undo,
  Redo,
  Github,
} from 'lucide-react';

// Navigation state passed from Dashboard when creating new document
interface NewDocState {
  isNew: true;
  name: string;
  content: string;
}

// GitHub commit status: indicates cloud commit state  
type GitHubStatus = 'committed' | 'committing' | 'uncommitted' | 'error';

export function EditorPage() {
  const { path } = useParams<{ path: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedRepo } = useAuth();

  const [document, setDocument] = useState<ScribbleDocument | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [githubStatus, setGithubStatus] = useState<GitHubStatus>('committed');
  const [isNewDocument, setIsNewDocument] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [, forceUpdate] = useState({});
  
  // Dialog for unsaved changes
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const { owner, repo } = selectedRepo
    ? GitHubService.parseRepoFullName(selectedRepo)
    : { owner: '', repo: '' };

  const decodedPath = path ? decodeURIComponent(path) : '';
  
  // Check if this is a new document from navigation state
  const newDocState = location.state as NewDocState | null;
  
  // Use ref to track if commit is in progress (prevents race conditions)
  const isCommitInProgress = useRef(false);

  // Load document function wrapped in useCallback
  const loadDocument = useCallback(async () => {
    if (!selectedRepo) return;

    try {
      setLoading(true);
      setError(null);

      // Check if this is a new document from navigation state
      if (newDocState?.isNew) {
        const doc: ScribbleDocument = {
          name: newDocState.name,
          path: decodedPath,
          sha: '', // No SHA yet
          content: newDocState.content,
        };

        setDocument(doc);
        setContent(newDocState.content);
        setIsNewDocument(true);
        setGithubStatus('uncommitted');
        setLoading(false);
        return;
      }

      // Existing document - fetch from GitHub
      const fileContent = await GitHubService.getFileContent(owner, repo, decodedPath);
      
      // Get file metadata
      const contents = await GitHubService.getContents(owner, repo, '');
      const file = contents.find(f => f.path === decodedPath);

      if (!file) {
        setError('Document not found');
        return;
      }

      const doc: ScribbleDocument = {
        name: file.name.replace('.md', ''),
        path: file.path,
        sha: file.sha,
        content: fileContent,
      };

      setDocument(doc);
      setContent(fileContent);
      setIsNewDocument(false);
      setGithubStatus('committed');
    } catch (err) {
      setError('Failed to load document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, owner, repo, decodedPath, newDocState]);

  // Load document on mount
  useEffect(() => {
    if (!selectedRepo || !decodedPath) {
      navigate('/dashboard');
      return;
    }

    loadDocument();
  }, [selectedRepo, decodedPath, navigate, loadDocument]);

  // Handle content changes - just update local state, mark as uncommitted
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    // Mark as uncommitted since there are unsaved changes
    setGithubStatus((prev) => prev === 'uncommitted' ? prev : 'uncommitted');
  }, []);

  // Commit to GitHub (Cmd/Ctrl+S or save button) - wrapped in useCallback
  const commitToGitHub = useCallback(async (): Promise<boolean> => {
    if (!document || !selectedRepo) return false;

    // Already committed and no changes
    if (githubStatus === 'committed') return true;

    // Prevent race condition - if already committing, don't start another
    if (isCommitInProgress.current) return false;
    isCommitInProgress.current = true;

    try {
      setGithubStatus('committing');

      if (isNewDocument) {
        // Create new file on GitHub for the first time
        const result = await GitHubService.saveFile(
          owner,
          repo,
          decodedPath,
          content,
          `Create scribble: ${document.name}`
        );

        // Update document with SHA and mark as no longer new
        setDocument({ ...document, sha: result.sha, content });
        setIsNewDocument(false);
      } else {
        // Update existing file
        const updatedDoc = await GitHubService.updateScribble(
          owner,
          repo,
          document,
          content
        );
        setDocument(updatedDoc);
      }

      setGithubStatus('committed');
      isCommitInProgress.current = false;
      return true;
    } catch (err) {
      console.error('Failed to commit:', err);
      setGithubStatus('error');
      isCommitInProgress.current = false;
      return false;
    }
  }, [document, selectedRepo, githubStatus, isNewDocument, owner, repo, decodedPath, content]);

  // Manual save (Cmd/Ctrl + S) - commits to GitHub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        commitToGitHub();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commitToGitHub]);

  // Warn before closing tab with uncommitted changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (githubStatus === 'uncommitted') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [githubStatus]);

  // Handle back button - show dialog if uncommitted
  const goBack = () => {
    if (githubStatus === 'uncommitted') {
      setShowLeaveDialog(true);
    } else {
      navigate('/dashboard');
    }
  };

  // Handle commit and leave
  const handleCommitAndLeave = async () => {
    setIsCommitting(true);
    const success = await commitToGitHub();
    setIsCommitting(false);
    if (success) {
      setShowLeaveDialog(false);
      navigate('/dashboard');
    }
  };

  // Handle discard and leave
  const handleDiscardAndLeave = () => {
    setShowLeaveDialog(false);
    navigate('/dashboard');
  };

  // Handle editor ready
  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
    // Listen for selection/transaction changes to update toolbar state
    editorInstance.on('selectionUpdate', () => forceUpdate({}));
    editorInstance.on('transaction', () => forceUpdate({}));
  }, []);

  // Handle link
  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkInputOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const githubSaveDisabled = githubStatus === 'committed' || githubStatus === 'committing';
  const githubStatusLabel =
    githubStatus === 'committed'
      ? 'Up to date on GitHub'
      : githubStatus === 'committing'
        ? 'Saving to GitHub...'
        : githubStatus === 'error'
          ? 'Save failed — click to retry'
          : 'Unsaved changes — click to save to GitHub';

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading your scribble...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 font-[var(--font-heading)]">Error</h2>
          <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Header with integrated toolbar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)] sticky top-0 z-50">
        {/* Top row: Navigation, title, status, actions - LARGER */}
        <div className="container mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="default"
              onClick={goBack}
              className="text-[var(--color-text-muted)] shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>

            <div className="h-6 w-px bg-[var(--color-border)] hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <Coffee className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              <h1 className="text-base font-semibold text-[var(--color-text)] truncate max-w-[150px] sm:max-w-[280px] font-[var(--font-heading)]">
                {document?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => commitToGitHub()}
              disabled={githubSaveDisabled}
              title={githubStatusLabel}
              aria-label={githubStatusLabel}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
                'border border-[var(--color-border)]',
                'shadow-sm hover:shadow-md',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                // Uncommitted: accent background with white text
                githubStatus === 'uncommitted' && 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white',
                // Committed: surface background with primary text
                githubStatus === 'committed' && 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-primary)]',
                // Committing: surface background with muted text
                githubStatus === 'committing' && 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]',
                // Error: red background with white text
                githubStatus === 'error' && 'bg-red-500/90 hover:bg-red-600 text-white',
                // Default (fallback): surface background with muted text
                githubStatus !== 'uncommitted' && githubStatus !== 'committed' && githubStatus !== 'committing' && githubStatus !== 'error' && 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              {githubStatus === 'committing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : githubStatus === 'committed' ? (
                <Check className="w-4 h-4" />
              ) : githubStatus === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Commit</span>
            </button>
          </div>
        </div>

        {/* Formatting toolbar row - CENTERED and LARGER */}
        {editor && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/50">
            <div className="container mx-auto px-6 py-2.5 flex items-center justify-center gap-1 overflow-x-auto">
              {/* Undo/Redo */}
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Headings */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="w-5 h-5" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Text formatting */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
              >
                <Strikethrough className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Code"
              >
                <Code className="w-5 h-5" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Lists */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                title="Task List"
              >
                <CheckSquare className="w-5 h-5" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Block elements */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
              >
                <Quote className="w-5 h-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Divider"
              >
                <Minus className="w-5 h-5" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Link */}
              {isLinkInputOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setLink();
                      if (e.key === 'Escape') setIsLinkInputOpen(false);
                    }}
                    className="w-40 px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    autoFocus
                  />
                  <button
                    onClick={setLink}
                    className="px-3 py-1.5 text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsLinkInputOpen(false)}
                    className="px-2 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <ToolbarButton
                  onClick={() => {
                    const previousUrl = editor.getAttributes('link').href;
                    setLinkUrl(previousUrl || '');
                    setIsLinkInputOpen(true);
                  }}
                  isActive={editor.isActive('link')}
                  title="Link"
                >
                  <LinkIcon className="w-5 h-5" />
                </ToolbarButton>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Editor */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 relative bg-[var(--color-surface)] border-t border-[var(--color-border)] paper-texture">
          <div className="max-w-4xl mx-auto px-8 md:px-16 lg:px-24 py-8">
            <ScribbleEditor
              content={content}
              onChange={handleContentChange}
              onEditorReady={handleEditorReady}
            />
          </div>
        </div>

        {/* Keyboard shortcuts hint - slim footer */}
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-2">
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] mr-0.5">⌘</kbd>
              <span className="mx-0.5">+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px]">S</kbd>
              <span className="ml-1.5">save</span>
            </span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px]">/</kbd>
              <span className="ml-1.5">commands</span>
            </span>
          </div>
        </footer>
      </main>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Would you like to save them to GitHub before leaving?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={handleDiscardAndLeave}
              disabled={isCommitting}
            >
              Discard
            </Button>
            <Button
              onClick={handleCommitAndLeave}
              disabled={isCommitting}
            >
              {isCommitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Save to GitHub
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Toolbar button component - LARGER
function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2.5 rounded-lg transition-all duration-150',
        isActive
          ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[var(--color-border)] mx-2" />;
}
