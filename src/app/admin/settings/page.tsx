'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { ContentRevisionPanel } from '@/components/admin/ContentRevisionPanel';
import { MediaPickerField } from '@/components/admin/MediaPickerField';
import { NavigationLinksEditor } from '@/components/admin/NavigationLinksEditor';
import type { Category, LandingPage, SiteSettings } from '@/features/cms/types';

type SettingsResponse = {
  settings: SiteSettings;
};

type PageResponse = {
  pages: LandingPage[];
};

type CategoriesResponse = {
  categories: Category[];
};

type SettingsTab =
  | 'general'
  | 'writing'
  | 'reading'
  | 'discussion'
  | 'media'
  | 'permalinks'
  | 'seo'
  | 'sitemap';

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'writing', label: 'Writing' },
  { id: 'reading', label: 'Reading' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'media', label: 'Media' },
  { id: 'permalinks', label: 'Permalinks' },
  { id: 'seo', label: 'Meta Tags' },
  { id: 'sitemap', label: 'Sitemaps' }
];

function parseTab(value: string | null): SettingsTab {
  const candidate = value ?? 'general';
  return tabs.some((tab) => tab.id === candidate) ? (candidate as SettingsTab) : 'general';
}

function SettingsEditor() {
  const params = useSearchParams();
  const activeTab = parseTab(params.get('tab'));

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState('');
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [revisionReloadKey, setRevisionReloadKey] = useState(0);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError('');
      const settingsRes = await csrfFetch('/api/admin/settings');
      if (!settingsRes.ok) {
        setLoading(false);
        setError('Failed to load settings.');
        return;
      }

      const settingsPayload = (await settingsRes.json()) as SettingsResponse;
      setSettings(settingsPayload.settings);
      setLoading(false);
    }

    void loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab !== 'reading' || pages.length > 0 || pagesLoading || pagesError) return;

    async function loadPages() {
      setPagesLoading(true);
      setPagesError('');
      const response = await csrfFetch('/api/admin/pages');
      if (!response.ok) {
        setPagesLoading(false);
        setPagesError('Page options failed to load. You can still save other reading settings.');
        return;
      }

      const payload = (await response.json()) as PageResponse;
      setPages(payload.pages);
      setPagesLoading(false);
    }

    void loadPages();
  }, [activeTab, pages.length, pagesLoading, pagesError]);

  useEffect(() => {
    if (activeTab !== 'writing' || categories.length > 0 || categoriesLoading || categoriesError) return;

    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoriesError('');
      const response = await csrfFetch('/api/admin/categories');
      if (!response.ok) {
        setCategoriesLoading(false);
        setCategoriesError('Category options failed to load. You can still save other writing settings.');
        return;
      }

      const payload = (await response.json()) as CategoriesResponse;
      setCategories(payload.categories);
      setCategoriesLoading(false);
    }

    void loadCategories();
  }, [activeTab, categories.length, categoriesLoading, categoriesError]);

  const pageOptions = useMemo(
    () =>
      [
        ...pages.map((page) => ({
          id: page.id,
          label: `${page.navLabel} (${page.id})`
        })),
        ...[settings?.reading.homepagePageId, settings?.reading.postsPageId]
          .filter((value): value is LandingPage['id'] => Boolean(value))
          .filter((value, index, items) => items.indexOf(value) === index)
          .filter((value) => !pages.some((page) => page.id === value))
          .map((id) => ({
            id,
            label: `${id} (${id})`
          }))
      ],
    [pages, settings?.reading.homepagePageId, settings?.reading.postsPageId]
  );

  const categoryOptions = useMemo(() => {
    const entries = categories.map((category) => ({ label: category.name, value: category.slug }));
    if (settings?.writing.defaultPostCategory && !entries.some((entry) => entry.value === settings.writing.defaultPostCategory)) {
      entries.unshift({
        label: settings.writing.defaultPostCategory,
        value: settings.writing.defaultPostCategory
      });
    }
    return entries;
  }, [categories, settings?.writing.defaultPostCategory]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setNotice('');
    setError('');

    const response = await csrfFetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    setSaving(false);

    if (!response.ok) {
      setError('Failed to save settings.');
      return;
    }

    const payload = (await response.json()) as SettingsResponse;
    setSettings(payload.settings);
    setNotice('Settings saved.');
    setRevisionReloadKey((current) => current + 1);
  };

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!settings) return <p>Settings not available.</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Website Settings</h2>
          <AdminActionButton icon="save" variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </AdminActionButton>
        </div>

        <div className="admin-actions" style={{ marginBottom: 16 }}>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/settings?tab=${tab.id}`}
              className={`v2-btn ${activeTab === tab.id ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {activeTab === 'general' ? (
          <div className="admin-grid-2">
            <label>
              Website title
              <input
                value={settings.general.siteName}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: event.target.value },
                    siteName: event.target.value
                  })
                }
              />
            </label>
            <label>
              Tagline
              <input
                value={settings.general.siteTagline}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, siteTagline: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Website URL
              <input
                value={settings.general.baseUrl}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, baseUrl: event.target.value },
                    baseUrl: event.target.value
                  })
                }
              />
            </label>
            <label>
              Admin email
              <input
                value={settings.general.adminEmail}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, adminEmail: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Time zone
              <input
                value={settings.general.timezone}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Language
              <input
                value={settings.general.language}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, language: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Date format
              <input
                value={settings.general.dateFormat}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, dateFormat: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Time format
              <input
                value={settings.general.timeFormat}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, timeFormat: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Week starts on (0-6)
              <input
                type="number"
                min={0}
                max={6}
                value={settings.general.weekStartsOn}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      weekStartsOn: Math.max(0, Math.min(6, Number(event.target.value))) as 0 | 1 | 2 | 3 | 4 | 5 | 6
                    }
                  })
                }
              />
            </label>
            <label>
              Organization name
              <input
                value={settings.organizationName}
                onChange={(event) => setSettings({ ...settings, organizationName: event.target.value })}
              />
            </label>
            <label>
              Organization logo URL
              <input
                value={settings.organizationLogo}
                onChange={(event) => setSettings({ ...settings, organizationLogo: event.target.value })}
              />
            </label>
            <div style={{ gridColumn: '1 / -1' }}>
              <NavigationLinksEditor
                label="Header menu links"
                description="Primary navigation links shown in the site header."
                items={settings.navigation.headerLinks}
                prefix="header-link"
                onChange={(nextLinks: SiteSettings['navigation']['headerLinks']) =>
                  setSettings({
                    ...settings,
                    navigation: { ...settings.navigation, headerLinks: nextLinks }
                  })
                }
              />
            </div>
            <label>
              Header CTA label
              <input
                value={settings.navigation.headerCtaLabel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    navigation: { ...settings.navigation, headerCtaLabel: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Header CTA href
              <input
                value={settings.navigation.headerCtaHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    navigation: { ...settings.navigation, headerCtaHref: event.target.value }
                  })
                }
              />
            </label>
            <div style={{ gridColumn: '1 / -1' }}>
              <NavigationLinksEditor
                label="Footer navigator links"
                description="General footer links for company, blog, contact, and portfolio navigation."
                items={settings.navigation.footerNavigatorLinks}
                prefix="footer-nav"
                onChange={(nextLinks: SiteSettings['navigation']['footerNavigatorLinks']) =>
                  setSettings({
                    ...settings,
                    navigation: { ...settings.navigation, footerNavigatorLinks: nextLinks }
                  })
                }
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <NavigationLinksEditor
                label="Footer service links"
                description="Service shortcuts shown in the footer."
                items={settings.navigation.footerServiceLinks}
                prefix="footer-service"
                onChange={(nextLinks: SiteSettings['navigation']['footerServiceLinks']) =>
                  setSettings({
                    ...settings,
                    navigation: { ...settings.navigation, footerServiceLinks: nextLinks }
                  })
                }
              />
            </div>
            <label>
              Company name
              <input
                value={settings.contact.companyName}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, companyName: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Address line 1
              <input
                value={settings.contact.addressLine1}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, addressLine1: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Address line 2
              <input
                value={settings.contact.addressLine2}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, addressLine2: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Global reach label
              <input
                value={settings.contact.globalReachLabel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, globalReachLabel: event.target.value }
                  })
                }
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Global reach text
              <textarea
                rows={3}
                value={settings.contact.globalReachText}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, globalReachText: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Email label
              <input
                value={settings.contact.emailLabel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, emailLabel: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Email
              <input
                value={settings.contact.emailValue}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, emailValue: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Email href
              <input
                value={settings.contact.emailHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, emailHref: event.target.value },
                    social: { ...settings.social, emailHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              WhatsApp label
              <input
                value={settings.contact.whatsappLabel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, whatsappLabel: event.target.value }
                  })
                }
              />
            </label>
            <label>
              WhatsApp
              <input
                value={settings.contact.whatsappValue}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, whatsappValue: event.target.value }
                  })
                }
              />
            </label>
            <label>
              WhatsApp href
              <input
                value={settings.contact.whatsappHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, whatsappHref: event.target.value },
                    social: { ...settings.social, chatHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Instagram label
              <input
                value={settings.contact.instagramLabel}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, instagramLabel: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Instagram
              <input
                value={settings.contact.instagramValue}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, instagramValue: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Instagram href
              <input
                value={settings.contact.instagramHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, instagramHref: event.target.value },
                    social: { ...settings.social, instagramHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Website/social link
              <input
                value={settings.social.websiteHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, websiteHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Social chat link
              <input
                value={settings.social.chatHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, chatHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Social Instagram link
              <input
                value={settings.social.instagramHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, instagramHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Social email link
              <input
                value={settings.social.emailHref}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, emailHref: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Footer tagline
              <input
                value={settings.branding.footerTagline}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, footerTagline: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Footer badge primary
              <input
                value={settings.branding.footerBadgePrimary}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, footerBadgePrimary: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Footer badge secondary
              <input
                value={settings.branding.footerBadgeSecondary}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, footerBadgeSecondary: event.target.value }
                  })
                }
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Copyright text
              <input
                value={settings.branding.copyrightText}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, copyrightText: event.target.value }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'writing' ? (
          <div className="admin-grid-2">
            {categoriesLoading ? <p className="admin-subtle" style={{ gridColumn: '1 / -1' }}>Loading category options...</p> : null}
            {categoriesError ? (
              <div className="admin-inline-header" style={{ gridColumn: '1 / -1' }}>
                <p className="admin-error-text">{categoriesError}</p>
                <AdminActionButton icon="sync_alt" size="sm" variant="secondary" onClick={() => setCategoriesError('')}>
                  Retry
                </AdminActionButton>
              </div>
            ) : null}
            <label>
              Default post category
              <select
                value={settings.writing.defaultPostCategory}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: { ...settings.writing, defaultPostCategory: event.target.value }
                  })
                }
              >
                <option value="">None</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Default post author
              <input
                value={settings.writing.defaultPostAuthor}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: { ...settings.writing, defaultPostAuthor: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Default post format
              <select
                value={settings.writing.defaultPostFormat}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: {
                      ...settings.writing,
                      defaultPostFormat: event.target.value as SiteSettings['writing']['defaultPostFormat']
                    }
                  })
                }
              >
                <option value="standard">standard</option>
                <option value="aside">aside</option>
                <option value="gallery">gallery</option>
                <option value="video">video</option>
              </select>
            </label>
            <label>
              Default post status
              <select
                value={settings.writing.defaultPostStatus}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: {
                      ...settings.writing,
                      defaultPostStatus: event.target.value as SiteSettings['writing']['defaultPostStatus']
                    }
                  })
                }
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <label>
              Convert emoticons
              <input
                type="checkbox"
                checked={settings.writing.convertEmoticons}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: { ...settings.writing, convertEmoticons: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Require review before publish
              <input
                type="checkbox"
                checked={settings.writing.requireReviewBeforePublish}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: {
                      ...settings.writing,
                      requireReviewBeforePublish: event.target.checked
                    }
                  })
                }
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Update services (one URL per line)
              <textarea
                rows={4}
                value={settings.writing.pingServices.join('\n')}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: {
                      ...settings.writing,
                      pingServices: event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                    }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'reading' ? (
          <div className="admin-grid-2">
            {pagesLoading ? <p className="admin-subtle" style={{ gridColumn: '1 / -1' }}>Loading page options...</p> : null}
            {pagesError ? (
              <div className="admin-inline-header" style={{ gridColumn: '1 / -1' }}>
                <p className="admin-error-text">{pagesError}</p>
                <AdminActionButton icon="sync_alt" size="sm" variant="secondary" onClick={() => setPagesError('')}>
                  Retry
                </AdminActionButton>
              </div>
            ) : null}
            <label>
              Homepage displays
              <select
                value={settings.reading.homepageDisplay}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: {
                      ...settings.reading,
                      homepageDisplay: event.target.value as SiteSettings['reading']['homepageDisplay']
                    }
                  })
                }
              >
                <option value="static_page">A static page</option>
                <option value="latest_posts">Latest posts</option>
              </select>
            </label>
            <label>
              Homepage page
              <select
                value={settings.reading.homepagePageId}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: {
                      ...settings.reading,
                      homepagePageId: event.target.value as SiteSettings['reading']['homepagePageId']
                    }
                  })
                }
              >
                <option value="">None</option>
                {pageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Posts page
              <select
                value={settings.reading.postsPageId}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: {
                      ...settings.reading,
                      postsPageId: event.target.value as SiteSettings['reading']['postsPageId']
                    }
                  })
                }
              >
                <option value="">None</option>
                {pageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Blog posts per page
              <input
                type="number"
                min={1}
                max={100}
                value={settings.reading.postsPerPage}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: { ...settings.reading, postsPerPage: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Feed items
              <input
                type="number"
                min={1}
                max={100}
                value={settings.reading.feedItems}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: { ...settings.reading, feedItems: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Feed content
              <select
                value={settings.reading.feedSummary}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: {
                      ...settings.reading,
                      feedSummary: event.target.value as SiteSettings['reading']['feedSummary']
                    }
                  })
                }
              >
                <option value="excerpt">Excerpt</option>
                <option value="full">Full text</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Discourage search engines from indexing this site
              <input
                type="checkbox"
                checked={settings.reading.discourageSearchEngines}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    reading: {
                      ...settings.reading,
                      discourageSearchEngines: event.target.checked
                    }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'discussion' ? (
          <div className="admin-grid-2">
            <label>
              Comments enabled
              <input
                type="checkbox"
                checked={settings.discussion.commentsEnabled}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: { ...settings.discussion, commentsEnabled: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Comment registration required
              <input
                type="checkbox"
                checked={settings.discussion.commentRegistrationRequired}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: {
                      ...settings.discussion,
                      commentRegistrationRequired: event.target.checked
                    }
                  })
                }
              />
            </label>
            <label>
              Close comments after days
              <input
                type="number"
                min={0}
                max={365}
                value={settings.discussion.closeCommentsAfterDays}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: {
                      ...settings.discussion,
                      closeCommentsAfterDays: Number(event.target.value)
                    }
                  })
                }
              />
            </label>
            <label>
              Threaded comments
              <input
                type="checkbox"
                checked={settings.discussion.threadedCommentsEnabled}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: {
                      ...settings.discussion,
                      threadedCommentsEnabled: event.target.checked
                    }
                  })
                }
              />
            </label>
            <label>
              Thread depth
              <input
                type="number"
                min={1}
                max={10}
                value={settings.discussion.threadDepth}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: { ...settings.discussion, threadDepth: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Require comment approval
              <input
                type="checkbox"
                checked={settings.discussion.requireCommentApproval}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: {
                      ...settings.discussion,
                      requireCommentApproval: event.target.checked
                    }
                  })
                }
              />
            </label>
            <label>
              Notify on comment
              <input
                type="checkbox"
                checked={settings.discussion.notifyOnComment}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    discussion: { ...settings.discussion, notifyOnComment: event.target.checked }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'media' ? (
          <div className="admin-grid-2">
            <label>
              Organize uploads by month
              <input
                type="checkbox"
                checked={settings.media.uploadOrganizeByMonth}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, uploadOrganizeByMonth: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Thumbnail width
              <input
                type="number"
                min={50}
                value={settings.media.thumbnailWidth}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, thumbnailWidth: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Thumbnail height
              <input
                type="number"
                min={50}
                value={settings.media.thumbnailHeight}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, thumbnailHeight: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Medium max width
              <input
                type="number"
                min={100}
                value={settings.media.mediumMaxWidth}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, mediumMaxWidth: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Medium max height
              <input
                type="number"
                min={100}
                value={settings.media.mediumMaxHeight}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, mediumMaxHeight: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Large max width
              <input
                type="number"
                min={100}
                value={settings.media.largeMaxWidth}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, largeMaxWidth: Number(event.target.value) }
                  })
                }
              />
            </label>
            <label>
              Large max height
              <input
                type="number"
                min={100}
                value={settings.media.largeMaxHeight}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    media: { ...settings.media, largeMaxHeight: Number(event.target.value) }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'permalinks' ? (
          <div className="admin-grid-2">
            <label>
              Post permalink structure
              <input
                value={settings.permalinks.postPermalinkStructure}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    permalinks: {
                      ...settings.permalinks,
                      postPermalinkStructure: event.target.value
                    }
                  })
                }
              />
            </label>
            <label>
              Category base
              <input
                value={settings.permalinks.categoryBase}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    permalinks: { ...settings.permalinks, categoryBase: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Tag base
              <input
                value={settings.permalinks.tagBase}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    permalinks: { ...settings.permalinks, tagBase: event.target.value }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'seo' ? (
          <div className="admin-grid-2">
            <label>
              Title template
              <input
                value={settings.seo.titleTemplate}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, titleTemplate: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Default OG image
              <input
                value={settings.seo.defaultOgImage}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, defaultOgImage: event.target.value },
                    defaultOgImage: event.target.value
                  })
                }
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Default meta description
              <textarea
                rows={4}
                value={settings.seo.defaultMetaDescription}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, defaultMetaDescription: event.target.value }
                  })
                }
              />
            </label>
            <label>
              Site-wide noindex by default
              <input
                type="checkbox"
                checked={settings.seo.defaultNoIndex}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, defaultNoIndex: event.target.checked }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {activeTab === 'sitemap' ? (
          <div className="admin-grid-2">
            <label>
              Enable sitemap
              <input
                type="checkbox"
                checked={settings.sitemap.enabled}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    sitemap: { ...settings.sitemap, enabled: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Include pages
              <input
                type="checkbox"
                checked={settings.sitemap.includePages}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    sitemap: { ...settings.sitemap, includePages: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Include posts
              <input
                type="checkbox"
                checked={settings.sitemap.includePosts}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    sitemap: { ...settings.sitemap, includePosts: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Include portfolio
              <input
                type="checkbox"
                checked={settings.sitemap.includePortfolio}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    sitemap: { ...settings.sitemap, includePortfolio: event.target.checked }
                  })
                }
              />
            </label>
            <label>
              Include last modified date
              <input
                type="checkbox"
                checked={settings.sitemap.includeLastModified}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    sitemap: { ...settings.sitemap, includeLastModified: event.target.checked }
                  })
                }
              />
            </label>
          </div>
        ) : null}

        {notice ? <p className="mt-3">{notice}</p> : null}
      </section>

      <ContentRevisionPanel<SiteSettings>
        entityType="site_settings"
        entityId="default"
        reloadKey={revisionReloadKey}
        emptyMessage="Saved settings revisions will appear here."
        onRestore={(restoredSettings) => {
          setSettings(restoredSettings);
          setNotice('Settings restored from revision history.');
        }}
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Settings"
      description="Configure General, navigation/contact/footer links, Writing, Reading, Discussion, Media, Permalinks, SEO, and Sitemap behavior."
    >
      {() => <SettingsEditor />}
    </AdminShell>
  );
}

















