'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { csrfFetch } from '@/lib/clientCsrf';

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

const steps = [
  { id: 'siteIdentity', title: 'Site Identity', description: 'Set your site name, URL, and branding' },
  { id: 'contactInfo', title: 'Contact Info', description: 'Configure public contact email and details' },
  { id: 'defaultContent', title: 'Default Content', description: 'Review homepage and sample pages' },
  { id: 'media', title: 'Media Setup', description: 'Upload your logo and default images' },
  { id: 'seo', title: 'SEO Settings', description: 'Configure title template and defaults' },
  { id: 'launch', title: 'Ready to Launch', description: 'Final review and launch checklist' }
] as const;

function StepIndicator({ step, status, isActive }: { step: (typeof steps)[number]; status: StepStatus; isActive: boolean }) {
  const statusIcons: Record<StepStatus, string> = {
    pending: '○',
    in_progress: '◐',
    completed: '●',
    skipped: '⊘'
  };

  return (
    <div className={`onboarding-step ${isActive ? 'active' : ''} ${status}`}>
      <div className="onboarding-step-icon">{statusIcons[status]}</div>
      <div className="onboarding-step-info">
        <div className="onboarding-step-title">{step.title}</div>
        <div className="onboarding-step-desc">{step.description}</div>
      </div>
    </div>
  );
}

function SiteIdentityStep({ onNext }: { onNext: () => void }) {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSiteName(data.settings.siteName || '');
          setSiteUrl(data.settings.baseUrl || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await csrfFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        general: {
          siteName,
          baseUrl: siteUrl
        }
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError('Failed to save settings.');
      return;
    }

    onNext();
  };

  return (
    <div className="onboarding-step-content">
      <h3>Site Identity</h3>
      <p className="onboarding-step-intro">Set your site name and production URL. These appear in browser tabs, emails, and social shares.</p>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="onboarding-field">
          <label htmlFor="siteName">Site Name</label>
          <input
            id="siteName"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Acme Studios"
            required
          />
        </div>

        <div className="onboarding-field">
          <label htmlFor="siteUrl">Production Site URL</label>
          <input
            id="siteUrl"
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://acmestudios.com"
            required
          />
          <span className="onboarding-hint">Include the full URL with https://</span>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="onboarding-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ContactInfoStep({ onNext }: { onNext: () => void }) {
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.contact) {
          setContactEmail(data.settings.contact.emailValue || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await csrfFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: {
          emailValue: contactEmail
        }
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError('Failed to save settings.');
      return;
    }

    onNext();
  };

  return (
    <div className="onboarding-step-content">
      <h3>Contact Information</h3>
      <p className="onboarding-step-intro">Set the public contact email that visitors will see and where contact form submissions will be sent.</p>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="onboarding-field">
          <label htmlFor="contactEmail">Public Contact Email</label>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="hello@acmestudios.com"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="onboarding-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DefaultContentStep({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onNext();
  };

  return (
    <div className="onboarding-step-content">
      <h3>Default Content</h3>
      <p className="onboarding-step-intro">Review your homepage and sample pages. Edit them to match your brand, then mark as complete.</p>

      <div className="onboarding-links">
        <a href="/admin/pages/home" target="_blank" rel="noopener noreferrer" className="onboarding-link-card">
          <span className="onboarding-link-icon">🏠</span>
          <span>Edit Homepage</span>
        </a>
        <a href="/admin/pages" target="_blank" rel="noopener noreferrer" className="onboarding-link-card">
          <span className="onboarding-link-icon">📄</span>
          <span>View All Pages</span>
        </a>
      </div>

      <div className="onboarding-actions">
        <button type="button" onClick={() => void handleSkip()} disabled={loading} className="v2-btn v2-btn-secondary">
          Skip for now
        </button>
        <button type="button" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onNext(); }, 300); }} disabled={loading}>
          I&apos;ve reviewed the content
        </button>
      </div>
    </div>
  );
}

function MediaStep({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onNext();
  };

  return (
    <div className="onboarding-step-content">
      <h3>Media Setup</h3>
      <p className="onboarding-step-intro">Upload your logo, default OG image, and any other brand assets to the media library.</p>

      <div className="onboarding-links">
        <a href="/admin/media" target="_blank" rel="noopener noreferrer" className="onboarding-link-card">
          <span className="onboarding-link-icon">🖼️</span>
          <span>Open Media Library</span>
        </a>
        <a href="/admin/settings?tab=media" target="_blank" rel="noopener noreferrer" className="onboarding-link-card">
          <span className="onboarding-link-icon">⚙️</span>
          <span>Media Settings</span>
        </a>
      </div>

      <div className="onboarding-actions">
        <button type="button" onClick={() => void handleSkip()} disabled={loading} className="v2-btn v2-btn-secondary">
          Skip for now
        </button>
        <button type="button" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onNext(); }, 300); }} disabled={loading}>
          I&apos;ve uploaded media
        </button>
      </div>
    </div>
  );
}

