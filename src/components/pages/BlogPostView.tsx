import Link from 'next/link';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import type { BlogPost } from '@/features/cms/types';

import { formatDateLabel } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type BlogPostViewProps = {
  post: BlogPost;
  related: BlogPost[];
};

function toMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function BlogPostView({ post, related }: BlogPostViewProps) {
  return (
    <main className="bg-slate-50/30">
      <Reveal as="section" className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-deepSlate">
        {post.coverImage ? <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-40" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deepSlate/20 to-deepSlate/60" />

        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end pb-24">
          <div className="glass-panel p-8 md:p-12 max-w-3xl rounded-[2.5rem] bg-white/90 backdrop-blur-2xl shadow-2xl border border-white/40">
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-[10px] font-bold uppercase tracking-widest mb-8 w-fit">
              {post.tags[0] || 'Insight'} • {formatDateLabel(post.publishedAt || post.updatedAt) || 'Recent'}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-deepSlate leading-tight mb-8 tracking-tighter">
              {post.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                <SymbolIcon name="person" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-deepSlate">{post.author}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {toMinutes(post.content)} min read
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-12">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Topics</h4>
                <nav className="space-y-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-electricBlue transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </nav>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Back</h4>
                <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-electricBlue hover:text-deepSlate transition-colors">
                  <SymbolIcon className="text-sm" name="arrow_back" />
                  All insights
                </Link>
              </div>
            </div>
          </aside>

          <div className="flex-grow max-w-3xl">
            <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">{post.excerpt}</p>
            <article className="prose">
              <pre>{post.content}</pre>
            </article>

            <div className="mt-24 p-10 md:p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-24 h-24 rounded-[2rem] bg-amber-100 shrink-0 flex items-center justify-center">
                <SymbolIcon className="text-4xl text-amber-500" name="person" />
              </div>
              <div className="text-center md:text-left space-y-4">
                <h4 className="text-xl font-display font-black text-deepSlate">{post.author}</h4>
                <p className="text-slate-500 font-light leading-relaxed">
                  Technical contributor focused on performance-first architecture and scalable delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {related.length > 0 ? (
        <Reveal as="section" className="bg-white border-t border-slate-100 py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-electricBlue mb-4">Read Next</h4>
                <h2 className="text-4xl font-display font-black text-deepSlate">
                  Related <span className="text-electricBlue italic">Insights</span>
                </h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-deepSlate transition-colors">
                View All
                <SymbolIcon className="text-sm" name="arrow_forward" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.seo.slug}`}
                  className="glass-panel p-4 rounded-[2rem] bg-white hover:shadow-xl transition-all"
                >
                  <div className="aspect-video rounded-[1.5rem] bg-slate-100 overflow-hidden mb-4">
                    {item.coverImage ? <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" /> : null}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-electricBlue mb-2">
                    {item.tags[0] || 'Insight'}
                  </p>
                  <h3 className="text-lg font-display font-black text-deepSlate leading-tight mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}
    </main>
  );
}



