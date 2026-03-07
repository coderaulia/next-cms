import Link from 'next/link';

import type { BlogPost } from '@/features/cms/types';

import { formatDateLabel } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type BlogPageViewProps = {
  posts: BlogPost[];
  query: string;
  activeTag: string;
  page: number;
  pageSize?: number;
};

const defaultPageSize = 6;

function toMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function urlForBlog(query: string, tag: string, page: number) {
  const params = new URLSearchParams();
  if (query.trim().length > 0) params.set('q', query.trim());
  if (tag !== 'all') params.set('tag', tag);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs.length > 0 ? `/blog?${qs}` : '/blog';
}

export function BlogPageView({ posts, query, activeTag, page, pageSize = defaultPageSize }: BlogPageViewProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTag = activeTag.trim().toLowerCase() || 'all';

  const tags = Array.from(new Set(posts.flatMap((post) => post.tags.map((tag) => tag.trim())).filter(Boolean)));

  const filtered = posts.filter((post) => {
    if (normalizedTag !== 'all' && !post.tags.some((tag) => tag.toLowerCase() === normalizedTag)) {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = `${post.title} ${post.excerpt} ${post.author} ${post.tags.join(' ')}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const featured = filtered[0] ?? null;
  const collection = featured ? filtered.slice(1) : filtered;

  const totalPages = Math.max(1, Math.ceil(collection.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = collection.slice(start, start + pageSize);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <main>
      <Reveal as="section" className="relative pt-32 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-slate-50/50 border border-slate-100/50 mb-8 backdrop-blur-sm mx-auto">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Digital Intelligence</span>
          </div>
          <h1 className="hero-heading-safe font-display font-black text-deepSlate leading-[0.95] tracking-tighter mb-8">
            Insights on
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light inline-block px-1 sm:px-2">
              Engineering &amp; Growth
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">
            Technical leadership, performance optimization, and digital strategy for the engineering-minded entrepreneur.
          </p>
        </div>
      </Reveal>

      {featured ? (
        <Reveal as="section" className="py-12 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <Link
              href={`/blog/${featured.seo.slug}`}
              className="glass-panel p-4 rounded-[3rem] bg-white overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-700 block"
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="bg-deepSlate aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden relative">
                  {featured.coverImage ? (
                    <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-electricBlue/20 to-transparent z-10" />
                  <div className="absolute bottom-8 left-8 z-20">
                    <span className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-full group-hover:bg-white group-hover:text-deepSlate transition-colors">
                      Featured Article
                    </span>
                  </div>
                </div>

                <div className="p-8 lg:p-12 space-y-8">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-electricBlue">
                      {featured.tags[0] || 'Engineering'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-black text-deepSlate leading-tight group-hover:text-electricBlue transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-slate-500 font-light leading-relaxed text-lg">{featured.excerpt}</p>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-deepSlate">{featured.author}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatDateLabel(featured.publishedAt || featured.updatedAt) || 'Recently published'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-electricBlue flex items-center gap-2 group/link">
                      Read Article
                      <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </Reveal>
      ) : null}

      <Reveal as="section" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
              <Link
                href={urlForBlog(query, 'all', 1)}
                className={`px-6 py-2 font-bold text-[10px] uppercase tracking-widest rounded-full whitespace-nowrap border transition-all ${normalizedTag === 'all' ? 'bg-deepSlate text-white border-deepSlate' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:text-deepSlate'}`}
              >
                All Insights
              </Link>
              {tags.map((tag) => {
                const normalized = tag.toLowerCase();
                const active = normalizedTag === normalized;
                return (
                  <Link
                    key={tag}
                    href={urlForBlog(query, normalized, 1)}
                    className={`px-6 py-2 font-bold text-[10px] uppercase tracking-widest rounded-full border whitespace-nowrap transition-all ${active ? 'bg-deepSlate text-white border-deepSlate' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:text-deepSlate'}`}
                  >
                    {tag}
                  </Link>
                );
              })}
            </div>

            <form method="get" className="relative w-full md:w-72">
              {normalizedTag !== 'all' ? <input type="hidden" name="tag" value={normalizedTag} /> : null}
              <input
                type="text"
                id="blog-search"
                name="q"
                defaultValue={query}
                placeholder="Search insights..."
                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none text-xs font-medium"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">
                search
              </span>
            </form>
          </div>

          {visible.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.seo.slug}`}
                  className="glass-panel p-4 rounded-[2.5rem] bg-white group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="bg-blue-100/30 aspect-video rounded-[2rem] mb-8 overflow-hidden relative">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    <span className="absolute top-4 left-4 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 text-electricBlue font-bold text-[8px] uppercase tracking-widest rounded-full z-10">
                      {post.tags[0] || 'Insight'}
                    </span>
                  </div>
                  <div className="px-6 pb-6 space-y-4 flex-grow flex flex-col">
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{formatDateLabel(post.publishedAt || post.updatedAt) || 'Recent'}</span>
                      <span>•</span>
                      <span>{toMinutes(post.content)} min read</span>
                    </div>
                    <h3 className="text-xl font-display font-black text-deepSlate group-hover:text-electricBlue transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-4 border-t border-slate-50">
                      Read More
                      <span className="material-symbols-outlined text-xs">arrow_outward</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-[2rem] text-center text-slate-500">
              No insights match your current filter.
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-20 flex justify-center items-center gap-4">
              <Link
                href={urlForBlog(query, normalizedTag, Math.max(1, currentPage - 1))}
                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-deepSlate hover:text-white transition-all"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </Link>

              {pageNumbers.map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={urlForBlog(query, normalizedTag, pageNumber)}
                  className={`w-10 h-10 rounded-full font-bold text-[10px] flex items-center justify-center transition-all ${pageNumber === currentPage ? 'bg-deepSlate text-white' : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-deepSlate border border-transparent hover:border-slate-100'}`}
                >
                  {pageNumber}
                </Link>
              ))}

              <Link
                href={urlForBlog(query, normalizedTag, Math.min(totalPages, currentPage + 1))}
                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-deepSlate hover:text-white transition-all"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          ) : null}
        </div>
      </Reveal>

      <Reveal as="section" className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-50">
          <div className="absolute top-0 right-[-10%] w-[60%] h-[120%] shard-gradient-1 rotate-12 opacity-30" />
          <div className="absolute bottom-0 left-[-10%] w-[60%] h-[120%] shard-gradient-2 -rotate-12 opacity-30" />
        </div>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white/50 w-full">
            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <h2 className="cta-heading-safe font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                Ready to build your
                <br />
                <span className="text-brand-gradient italic font-light inline-block px-1 sm:px-2">own success story?</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
                Let&apos;s discuss how our engineering approach can solve your specific business challenges.
              </p>
              <Link
                href="/contact"
                className="group relative px-12 py-6 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 inline-block"
              >
                <span className="relative z-10 group-hover:text-white transition-colors">
                  Claim Free Consultation
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-electricBlue to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}







