'use client';

import { useState } from 'react';
import { Database, Info } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import { JsonImportExportCard } from '@/components/admin/JsonImportExportCard';

function DataPage() {
  const [notice, setNotice] = useState('');

  const onImported = (label: string) => async () => {
    setNotice(`${label} imported successfully.`);
  };

  return (
    <div className="admin-form-wrap">
      {/* Overview & Security Guidance Card */}
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="m-0 text-lg font-bold text-slate-900">Content Portability &amp; Backups</h2>
            </div>
            <p className="admin-subtle text-xs mt-1">
              Export complete backups or migrate individual content types between local development and production databases.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>JSON exports match validated CMS schemas</span>
          </div>
        </div>

        {notice ? (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
            {notice}
          </div>
        ) : null}
      </section>

      {/* Full-site Backup / Restore */}
      <JsonImportExportCard
        collection="fullSite"
        title="Full-site backup / restore"
        description="Export a complete CMS backup including settings, pages, posts, portfolio, categories, and media metadata. Use to migrate or restore the entire site."
        defaultMode="replace"
        importHint="Replace restores a complete backup. Merge is available for partial migrations between CMS instances."
        onImported={onImported('Full-site backup')}
      />

      {/* Collection Cards */}
      <div className="space-y-4">
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
          return (
            <section className="admin-card">
              <p className="admin-subtle">You do not have permission to access data import and export.</p>
            </section>
          );
        }
        return <DataPage />;
      }}
    </AdminShell>
  );
}
