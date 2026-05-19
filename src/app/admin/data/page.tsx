'use client';

import { useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { JsonImportExportCard } from '@/components/admin/JsonImportExportCard';
import type { CmsImportResult } from '@/features/cms/importExport';

function DataPage() {
  const [notice, setNotice] = useState('');

  const onImported = (label: string) => async (_result: CmsImportResult) => {
    setNotice(`${label} imported successfully.`);
  };

  return (
    <div className="admin-form-wrap">
      {notice ? <p className="admin-subtle">{notice}</p> : null}

      <JsonImportExportCard
        collection="fullSite"
        title="Full-site backup / restore"
        description="Export a complete CMS backup including settings, pages, posts, portfolio, categories, and media metadata. Use to migrate or restore the entire site."
        defaultMode="replace"
        importHint="Replace restores a complete backup. Merge is available for partial migrations between CMS instances."
        onImported={onImported('Full-site backup')}
      />

      <JsonImportExportCard
        collection="settings"
        title="Settings"
        description="Export or restore site settings without touching content."
        fixedMode="replace"
        importHint="Settings import replaces the current settings object entirely."
        onImported={onImported('Settings')}
      />

      <JsonImportExportCard
        collection="pages"
        title="Pages"
        description="Export or bulk-import landing pages."
        onImported={onImported('Pages')}
      />

      <JsonImportExportCard
        collection="blogPosts"
        title="Posts"
        description="Export or bulk-import blog posts."
        onImported={onImported('Posts')}
      />

      <JsonImportExportCard
        collection="portfolioProjects"
        title="Portfolio"
        description="Export or bulk-import portfolio case studies."
        onImported={onImported('Portfolio')}
      />
    </div>
  );
}

export default function AdminDataPage() {
  return (
    <AdminShell
      title="Data & Backup"
      description="Export and import CMS content. Accessible to admins and super admins only."
    >
      {(user) => {
        if (!user.permissions.includes('data:manage')) {
          return <p className="admin-subtle">You do not have permission to access this page.</p>;
        }
        return <DataPage />;
      }}
    </AdminShell>
  );
}
