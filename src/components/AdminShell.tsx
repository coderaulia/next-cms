'use client';

import { ReactNode } from 'react';

import type { AdminSessionUser } from '@/features/cms/adminTypes';

import { AdminAuthGate } from './AdminAuthGate';
import { AdminNav } from './AdminNav';

type AdminShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode | ((user: AdminSessionUser) => ReactNode);
  children: (user: AdminSessionUser) => ReactNode;
};

export function AdminShell({ title, description, actions, children }: AdminShellProps) {
  return (
    <main className="admin-page">
      <AdminAuthGate>
        {(user) => (
          <div className="admin-shell">
            <AdminNav user={user} />
            <section className="admin-main">
              <header className="admin-main-header">
                <div>
                  <h1>{title}</h1>
                  {description ? <p>{description}</p> : null}
                </div>
                {actions ? <div>{typeof actions === 'function' ? actions(user) : actions}</div> : null}
              </header>
              {children(user)}
            </section>
          </div>
        )}
      </AdminAuthGate>
    </main>
  );
}
