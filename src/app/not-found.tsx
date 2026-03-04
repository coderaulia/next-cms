import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <div className="container">
        <h1>Page not found</h1>
        <p>The page you requested does not exist or is currently unpublished.</p>
        <Link href="/">Back to home</Link>
      </div>
    </main>
  );
}
