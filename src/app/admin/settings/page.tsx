'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { LandingPage, SiteSettings } from '@/features/cms/types';

type SettingsResponse = {
  settings: SiteSettings;
};

type PageResponse = {
  pages: LandingPage[];
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

function SettingsEditor({ token }: { token: string }) {
  const params = useSearchParams();
  const activeTab = parseTab(params.get('tab'));

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      const [settingsRes, pagesRes] = await Promise.all([
        fetch('/api/admin/settings', { headers: { 'x-admin-token': token } }),
        fetch('/api/admin/pages', { headers: { 'x-admin-token': token } })
      ]);

      if (!settingsRes.ok || !pagesRes.ok) {
        setLoading(false);
        setError('Failed to load settings.');
        return;
      }

      const settingsPayload = (await settingsRes.json()) as SettingsResponse;
      const pagesPayload = (await pagesRes.json()) as PageResponse;

      setSettings(settingsPayload.settings);
      setPages(pagesPayload.pages);
      setLoading(false);
    }
    load();
  }, [token]);

  const pageOptions = useMemo(
    () =>
      pages.map((page) => ({
        id: page.id,
        label: `${page.navLabel} (${page.id})`
      })),
    [pages]
  );

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setNotice('');
    setError('');

    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
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
  };

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!settings) return <p>Settings not available.</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Website Settings</h2>
          <button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
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
          </div>
        ) : null}

        {activeTab === 'writing' ? (
          <div className="admin-grid-2">
            <label>
              Default post category
              <input
                value={settings.writing.defaultPostCategory}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    writing: { ...settings.writing, defaultPostCategory: event.target.value }
                  })
                }
              />
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
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Settings"
      description="Configure General, Writing, Reading, Discussion, Media, Permalinks, SEO, and Sitemap behavior."
    >
      {(token) => <SettingsEditor token={token} />}
    </AdminShell>
  );
}
