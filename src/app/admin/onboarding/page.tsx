'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCode,
  Files,
  Globe,
  Home,
  Image as ImageIcon,
  Mail,
  Rocket,
  Search,
  Sliders,
  Sparkles
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import { csrfFetch } from '@/lib/clientCsrf';

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

const steps = [
  { id: 'siteIdentity', title: 'Site Identity', description: 'Site name, production URL & branding', icon: Globe },
  { id: 'contactInfo', title: 'Contact Info', description: 'Public support email & inquiries', icon: Mail },
  { id: 'defaultContent', title: 'Default Content', description: 'Review homepage & landing pages', icon: Files },
  { id: 'media', title: 'Media Setup', description: 'Upload logo, brand assets & OG image', icon: ImageIcon },
  { id: 'seo', title: 'SEO Settings', description: 'Meta templates & XML sitemap config', icon: Search },
  { id: 'launch', title: 'Ready to Launch', description: 'Final operational checklist & review', icon: Rocket }
] as const;

function StepIndicator({
  step,
  index,
  status,
  isActive,
  onClick
}: {
  step: (typeof steps)[number];
  index: number;
  status: StepStatus;
  isActive: boolean;
  onClick: () => void;
}) {
  const IconComponent = step.icon;
  const isCompleted = status === 'completed';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: isActive ? '#eff6ff' : isCompleted ? '#f8fafc' : '#ffffff',
        border: isActive ? '2px solid #2563eb' : isCompleted ? '1px solid #d1fae5' : '1px solid #e2e8f0',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s ease',
        boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.08)' : 'none'
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: isCompleted ? '#ecfdf5' : isActive ? '#2563eb' : '#f1f5f9',
          color: isCompleted ? '#059669' : isActive ? '#ffffff' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2
        }}
      >
        {isCompleted ? <CheckCircle2 size={18} /> : <IconComponent size={16} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 600, color: isActive ? '#1d4ed8' : '#0f172a' }}>
            {index + 1}. {step.title}
          </span>
          {isCompleted ? (
            <span className="admin-chip admin-chip-success" style={{ fontSize: '0.65rem', padding: '0 6px', minHeight: 18 }}>
              Done
            </span>
          ) : isActive ? (
            <span className="admin-chip admin-chip-warning" style={{ fontSize: '0.65rem', padding: '0 6px', minHeight: 18 }}>
              Active
            </span>
          ) : null}
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
          {step.description}
        </p>
      </div>
    </button>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Site Identity &amp; Domain</h3>
        </div>
        <p className="admin-subtle" style={{ margin: 0, fontSize: '0.88rem' }}>
          Configure your brand title and canonical domain URL. These appear across browser tabs, search snippets, and social sharing cards.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="siteName" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240', marginBottom: 6 }}>
            Site Brand Name
          </label>
          <input
            id="siteName"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="e.g. Vanaila Studio"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="siteUrl" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240', marginBottom: 6 }}>
            Production Site URL
          </label>
          <input
            id="siteUrl"
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com"
            required
            style={{ width: '100%' }}
          />
          <span className="admin-subtle" style={{ fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
            Include the full canonical protocol (e.g. <code>https://yourdomain.com</code>)
          </span>
        </div>

        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="submit"
            disabled={loading}
            className="v2-btn v2-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>{loading ? 'Saving identity...' : 'Save & Continue'}</span>
            <ArrowRight size={15} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Contact Information</h3>
        </div>
        <p className="admin-subtle" style={{ margin: 0, fontSize: '0.88rem' }}>
          Set the public contact and routing email address where visitor inquiries and form submissions are delivered.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="contactEmail" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240', marginBottom: 6 }}>
            Public Inquiry &amp; Support Email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@yourdomain.com"
            required
            style={{ width: '100%' }}
          />
        </div>

        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="submit"
            disabled={loading}
            className="v2-btn v2-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>{loading ? 'Saving email...' : 'Save & Continue'}</span>
            <ArrowRight size={15} />
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
    await new Promise((r) => setTimeout(r, 200));
    setLoading(false);
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Files size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Review Default Content</h3>
        </div>
        <p className="admin-subtle" style={{ margin: 0, fontSize: '0.88rem' }}>
          Verify your homepage marketing copy, theme tokens, and landing pages before publishing them live to the world.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <a
          href="/admin/pages/home"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 14,
            border: '1px solid #d8e2f1',
            background: '#fbfdff',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.background = '#f0f6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d8e2f1';
            e.currentTarget.style.background = '#fbfdff';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f2240' }}>Edit Homepage</strong>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Customize hero blocks &amp; value props</span>
            </div>
          </div>
          <ExternalLink size={16} color="#94a3b8" />
        </a>

        <a
          href="/admin/pages"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 14,
            border: '1px solid #d8e2f1',
            background: '#fbfdff',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.background = '#f0f6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d8e2f1';
            e.currentTarget.style.background = '#fbfdff';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Files size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f2240' }}>View All Pages</strong>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Check landing pages &amp; legal copy</span>
            </div>
          </div>
          <ExternalLink size={16} color="#94a3b8" />
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => void handleSkip()}
          disabled={loading}
          className="v2-btn v2-btn-secondary"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onNext();
            }, 200);
          }}
          disabled={loading}
          className="v2-btn v2-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Check size={16} />
          <span>I&apos;ve reviewed the content</span>
        </button>
      </div>
    </div>
  );
}

