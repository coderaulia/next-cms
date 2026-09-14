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
      style={{
        width: '100%',
        height: 'calc(100dvh - 56px)',
        minHeight: 'calc(100vh - 56px)',
        border: 'none',
        display: 'block'
      }}
      loading="lazy"
    />
  );
}
