'use client';

type Props = {
  src: string;
  title?: string;
};

export function HtmlTemplateViewer({ src, title = 'Template Preview' }: Props) {
  return (
    <iframe
      src={src}
      title={title}
      style={{ width: '100%', height: 'calc(100vh - 48px)', border: 'none', display: 'block' }}
      loading="lazy"
    />
  );
}
