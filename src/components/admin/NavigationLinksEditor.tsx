'use client';

import { useRef, useState } from 'react';
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
    <div className={`admin-link-editor ${depth > 0 ? 'ml-8 mt-2 mb-2 border-l-2 border-slate-200 pl-4' : ''}`}>
      {depth === 0 && (
        <div className="admin-inline-header">
          <div>
            <h3 className="admin-section-heading">{label}</h3>
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
          <div
            key={item.id}
            className={`flex flex-col gap-2 ${dragOverIndex === index ? 'rounded-md outline outline-2 outline-blue-400' : ''}`}
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
            <div className="admin-link-row flex items-center gap-2">
              <span
                draggable
                role="button"
                aria-label="Drag to reorder"
                title="Drag to reorder"
                className="cursor-grab select-none px-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
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
                ⠿
              </span>
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
