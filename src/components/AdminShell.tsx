'use client';

import { ReactNode } from 'react';

import { AdminAuthGate } from './AdminAuthGate';
import { AdminNav } from './AdminNav';

type AdminShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: (token: string) => ReactNode;
};

export function AdminShell({ title, description, actions, children }: AdminShellProps) {
  return (
    <main className="admin-page">
      <AdminAuthGate>
        {(token) => (
          <div className="admin-shell">
            <AdminNav />
            <section className="admin-main">
              <header className="admin-main-header">
                <div>
                  <h1>{title}</h1>
                  {description ? <p>{description}</p> : null}
                </div>
                {actions ? <div>{actions}</div> : null}
              </header>
              {children(token)}
            </section>
          </div>
        )}
      </AdminAuthGate>
    </main>
  );
}
