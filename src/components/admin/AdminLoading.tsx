export function AdminLoading({ label }: { label?: string }) {
  return (
    <div className="admin-loading" role="status" aria-live="polite">
      <svg className="admin-spinner" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label ? <span className="admin-subtle">{label}</span> : null}
    </div>
  );
}