function MediaStep({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    setLoading(false);
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Media Assets &amp; Branding</h3>
        </div>
        <p className="admin-subtle" style={{ margin: 0, fontSize: '0.88rem' }}>
          Upload your official logo, default Open Graph social image, and brand imagery into the central media vault.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <a
          href="/admin/media"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 14,
            border: '1px solid #d8e2f1',
            background: '#fbfdff',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.background = '#f0fdf4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d8e2f1';
            e.currentTarget.style.background = '#fbfdff';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f2240' }}>Open Media Library</strong>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Upload images &amp; define required alt text</span>
            </div>
          </div>
          <ExternalLink size={16} color="#94a3b8" />
        </a>

        <a
          href="/admin/settings?tab=media"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 14,
            border: '1px solid #d8e2f1',
            background: '#fbfdff',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.background = '#f0fdf4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d8e2f1';
            e.currentTarget.style.background = '#fbfdff';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f2240' }}>Storage Settings</strong>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Check Cloudflare R2 / Supabase CDN</span>
            </div>
          </div>
          <ExternalLink size={16} color="#94a3b8" />
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => void handleSkip()}
          disabled={loading}
          className="v2-btn v2-btn-secondary"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onNext();
            }, 200);
          }}
          disabled={loading}
          className="v2-btn v2-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Check size={16} />
          <span>I&apos;ve uploaded media</span>
        </button>
      </div>
    </div>
  );
}

function SeoStep({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    setLoading(false);
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>SEO &amp; Discoverability</h3>
        </div>
        <p className="admin-subtle" style={{ margin: 0, fontSize: '0.88rem' }}>
          Configure title templates, default meta descriptions, and sitemap generation for optimal search engine rankings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <a
          href="/admin/settings?tab=seo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 14,
            border: '1px solid #d8e2f1',
            background: '#fbfdff',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d97706';
            e.currentTarget.style.background = '#fffdf5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d8e2f1';
            e.currentTarget.style.background = '#fbfdff';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f2240' }}>SEO Settings</strong>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Title pattern &amp; default meta tag defaults</span>
            </div>
          </div>
          <ExternalLink size={16} color="#94a3b8" />
        </a>

        <a
          href="/admin/settings?tab=sitemap"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 14,
            border: '1px solid #d8e2f1',
            background: '#fbfdff',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d97706';
            e.currentTarget.style.background = '#fffdf5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d8e2f1';
            e.currentTarget.style.background = '#fbfdff';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCode size={18} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f2240' }}>Sitemap Settings</strong>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Check /sitemap.xml routes &amp; priorities</span>
            </div>
          </div>
          <ExternalLink size={16} color="#94a3b8" />
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => void handleSkip()}
          disabled={loading}
          className="v2-btn v2-btn-secondary"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onNext();
            }, 200);
          }}
          disabled={loading}
          className="v2-btn v2-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Check size={16} />
          <span>I&apos;ve configured SEO</span>
        </button>
      </div>
    </div>
  );
}

function LaunchStep({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    onComplete();
  };

  const checklistItems = [
    { label: 'Site identity & domain URL configured', done: true },
    { label: 'Public contact & notification email specified', done: true },
    { label: 'Default marketing content & pages reviewed', done: true },
    { label: 'Media library & brand assets loaded', done: true },
    { label: 'SEO meta patterns & sitemaps active', done: true },
    { label: 'Analytics tracking (database mode enabled)', done: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Ready to Launch!</h3>
        </div>
        <p className="admin-subtle" style={{ margin: 0, fontSize: '0.88rem' }}>
          Your CMS configuration is complete. Review the system verification checklist below before opening the command center.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {checklistItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '14px 16px',
          background: '#eff6ff',
          borderRadius: 14,
          border: '1px solid #bfdbfe',
          alignItems: 'flex-start'
        }}
      >
        <Sparkles size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ fontSize: '0.88rem', color: '#1e3a8a', display: 'block', marginBottom: 4 }}>
            Production Launch Best Practices
          </strong>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.5 }}>
            <li>Verify DNS A/CNAME records point to your production deployment server</li>
            <li>Ensure all production environment variables (e.g. <code>DATABASE_URL</code>) are set</li>
            <li>Run scheduled publish checks to confirm automatic queue execution</li>
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => void handleComplete()}
          disabled={loading}
          className="v2-btn v2-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: '0.95rem' }}
        >
          <Rocket size={18} />
          <span>{loading ? 'Opening command center...' : 'Launch CMS Dashboard'}</span>
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

  const pct = Math.round(((currentStep + 1) / steps.length) * 100);

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
    <div className="admin-form-wrap" style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Top Welcome & Overall Progress Card */}
      <section className="admin-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>CMS Quick-Start Onboarding</h2>
            </div>
            <p className="admin-subtle" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
              Follow this step-by-step setup to calibrate your site identity, assets, and publishing readiness.
            </p>
          </div>
          <span className="admin-chip admin-chip-muted" style={{ fontWeight: 600 }}>
            Step {currentStep + 1} of {steps.length} &middot; {pct}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden', marginTop: 16 }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #10b981)',
              borderRadius: 999,
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </section>

      {/* 2-Column Stepper & Main Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((step, index) => (
            <StepIndicator
              key={step.id}
              step={step}
              index={index}
              status={getStepStatus(index)}
              isActive={index === currentStep}
              onClick={() => {
                if (index <= currentStep || completedSteps.has(index)) {
                  setCurrentStep(index);
                }
              }}
            />
          ))}
        </div>

        {/* Main Step Form Card */}
        <div className="admin-card" style={{ padding: '28px' }}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default function AdminOnboardingPage() {
  return (
    <AdminShell
      title="Onboarding Wizard"
      description="Interactive guided walkthrough to configure your new website CMS."
    >
      {() => (
        <div style={{ padding: '8px 0' }}>
          <OnboardingWizard />
        </div>
      )}
    </AdminShell>
  );
}
