import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AuthService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CoffeeCup, CafeScene } from '@/components/PlantSVG';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Github, Copy, Check, ExternalLink, Loader2, Coffee, BookOpen, Cloud } from 'lucide-react';

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
        // Ensure app auth state reflects the new token immediately
        refreshAuth();
        setIsSuccess(true);
        setIsLoading(false);

        // Brief success affordance, then route to repo selection
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
    await navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGitHub = () => {
    window.open(verificationUri, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden relative">
      {/* Warm gradient overlay */}
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
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-md shadow-[var(--color-shadow)]">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight font-[var(--font-heading)]">Cafe-Scribble</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-12 pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Hero content with illustration */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-8 shadow-sm">
                  <CoffeeCup className="w-5 h-5" />
                  <span className="text-sm text-[var(--color-text-muted)]">Write over a warm cup</span>
                </div>

                {/* Main headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-[var(--font-heading)]">
                  <span className="block text-[var(--color-text)]">Write with</span>
                  <span className="block text-[var(--color-primary)]">calm & clarity</span>
                </h1>

                <p className="text-lg text-[var(--color-text-muted)] max-w-xl mb-10 leading-relaxed">
                  A peaceful markdown editor that feels like your favorite coffee shop. 
                  Your notes stay in your GitHub repository — private, secure, and always accessible.
                </p>

                {/* CTA */}
                {!isConfigured ? (
                  <div className="p-6 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 max-w-md mx-auto lg:mx-0">
                    <p className="text-[var(--color-accent)] text-sm mb-2 font-medium">Setup Required</p>
                    <p className="text-[var(--color-text-muted)] text-sm">
                      Create a GitHub OAuth App and update the client ID in{' '}
                      <code className="text-[var(--color-primary)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded">src/services/auth.ts</code>
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

              {/* Illustration - Cafe Scene with latte and notepad */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <CafeScene className="w-80 h-72" />
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-24">
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title="Distraction-Free"
                description="A clean, minimal editor that lets you focus on what matters — your words."
              />
              <FeatureCard
                icon={<Cloud className="w-6 h-6" />}
                title="GitHub Storage"
                description="Your scribbles live in your repository. Version history, sync, and backups built-in."
              />
              <FeatureCard
                icon={<Coffee className="w-6 h-6" />}
                title="Cozy Cafe Vibes"
                description="Warm colors, gentle animations, and a peaceful cafe atmosphere for your best writing."
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-[var(--color-border)]">
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Crafted with care. Open source and privacy-focused.
          </p>
        </footer>
      </div>

      {/* Device Flow Dialog */}
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
              {/* The code */}
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

              {/* Instructions */}
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

              {/* Open GitHub button */}
              <Button onClick={openGitHub} className="w-full h-12">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open GitHub
              </Button>

              {/* Waiting indicator */}
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
