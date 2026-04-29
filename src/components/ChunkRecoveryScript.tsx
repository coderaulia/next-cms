const chunkRecoverySource = `
(() => {
  const reloadKey = 'cms.chunk-reload-at';
  const reloadWindowMs = 15000;

  const readMessage = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value.message === 'string') return value.message;
    return '';
  };

  const isChunkLoadError = (value) => {
    const message = readMessage(value);
    return /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module|CSS_CHUNK_LOAD_FAILED/i.test(message);
  };

  const reloadOnce = () => {
    try {
      const lastReloadAt = Number(window.sessionStorage.getItem(reloadKey) || '0');
      if (lastReloadAt && Date.now() - lastReloadAt < reloadWindowMs) {
        return;
      }
      window.sessionStorage.setItem(reloadKey, String(Date.now()));
    } catch {}

    window.location.reload();
  };

  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
      reloadOnce();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      reloadOnce();
    }
  });

  window.setTimeout(() => {
    try {
      window.sessionStorage.removeItem(reloadKey);
    } catch {}
  }, reloadWindowMs);
})();
`;

export function ChunkRecoveryScript({ nonce }: { nonce?: string }) {
  return (
    <script
      id="cms-chunk-recovery"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: chunkRecoverySource }}
      suppressHydrationWarning
    />
  );
}
