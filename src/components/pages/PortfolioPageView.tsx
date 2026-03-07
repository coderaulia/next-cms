import Link from 'next/link';

import type { PortfolioProject } from '@/features/cms/types';

import { formatDateLabel } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type PortfolioPageViewProps = {
  projects: PortfolioProject[];
  query: string;
  activeTag: string;
  page: number;
  pageSize?: number;
};

const defaultPageSize = 6;

function urlForPortfolio(query: string, tag: string, page: number) {
  const params = new URLSearchParams();
  if (query.trim().length > 0) params.set('q', query.trim());
  if (tag !== 'all') params.set('tag', tag);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs.length > 0 ? `/portfolio?${qs}` : '/portfolio';
}

export function PortfolioPageView({
  projects,
  query,
  activeTag,
  page,
  pageSize = defaultPageSize
}: PortfolioPageViewProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTag = activeTag.trim().toLowerCase() || 'all';

  const tags = Array.from(
    new Set(projects.flatMap((project) => project.tags.map((tag) => tag.trim())).filter(Boolean))
  );

  const filtered = projects.filter((project) => {
    if (normalizedTag !== 'all' && !project.tags.some((tag) => tag.toLowerCase() === normalizedTag)) {
      return false;
    }
    if (normalizedQuery.length === 0) return true;

    const haystack = `${project.title} ${project.summary} ${project.clientName} ${project.serviceType} ${project.industry}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const featured = sorted.find((project) => project.featured) ?? sorted[0] ?? null;
  const collection = featured ? sorted.filter((project) => project.id !== featured.id) : sorted;

  const totalPages = Math.max(1, Math.ceil(collection.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = collection.slice(start, start + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <main>
      <Reveal as="section" className="relative pt-32 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-slate-50/50 border border-slate-100/50 mb-8 backdrop-blur-sm mx-auto">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Case Studies</span>
          </div>
          <h1 className="hero-heading-safe font-display font-black text-deepSlate leading-[0.95] tracking-tighter mb-8">
            Portfolio of
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light inline-block px-1 sm:px-2">
              Delivered Results
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">
            Real projects, measurable outcomes, and production-grade implementations delivered for growth-focused teams.
          </p>
        </div>
      </Reveal>

      {featured ? (
        <Reveal as="section" className="py-12 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <Link
              href={`/portfolio/${featured.seo.slug}`}
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
                      Featured Project
                    </span>
                  </div>
                </div>

                <div className="p-8 lg:p-12 space-y-8">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-electricBlue">
                      {featured.serviceType || 'Implementation'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-black text-deepSlate leading-tight group-hover:text-electricBlue transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-slate-500 font-light leading-relaxed text-lg">{featured.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {featured.tags.map((tag) => (
                      <span
                        key={`${featured.id}-${tag}`}
                        className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div>
                      <h4 className="text-sm font-bold text-deepSlate">{featured.clientName || 'Confidential client'}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDateLabel(featured.publishedAt || featured.updatedAt) || 'Recently delivered'}
                      </p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-electricBlue flex items-center gap-2 group/link">
                      View Case Study
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
                href={urlForPortfolio(query, 'all', 1)}
                className={`px-6 py-2 font-bold text-[10px] uppercase tracking-widest rounded-full whitespace-nowrap border transition-all ${normalizedTag === 'all' ? 'bg-deepSlate text-white border-deepSlate' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:text-deepSlate'}`}
              >
                All Projects
              </Link>
              {tags.map((tag) => {
                const normalized = tag.toLowerCase();
                const active = normalizedTag === normalized;
                return (
                  <Link
                    key={tag}
                    href={urlForPortfolio(query, normalized, 1)}
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
                id="portfolio-search"
                name="q"
                defaultValue={query}
                placeholder="Search projects..."
                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none text-xs font-medium"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">
                search
              </span>
            </form>
          </div>

          {visible.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((project) => (
                <Link
                  key={project.id}
                  href={`/portfolio/${project.seo.slug}`}
                  className="glass-panel p-4 rounded-[2.5rem] bg-white group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="bg-blue-100/30 aspect-video rounded-[2rem] mb-8 overflow-hidden relative">
                    {project.coverImage ? (
                      <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    {project.featured ? (
                      <span className="absolute top-4 left-4 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 text-electricBlue font-bold text-[8px] uppercase tracking-widest rounded-full z-10">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <div className="px-6 pb-6 space-y-4 flex-grow flex flex-col">
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{project.serviceType || 'Implementation'}</span>
                      <span>•</span>
                      <span>{project.clientName || 'Confidential'}</span>
                    </div>
                    <h3 className="text-xl font-display font-black text-deepSlate group-hover:text-electricBlue transition-colors leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed mb-4 flex-grow">
                      {project.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={`${project.id}-${tag}`}
                          className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[8px] font-bold uppercase tracking-wider text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-4 border-t border-slate-50">
                      View Case Study
                      <span className="material-symbols-outlined text-xs">arrow_outward</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-[2rem] text-center text-slate-500">
              No portfolio projects match your current filter.
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-20 flex justify-center items-center gap-4">
              <Link
                href={urlForPortfolio(query, normalizedTag, Math.max(1, currentPage - 1))}
                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-deepSlate hover:text-white transition-all"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </Link>

              {pageNumbers.map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={urlForPortfolio(query, normalizedTag, pageNumber)}
                  className={`w-10 h-10 rounded-full font-bold text-[10px] flex items-center justify-center transition-all ${pageNumber === currentPage ? 'bg-deepSlate text-white' : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-deepSlate border border-transparent hover:border-slate-100'}`}
                >
                  {pageNumber}
                </Link>
              ))}

              <Link
                href={urlForPortfolio(query, normalizedTag, Math.min(totalPages, currentPage + 1))}
                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-deepSlate hover:text-white transition-all"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          ) : null}
        </div>
      </Reveal>
    </main>
  );
}
