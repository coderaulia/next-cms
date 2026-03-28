import Link from 'next/link';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import type { PortfolioProject } from '@/features/cms/types';

import { Reveal } from '@/components/animations/Reveal';

type PortfolioProjectViewProps = {
  project: PortfolioProject;
  related: PortfolioProject[];
  relatedServiceLink?: {
    href: string;
    label: string;
  } | null;
};

export function PortfolioProjectView({ project, related, relatedServiceLink = null }: PortfolioProjectViewProps) {
  const gallery = project.gallery.length > 0 ? project.gallery : [project.coverImage].filter(Boolean);

  return (
    <main className="bg-slate-50/30">
      <Reveal as="section" className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-deepSlate">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deepSlate/20 to-deepSlate/60" />

        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end pb-24">
          <div className="glass-panel p-8 md:p-12 max-w-4xl rounded-[2.5rem] bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/40">
            <div className="flex flex-wrap items-center gap-3 px-4 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-[10px] font-bold uppercase tracking-widest mb-8 w-fit">
              <span>{project.serviceType || 'Implementation'}</span>
              <span>•</span>
              <span>{project.industry || 'Industry'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-deepSlate leading-tight mb-6 tracking-tighter">
              {project.title}
            </h1>
            <p className="text-slate-600 text-lg font-light leading-relaxed mb-8">{project.summary}</p>
            <div className="flex flex-wrap gap-3">
              {project.tags.map((tag) => (
                <span
                  key={`${project.id}-${tag}`}
                  className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          <article className="admin-card lg:col-span-2">
            <h2>Challenge</h2>
            <p>{project.challenge || 'No challenge details provided yet.'}</p>
          </article>
          <article className="admin-card">
            <h2>Client</h2>
            <p>{project.clientName || 'Confidential client'}</p>
            <p className="admin-subtle">{project.serviceType || 'Implementation'}</p>
            <p className="admin-subtle">{project.industry || 'Industry not specified'}</p>
            {relatedServiceLink ? (
              <Link href={relatedServiceLink.href} className="v2-btn v2-btn-secondary">
                View {relatedServiceLink.label}
              </Link>
            ) : null}
            {project.projectUrl && (!relatedServiceLink || !project.projectUrl.startsWith('/')) ? (
              <Link
                href={project.projectUrl}
                className="v2-btn v2-btn-secondary"
                {...(project.projectUrl.startsWith('/') ? {} : { target: '_blank', rel: 'noreferrer' })}
              >
                {project.projectUrl.startsWith('/') ? 'Open Project Link' : 'Visit Project'}
              </Link>
            ) : null}
          </article>
          <article className="admin-card lg:col-span-3">
            <h2>Solution</h2>
            <p>{project.solution || 'No solution details provided yet.'}</p>
          </article>
          <article className="admin-card lg:col-span-3">
            <h2>Outcome</h2>
            <p>{project.outcome || 'No outcome details provided yet.'}</p>
          </article>
        </div>
      </Reveal>

      {gallery.length > 0 ? (
        <Reveal as="section" className="pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-display font-black text-deepSlate mb-8">Project Gallery</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {gallery.map((imageUrl, index) => (
                <div key={`${project.id}-gallery-${index}`} className="rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-lg shadow-slate-200/60">
                  <img src={imageUrl} alt={`${project.title} visual ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {related.length > 0 ? (
        <Reveal as="section" className="bg-white border-t border-slate-100 py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-electricBlue mb-4">More Projects</h4>
                <h2 className="text-4xl font-display font-black text-deepSlate">
                  Related <span className="text-electricBlue italic">Case Studies</span>
                </h2>
              </div>
              <Link href="/portfolio" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-deepSlate transition-colors">
                View All
                <SymbolIcon className="text-sm" name="arrow_forward" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/portfolio/${item.seo.slug}`}
                  className="glass-panel p-4 rounded-[2rem] bg-white hover:shadow-xl transition-all"
                >
                  <div className="aspect-video rounded-[1.5rem] bg-slate-100 overflow-hidden mb-4">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-electricBlue mb-2">
                    {item.serviceType || 'Implementation'}
                  </p>
                  <h3 className="text-lg font-display font-black text-deepSlate leading-tight mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}
    </main>
  );
}
