import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AuthService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Github, Copy, Check, ExternalLink, Loader2, Sparkles } from 'lucide-react';

export function LandingPage() {
  const { isConfigured, refreshAuth } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  
  const [showDeviceFlow, setShowDeviceFlow] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const startLogin = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setShowDeviceFlow(true);

    AuthService.startDeviceFlow({
      onCodeReceived: ({ userCode, verificationUri }) => {
        setUserCode(userCode);
        setVerificationUri(verificationUri);
        setIsLoading(false);
      },
      onSuccess: () => {
        // Ensure app auth state reflects the new token immediately.
        refreshAuth();
        setIsSuccess(true);
        setIsLoading(false);

        // Brief success affordance, then route to repo selection.
        window.setTimeout(() => {
          setShowDeviceFlow(false);
          navigate('/repos');
        }, 600);
      },
      onError: (err) => {
        setError(err);
        setIsLoading(false);
      },
    });
  };

  const cancelLogin = () => {
    AuthService.cancelDeviceFlow();
    setShowDeviceFlow(false);
    setUserCode('');
    setVerificationUri('');
    setIsSuccess(false);
    setError(null);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Clipboard API failed (permissions denied or not available)
      // Fall back to selecting text for manual copy
      console.error('Clipboard copy failed:', err);
      // Show brief error indication by using the copied state differently
      // User can still manually copy the visible code
    }
  };

  const openGitHub = () => {
    window.open(verificationUri, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden relative">
      {/* Subtle background gradient (palette-aware) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: mode === 'day' 
            ? 'radial-gradient(ellipse at 30% 20%, var(--color-primary), transparent 50%), radial-gradient(ellipse at 70% 80%, var(--color-accent), transparent 50%)'
            : 'radial-gradient(ellipse at 30% 20%, var(--color-primary), transparent 50%), radial-gradient(ellipse at 70% 80%, var(--color-accent), transparent 50%)',
          opacity: 0.06
        }}
      />

      <div className="relative z-10">
        {/* App header */}
        <header className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold tracking-tight font-[var(--font-heading)]">Cafe Scribble</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Marketing + login entrypoint */}
        <main className="container mx-auto px-6 pt-12 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-80 sm:w-96 lg:w-[28rem]">
                  <div className="absolute inset-0 blur-3xl bg-[var(--color-primary)]/15 scale-110" />
                  <img
                    src="/latte.png"
                    alt="Latte art"
                    className="relative w-full h-auto rounded-[28px] shadow-2xl shadow-[var(--color-shadow-lg)] rotate-[-8deg]"
                  />
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-[var(--font-heading)]">
                  <span className="block text-[var(--color-text)]">Write with</span>
                  <span className="block text-[var(--color-primary)]">calm & clarity</span>
                </h1>

                <p className="text-lg text-[var(--color-text-muted)] max-w-xl mb-10 leading-relaxed ml-auto mr-auto lg:ml-0 lg:mr-0">
                  A peaceful markdown editor that feels like your favorite coffee shop. 
                  Your notes stay in your GitHub repository. Private, secure, and always accessible.
                </p>

                {!isConfigured ? (
                  <div className="p-6 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 max-w-md mx-auto lg:mx-0">
                    <p className="text-[var(--color-accent)] text-sm mb-2 font-medium">Setup Required</p>
                    <p className="text-[var(--color-text-muted)] text-sm">
                      Set <code className="text-[var(--color-primary)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded">VITE_GITHUB_CLIENT_ID</code> and reload.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={startLogin}
                    size="lg"
                    className="h-14 px-8 text-base"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Continue with GitHub
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-24">
              <FeatureCard
                icon={<Check className="w-6 h-6" />}
                title="Distraction-Free"
                description="A clean, minimal editor that lets you focus on what matters, your words."
              />
              <FeatureCard
                icon={<Github className="w-6 h-6" />}
                title="GitHub Storage"
                description="Your scribbles live in your repository. Version history, sync, and backups built-in."
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Cozy Cafe Vibes"
                description="Warm colors, gentle animations, and a peaceful cafe atmosphere for your best writing."
              />
            </div>
          </div>
        </main>

        {/* App footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-[var(--color-border)]">
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Crafted with love. Consider supporting <a href="https://www.seattlechildrens.org/giving" className="text-[var(--color-primary)] hover:underline">Seattle Children's Hospital</a>.
          </p>
        </footer>
      </div>

      {/* GitHub Device Flow dialog */}
      <Dialog open={showDeviceFlow} onOpenChange={(open) => !open && cancelLogin()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Connect to GitHub
            </DialogTitle>
            <DialogDescription>
              {isLoading 
                ? 'Getting your login code...' 
                : 'Enter the code below on GitHub to connect your account.'}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            </div>
          ) : isSuccess ? (
            <div className="py-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-border)]">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mt-3">Taking you to repo selection...</p>
            </div>
          ) : error ? (
            <div className="py-6">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mb-4">
                {error}
              </div>
              <Button onClick={startLogin} className="w-full">
                Try Again
              </Button>
            </div>
          ) : userCode ? (
            <div className="py-4 space-y-6">
              <div className="text-center">
                <p className="text-sm text-[var(--color-text-muted)] mb-3">Your one-time code:</p>
                <div className="relative inline-block">
                  <div className="text-3xl font-mono font-bold tracking-[0.3em] bg-[var(--color-surface)] px-6 py-4 rounded-xl border border-[var(--color-border)] shadow-inner">
                    {userCode}
                  </div>
                  <button
                    onClick={copyCode}
                    className="absolute -right-3 -top-3 p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] shadow-sm transition-all"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[var(--color-primary)]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--color-text-muted)]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 text-xs font-bold">
                    1
                  </div>
                  <p className="text-[var(--color-text-muted)]">Click the button below to open GitHub</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 text-xs font-bold">
                    2
                  </div>
                  <p className="text-[var(--color-text-muted)]">Enter the code above when prompted</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <p className="text-[var(--color-text-muted)]">Authorize the app, then return here</p>
                </div>
              </div>

              <Button onClick={openGitHub} className="w-full h-12">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open GitHub
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for authorization...</span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm shadow-[var(--color-shadow)] hover:shadow-md hover:shadow-[var(--color-shadow-lg)] transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4 group-hover:bg-[var(--color-primary)]/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 font-[var(--font-heading)]">{title}</h3>
      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{description}</p>
    </div>
  );
}
