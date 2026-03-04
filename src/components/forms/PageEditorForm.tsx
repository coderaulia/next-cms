'use client';

import { useState } from 'react';

import type { LandingPage, PageSection } from '@/features/cms/types';

type PageEditorFormProps = {
  initialPage: LandingPage;
  adminToken: string;
};

function newSection(index: number): PageSection {
  return {
    id: `section-${index + 1}`,
    heading: 'New section heading',
    body: 'Describe this section content.',
    ctaLabel: 'Learn more',
    ctaHref: '#',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked',
    theme: {
      background: '#f9fafb',
      text: '#111827',
      accent: '#0f766e'
    }
  };
}

export function PageEditorForm({ initialPage, adminToken }: PageEditorFormProps) {
  const [page, setPage] = useState(initialPage);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const savePage = async () => {
    setSaving(true);
    setNotice('');
    const response = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(page)
    });
    setSaving(false);
    if (!response.ok) {
      setNotice('Failed to save page');
      return;
    }
    const payload = (await response.json()) as { page: LandingPage };
    setPage(payload.page);
    setNotice('Page saved');
  };

  return (
    <div className="admin-form-wrap">
      <div className="admin-card">
        <h2>Page Settings</h2>
        <label>
          Page title
          <input
            value={page.title}
            onChange={(event) => setPage({ ...page, title: event.target.value })}
          />
        </label>
        <label>
          Nav label
          <input
            value={page.navLabel}
            onChange={(event) => setPage({ ...page, navLabel: event.target.value })}
          />
        </label>
        <label>
          Published
          <input
            type="checkbox"
            checked={page.published}
            onChange={(event) => setPage({ ...page, published: event.target.checked })}
          />
        </label>
      </div>

      <div className="admin-card">
        <h2>SEO</h2>
        <label>
          Meta title
          <input
            value={page.seo.metaTitle}
            onChange={(event) =>
              setPage({
                ...page,
                seo: { ...page.seo, metaTitle: event.target.value }
              })
            }
          />
        </label>
        <label>
          Meta description
          <textarea
            value={page.seo.metaDescription}
            onChange={(event) =>
              setPage({
                ...page,
                seo: { ...page.seo, metaDescription: event.target.value }
              })
            }
          />
        </label>
        <label>
          Slug
          <input
            value={page.seo.slug}
            onChange={(event) =>
              setPage({
                ...page,
                seo: { ...page.seo, slug: event.target.value }
              })
            }
          />
        </label>
        <label>
          Canonical URL
          <input
            value={page.seo.canonical}
            onChange={(event) =>
              setPage({
                ...page,
                seo: { ...page.seo, canonical: event.target.value }
              })
            }
          />
        </label>
        <label>
          Social image URL
          <input
            value={page.seo.socialImage}
            onChange={(event) =>
              setPage({
                ...page,
                seo: { ...page.seo, socialImage: event.target.value }
              })
            }
          />
        </label>
        <label>
          Noindex
          <input
            type="checkbox"
            checked={page.seo.noIndex}
            onChange={(event) =>
              setPage({
                ...page,
                seo: { ...page.seo, noIndex: event.target.checked }
              })
            }
          />
        </label>
      </div>

      <div className="admin-card">
        <div className="admin-inline-header">
          <h2>Sections</h2>
          <button
            type="button"
            onClick={() =>
              setPage({
                ...page,
                sections: [...page.sections, newSection(page.sections.length)]
              })
            }
          >
            Add section
          </button>
        </div>
        {page.sections.map((section, index) => (
          <div className="section-editor" key={section.id}>
            <div className="admin-inline-header">
              <h3>
                Section {index + 1}: {section.id}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setPage({
                    ...page,
                    sections: page.sections.filter((item) => item.id !== section.id)
                  })
                }
              >
                Remove
              </button>
            </div>
            <label>
              Section ID
              <input
                value={section.id}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], id: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Heading
              <input
                value={section.heading}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], heading: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Body
              <textarea
                value={section.body}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], body: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Layout
              <select
                value={section.layout}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = {
                    ...sections[index],
                    layout: event.target.value === 'split' ? 'split' : 'stacked'
                  };
                  setPage({ ...page, sections });
                }}
              >
                <option value="stacked">Stacked</option>
                <option value="split">Split</option>
              </select>
            </label>
            <label>
              CTA Label
              <input
                value={section.ctaLabel}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], ctaLabel: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              CTA Href
              <input
                value={section.ctaHref}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], ctaHref: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Image URL
              <input
                value={section.mediaImage}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], mediaImage: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Image Alt
              <input
                value={section.mediaAlt}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = { ...sections[index], mediaAlt: event.target.value };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Background color
              <input
                value={section.theme.background}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = {
                    ...sections[index],
                    theme: { ...sections[index].theme, background: event.target.value }
                  };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Text color
              <input
                value={section.theme.text}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = {
                    ...sections[index],
                    theme: { ...sections[index].theme, text: event.target.value }
                  };
                  setPage({ ...page, sections });
                }}
              />
            </label>
            <label>
              Accent color
              <input
                value={section.theme.accent}
                onChange={(event) => {
                  const sections = [...page.sections];
                  sections[index] = {
                    ...sections[index],
                    theme: { ...sections[index].theme, accent: event.target.value }
                  };
                  setPage({ ...page, sections });
                }}
              />
            </label>
          </div>
        ))}
      </div>

      <button type="button" onClick={savePage} disabled={saving}>
        {saving ? 'Saving...' : 'Save page'}
      </button>
      {notice ? <p>{notice}</p> : null}
    </div>
  );
}
