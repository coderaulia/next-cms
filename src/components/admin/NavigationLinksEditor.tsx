'use client';

import type { NavigationLink } from '@/features/cms/types';

type NavigationLinksEditorProps = {
  label: string;
  description?: string;
  items: NavigationLink[];
  prefix: string;
  onChange: (items: NavigationLink[]) => void;
  depth?: number;
};

export function NavigationLinksEditor({
  label,
  description,
  items,
  prefix,
  onChange,
  depth = 0
}: NavigationLinksEditorProps) {
  const updateItem = (index: number, patch: Partial<NavigationLink>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: `${prefix}-${items.length + 1}-${Date.now()}`,
        label: '',
        href: '',
        enabled: true
      }
    ]);
  };

  return (
    <div className={`admin-link-editor ${depth > 0 ? 'ml-8 mt-2 mb-2 border-l-2 border-slate-200 pl-4' : ''}`}>
      {depth === 0 && (
        <div className="admin-inline-header">
          <div>
            <p className="admin-kpi-label">{label}</p>
            {description ? <p className="admin-subtle">{description}</p> : null}
          </div>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={addItem}>
            Add link
          </button>
        </div>
      )}

      {items.length === 0 && depth === 0 ? <p className="admin-subtle">No links added yet.</p> : null}

      <div className="admin-link-list flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="admin-link-row flex items-center gap-2">
              <input
                value={item.label}
                onChange={(event) => updateItem(index, { label: event.target.value })}
                placeholder="Label"
              />
              <input
                value={item.href}
                onChange={(event) => updateItem(index, { href: event.target.value })}
                placeholder="/contact"
              />
              <label className="admin-link-toggle flex items-center gap-2 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(event) => updateItem(index, { enabled: event.target.checked })}
                />
                Enabled
              </label>
              <button type="button" className="v2-btn v2-btn-secondary" onClick={() => removeItem(item.id)}>
                Remove
              </button>
              {depth === 0 && (
                <button
                  type="button"
                  className="v2-btn v2-btn-secondary"
                  onClick={() => {
                    const children = item.children || [];
                    updateItem(index, {
                      children: [
                        ...children,
                        {
                          id: `${item.id}-child-${children.length + 1}-${Date.now()}`,
                          label: '',
                          href: '',
                          enabled: true
                        }
                      ]
                    });
                  }}
                >
                  Add sub-link
                </button>
              )}
            </div>
            
            {item.children && item.children.length > 0 && (
              <NavigationLinksEditor
                label=""
                items={item.children}
                prefix={`${item.id}-child`}
                onChange={(newChildren) => updateItem(index, { children: newChildren })}
                depth={depth + 1}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}