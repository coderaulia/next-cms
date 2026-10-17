'use client';

import { useRef, useState } from 'react';
import { CornerDownRight, GripVertical, Plus, Trash2 } from 'lucide-react';
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
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDrop = (targetIndex: number) => {
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    setDragOverIndex(null);
    if (fromIndex === null || fromIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className={`admin-link-editor ${depth > 0 ? 'ml-6 mt-2 mb-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3' : ''}`}>
      {depth === 0 && (
        <div className="admin-inline-header" style={{ alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 className="admin-section-heading" style={{ margin: 0 }}>{label}</h3>
            {description ? <p className="admin-subtle" style={{ margin: '2px 0 0' }}>{description}</p> : null}
          </div>
          <button
            type="button"
            className="v2-btn v2-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '5px 12px' }}
            onClick={addItem}
          >
            <Plus size={14} />
            <span>Add link</span>
          </button>
        </div>
      )}

      {items.length === 0 && depth === 0 ? <p className="admin-subtle" style={{ margin: '8px 0' }}>No links added yet.</p> : null}

      <div className="admin-link-list flex flex-col gap-2.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex flex-col gap-2 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all ${
              dragOverIndex === index ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
            }`}
            onDragOver={(event) => {
              if (dragIndexRef.current === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (dragOverIndex !== index) setDragOverIndex(index);
            }}
            onDragLeave={() => {
              if (dragOverIndex === index) setDragOverIndex(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDrop(index);
            }}
          >
            <div className="admin-link-row flex items-center gap-2.5 flex-wrap">
              <span
                draggable
                role="button"
                aria-label="Drag to reorder"
                title="Drag to reorder"
                className="cursor-grab select-none p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing rounded hover:bg-slate-200/50"
                onDragStart={(event) => {
                  dragIndexRef.current = index;
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', item.id);
                }}
                onDragEnd={() => {
                  dragIndexRef.current = null;
                  setDragOverIndex(null);
                }}
              >
                <GripVertical size={16} />
              </span>
              <input
                value={item.label}
                onChange={(event) => updateItem(index, { label: event.target.value })}
                placeholder="Link label (e.g. Services)"
                style={{ flex: 1, minWidth: 140 }}
              />
              <input
                value={item.href}
                onChange={(event) => updateItem(index, { href: event.target.value })}
                placeholder="Target URL (e.g. /service)"
                style={{ flex: 1.2, minWidth: 160 }}
              />
              <label className="admin-link-toggle flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(event) => updateItem(index, { enabled: event.target.checked })}
                />
                Enabled
              </label>
              {depth === 0 && (
                <button
                  type="button"
                  className="v2-btn v2-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', padding: '5px 8px' }}
                  title="Add child menu link under this item"
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
                  <CornerDownRight size={13} />
                  <span>Sub-link</span>
                </button>
              )}
              <button
                type="button"
                className="v2-btn v2-btn-secondary"
                style={{ padding: '5px 8px', color: '#ef4444' }}
                title="Remove link"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={14} />
              </button>
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
