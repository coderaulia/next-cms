import { getPublishedBlogPosts, getSiteSettings } from '@/features/cms/publicApi';

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [settings, posts] = await Promise.all([getSiteSettings(), getPublishedBlogPosts()]);

  const indexingBlocked = settings.reading.discourageSearchEngines || settings.seo.defaultNoIndex;
  if (indexingBlocked) {
    return new Response('Feed disabled', { status: 404 });
  }

  const baseUrl = settings.baseUrl.replace(/\/+$/, '');
  const maxItems = Math.max(1, Math.min(settings.reading.feedItems || 10, 50));
  const fullContent = settings.reading.feedSummary === 'full';

  const items = posts.slice(0, maxItems).map((post) => {
    const url = `${baseUrl}/blog/${post.seo.slug}`;
    const pubDate = new Date(post.publishedAt || post.updatedAt).toUTCString();
    const description = escapeXml(post.excerpt || post.seo.metaDescription || '');
    const body = fullContent ? `\n      <content:encoded><![CDATA[${post.content.replace(/\]\]>/g, ']]&gt;')}]]></content:encoded>` : '';
    const categories = post.tags.map((tag) => `\n      <category>${escapeXml(tag)}</category>`).join('');
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author)}</author>
      <description>${description}</description>${categories}${body}
    </item>`;
  });

  const lastBuildDate = posts[0]
    ? new Date(posts[0].publishedAt || posts[0].updatedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(settings.general.siteName)} — Insights</title>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(settings.seo.defaultMetaDescription || settings.general.siteTagline)}</description>
    <language>${escapeXml(settings.general.language || 'en-US')}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
