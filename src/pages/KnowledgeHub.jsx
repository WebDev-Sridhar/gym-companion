import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ArrowLeft, Clock, Search } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { guides } from '../data/guides';

export default function KnowledgeHub() {
  const [activeGuide, setActiveGuide] = useState(null);
  const [search, setSearch] = useState('');

  const categories = [...new Set(guides.map((g) => g.category))];
  const filtered = search ? guides.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase())) : guides;

  if (activeGuide) {
    const guide = guides.find((g) => g.id === activeGuide);
    return (
      <PageWrapper>
        <button onClick={() => setActiveGuide(null)} className="flex items-center gap-1 text-accent text-sm font-medium mb-8 hover:underline">
          <ArrowLeft size={14} /> Back to Guides
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{guide.icon}</span>
            <div>
              <span className="text-[11px] text-accent font-medium uppercase tracking-wider">{guide.category}</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">{guide.title}</h1>
            </div>
          </div>
          <p className="text-text-muted text-sm flex items-center gap-1 mb-10"><Clock size={13} /> {guide.readTime} read</p>

          <div className="space-y-4">
            {guide.content.map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="border border-white/[0.06] rounded-xl p-5 sm:p-6">
                <h3 className="text-base font-bold mb-2 text-accent">{section.heading}</h3>
                <p className="text-text-muted leading-relaxed text-sm">{section.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
        <span className="gradient-text">Knowledge</span> <span className="text-text-primary">Hub</span>
      </h1>
      <p className="text-text-muted text-sm mb-8">Everything you need to know about fitness, explained simply.</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guides..." className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-white/20 transition-colors" />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button onClick={() => setSearch('')} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${!search ? 'bg-white text-black' : 'border border-white/[0.06] text-text-muted hover:text-text-secondary'}`}>All</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSearch(cat)} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${search === cat ? 'bg-white text-black' : 'border border-white/[0.06] text-text-muted hover:text-text-secondary'}`}>{cat}</button>
        ))}
      </div>

      {/* Guide Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((guide, i) => (
          <motion.button
            key={guide.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setActiveGuide(guide.id)}
            className="border border-white/[0.06] rounded-xl p-5 text-left transition-all group w-full hover:border-white/[0.12]"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{guide.icon}</span>
              <ChevronRight size={14} className="text-text-muted group-hover:text-text-muted transition-colors mt-1" />
            </div>
            <h3 className="font-bold text-text-primary text-sm mb-1">{guide.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-accent font-medium">{guide.category}</span>
              <span className="text-[11px] text-text-muted flex items-center gap-1"><Clock size={10} /> {guide.readTime}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </PageWrapper>
  );
}
