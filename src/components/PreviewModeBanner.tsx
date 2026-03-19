import Link from 'next/link';

type PreviewModeBannerProps = {
  path: string;
};

export function PreviewModeBanner({ path }: PreviewModeBannerProps) {
  const exitHref = `/api/admin/preview?action=disable&path=${encodeURIComponent(path)}`;

  return (
    <div className="preview-mode-banner">
      <div>
        <strong>Draft preview enabled</strong>
        <p className="admin-subtle">You are viewing unpublished or scheduled content.</p>
      </div>
      <Link href={exitHref} className="v2-btn v2-btn-secondary">
        Exit preview
      </Link>
    </div>
  );
}
