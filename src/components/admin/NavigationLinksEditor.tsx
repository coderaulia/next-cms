'use client';

import type { NavigationLink } from '@/features/cms/types';

type NavigationLinksEditorProps = {
  label: string;
  description?: string;
  items: NavigationLink[];
  prefix: string;
  onChange: (items: NavigationLink[]) => void;
};

export function NavigationLinksEditor({
  label,
  description,
  items,
  prefix,
  onChange
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
        id: `${prefix}-${items.length + 1}`,
        label: '',
        href: '',
        enabled: true
      }
    ]);
  };

  return (
    <div className="admin-link-editor">
      <div className="admin-inline-header">
        <div>
          <p className="admin-kpi-label">{label}</p>
          {description ? <p className="admin-subtle">{description}</p> : null}
        </div>
        <button type="button" className="v2-btn v2-btn-secondary" onClick={addItem}>
          Add link
        </button>
      </div>

      {items.length === 0 ? <p className="admin-subtle">No links added yet.</p> : null}

      <div className="admin-link-list">
        {items.map((item, index) => (
          <div className="admin-link-row" key={item.id}>
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
            <label className="admin-link-toggle">
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
          </div>
        ))}
      </div>
    </div>
  );
}