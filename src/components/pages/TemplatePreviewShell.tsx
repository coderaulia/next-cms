'use client';

import Link from 'next/link';
import type { TemplateEntry } from '@/components/templates/registry';

type TemplatePreviewShellProps = {
  template: TemplateEntry;
};

export function TemplatePreviewShell({ template }: TemplatePreviewShellProps) {
  const Component = template.component;

  return (
    <div className="v-tmpl-preview-root">
      {/* Thin preview bar */}
      <header className="v-tmpl-preview-bar">
        <Link href="/templates" className="v-tmpl-preview-back">
          <span aria-hidden>←</span>
          <span>Templates</span>
        </Link>
        <div className="v-tmpl-preview-info">
          <span className="v-tmpl-preview-name">{template.name}</span>
          <span className="v-tmpl-preview-pill">{template.category}</span>
        </div>
        <div className="v-tmpl-preview-tags">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="v-tmpl-tag v-tmpl-tag-dark">{tag}</span>
          ))}
        </div>
      </header>

      {/* Template rendered full-width */}
      <div className="v-tmpl-preview-body">
        {Component ? (
          <Component />
        ) : (
          <div className="v-tmpl-preview-coming-soon">
            <span className="v-tmpl-empty-glyph">◈</span>
            <h2>{template.name}</h2>
            <p>Template file not yet attached. Drop the component into the registry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
