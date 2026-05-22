'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

type EditorMode = 'visual' | 'markdown';

type RichContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  hasError?: boolean;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rce-toolbar-btn${active ? ' rce-toolbar-btn-active' : ''}`}
    >
      {children}
    </button>
  );
}

export function RichContentEditor({ value, onChange, rows = 14, className, hasError }: RichContentEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual');
  const [markdownValue, setMarkdownValue] = useState(value);

  // Keep a ref to the latest onChange so TipTap's onUpdate never calls a stale closure.
  // useEditor captures callbacks once at creation; without this, edits in visual mode
  // would call the onChange that was current at mount time, potentially overwriting
  // state changes (e.g. title edits) that happened after mount.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rce-visual-content'
      }
    },
    onUpdate({ editor: ed }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (ed.storage as any).markdown.getMarkdown() as string;
      onChangeRef.current(md);
    }
  });

  // Sync incoming value changes from parent (e.g. revision restore)
  const prevValue = useRef(value);
  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;

    if (mode === 'visual' && editor && !editor.isDestroyed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.commands.setContent(value as any, { emitUpdate: false } as any);
    } else {
      setMarkdownValue(value);
    }
  }, [value, editor, mode]);

  const switchToMarkdown = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (editor.storage as any).markdown.getMarkdown() as string;
    setMarkdownValue(md);
    onChange(md);
    setMode('markdown');
  }, [editor, onChange]);

  const switchToVisual = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.commands.setContent(markdownValue as any, { emitUpdate: false } as any);
    prevValue.current = markdownValue;
    setMode('visual');
  }, [editor, markdownValue]);

  const handleMarkdownChange = (next: string) => {
    setMarkdownValue(next);
    onChange(next);
  };

  if (!editor) {
    return (
      <div className={`rce-wrap${hasError ? ' rce-wrap-error' : ''}${className ? ` ${className}` : ''}`}>
        <textarea
          className={`rce-markdown-area${hasError ? ' admin-input-error' : ''}`}
          value={value}
          readOnly
          rows={rows}
          style={{ minHeight: `${rows * 1.6}rem`, opacity: 0.6 }}
          aria-label="Loading editor..."
        />
      </div>
    );
  }

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <div className={`rce-wrap${hasError ? ' rce-wrap-error' : ''}${className ? ` ${className}` : ''}`}>
      <div className="rce-toolbar">
        <div className="rce-toolbar-group">
          <ToolbarButton
            title="Bold (Ctrl+B)"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={mode === 'markdown'}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            title="Italic (Ctrl+I)"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={mode === 'markdown'}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            title="Strikethrough"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={mode === 'markdown'}
          >
            <s>S</s>
          </ToolbarButton>
          <ToolbarButton
            title="Code"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={mode === 'markdown'}
          >
            {'</>'}
          </ToolbarButton>
        </div>
        <div className="rce-toolbar-group">
          <ToolbarButton
            title="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={mode === 'markdown'}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            title="Heading 3"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={mode === 'markdown'}
          >
            H3
          </ToolbarButton>
        </div>
        <div className="rce-toolbar-group">
          <ToolbarButton
            title="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={mode === 'markdown'}
          >
            ≡
          </ToolbarButton>
          <ToolbarButton
            title="Ordered list"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={mode === 'markdown'}
          >
            1.
          </ToolbarButton>
          <ToolbarButton
            title="Blockquote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={mode === 'markdown'}
          >
            &ldquo;
          </ToolbarButton>
          <ToolbarButton
            title="Code block"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={mode === 'markdown'}
          >
            {'{ }'}
          </ToolbarButton>
        </div>
        <div className="rce-toolbar-group">
          <ToolbarButton
            title="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={mode === 'markdown'}
          >
            —
          </ToolbarButton>
          <ToolbarButton
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={mode === 'markdown' || !canUndo}
          >
            ↩
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={mode === 'markdown' || !canRedo}
          >
            ↪
          </ToolbarButton>
        </div>
        <div className="rce-toolbar-mode">
          <button
            type="button"
            className={`rce-mode-btn${mode === 'visual' ? ' rce-mode-btn-active' : ''}`}
            onClick={switchToVisual}
            title="Visual editor"
          >
            Visual
          </button>
          <button
            type="button"
            className={`rce-mode-btn${mode === 'markdown' ? ' rce-mode-btn-active' : ''}`}
            onClick={switchToMarkdown}
            title="Markdown source"
          >
            Markdown
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <EditorContent editor={editor} className="rce-editor-area" />
      ) : (
        <textarea
          className={`rce-markdown-area${hasError ? ' admin-input-error' : ''}`}
          value={markdownValue}
          onChange={(e) => handleMarkdownChange(e.target.value)}
          rows={rows}
          style={{ minHeight: `${rows * 1.6}rem` }}
          spellCheck
        />
      )}
    </div>
  );
}