function SeoStep({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onNext();
  };

  return (
    <div className="onboarding-step-content">
      <h3>SEO Settings</h3>
      <p className="onboarding-step-intro">Configure your title template, default meta description, and social sharing image.</p>

      <div className="onboarding-links">
        <a href="/admin/settings?tab=seo" target="_blank" rel="noopener noreferrer" className="onboarding-link-card">
          <span className="onboarding-link-icon">🔍</span>
          <span>SEO Settings</span>
        </a>
        <a href="/admin/settings?tab=sitemap" target="_blank" rel="noopener noreferrer" className="onboarding-link-card">
          <span className="onboarding-link-icon">📋</span>
          <span>Sitemap Settings</span>
        </a>
      </div>

      <div className="onboarding-actions">
        <button type="button" onClick={() => void handleSkip()} disabled={loading} className="v2-btn v2-btn-secondary">
          Skip for now
        </button>
        <button type="button" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onNext(); }, 300); }} disabled={loading}>
          I&apos;ve configured SEO
        </button>
      </div>
    </div>
  );
}

function LaunchStep({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    onComplete();
  };

  return (
    <div className="onboarding-step-content">
      <h3>Ready to Launch!</h3>
      <p className="onboarding-step-intro">Your CMS is configured. Review the checklist below before publishing your site.</p>

      <div className="onboarding-checklist">
        <div className="onboarding-check-item">
          <span className="check-icon">✓</span>
          <span>Site identity configured</span>
        </div>
        <div className="onboarding-check-item">
          <span className="check-icon">✓</span>
          <span>Contact information set</span>
        </div>
        <div className="onboarding-check-item">
          <span className="check-icon">✓</span>
          <span>Default content reviewed</span>
        </div>
        <div className="onboarding-check-item">
          <span className="check-icon">○</span>
          <span>Analytics tracking (optional)</span>
        </div>
      </div>

      <div className="onboarding-launch-note">
        <p>Your site is ready to go live! Remember to:</p>
        <ul>
          <li>Set up your domain DNS to point to your hosting</li>
          <li>Configure any necessary environment variables on production</li>
          <li>Enable analytics if not already done</li>
        </ul>
      </div>

      <div className="onboarding-actions">
        <button type="button" onClick={() => void handleComplete()} disabled={loading}>
          {loading ? 'Opening dashboard...' : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  );
}

function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const stepKeys = ['siteIdentity', 'contactInfo', 'defaultContent', 'media', 'seo', 'launch'] as const;
  const currentKey = stepKeys[currentStep];

  const getStepStatus = (index: number): StepStatus => {
    if (completedSteps.has(index)) return 'completed';
    if (index === currentStep) return 'in_progress';
    if (index < currentStep) return 'completed';
    return 'pending';
  };

  const handleStepComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    window.location.href = '/admin';
  };

  const renderStep = () => {
    switch (currentKey) {
      case 'siteIdentity':
        return <SiteIdentityStep onNext={handleStepComplete} />;
      case 'contactInfo':
        return <ContactInfoStep onNext={handleStepComplete} />;
      case 'defaultContent':
        return <DefaultContentStep onNext={handleStepComplete} />;
      case 'media':
        return <MediaStep onNext={handleStepComplete} />;
      case 'seo':
        return <SeoStep onNext={handleStepComplete} />;
      case 'launch':
        return <LaunchStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-form-wrap">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h2>Welcome to your CMS!</h2>
          <p>Let&apos;s get your site set up. This quick wizard will walk you through the essential configuration.</p>
        </div>

        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <div className="onboarding-progress-fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>
          <span className="onboarding-progress-text">Step {currentStep + 1} of {steps.length}</span>
        </div>

        <div className="onboarding-sidebar">
          {steps.map((step, index) => (
            <StepIndicator
              key={step.id}
              step={step}
              status={getStepStatus(index)}
              isActive={index === currentStep}
            />
          ))}
        </div>

        <div className="onboarding-main">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default function AdminOnboardingPage() {
  return (
    <AdminShell title="Onboarding Wizard" description="Set up your CMS with this guided tour.">
      {() => (
        <div className="onboarding-page">
          <OnboardingWizard />
        </div>
      )}
    </AdminShell>
  );
}
