'use client';

import { ReactNode } from 'react';

import { AdminAuthGate } from './AdminAuthGate';
import { AdminNav } from './AdminNav';

type AdminShellProps = {
  title: string;
  description?: string;
  children: (token: string) => ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <main className="admin-page">
      <div className="container">
        <AdminAuthGate>
          {(token) => (
            <>
              <h1>{title}</h1>
              {description ? <p className="muted">{description}</p> : null}
              <AdminNav />
              {children(token)}
            </>
          )}
        </AdminAuthGate>
      </div>
    </main>
  );
}
