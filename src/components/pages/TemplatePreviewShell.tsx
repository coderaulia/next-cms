'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { TemplateMetadata } from '@/components/templates/registry';

type TemplatePreviewShellProps = {
  template: TemplateMetadata;
  children: ReactNode;
};

export function TemplatePreviewShell({ template, children }: TemplatePreviewShellProps) {
  return (
    <div className="v-tmpl-preview-root">
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

      <div className="v-tmpl-preview-body">
        {children ?? (
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
