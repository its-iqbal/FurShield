import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ArticleService from '../../api/articleService.js';

const CATEGORIES = ['all','nutrition','grooming','training','health','behavior','general'];
const PET_TYPES  = ['all','dog','cat','bird','rabbit','reptile','fish'];
const MEDIA_TYPES= ['all','article','video','infographic'];

const CATEGORY_EMOJI = { nutrition:'🥗', grooming:'✂️', training:'🎯', health:'🏥', behavior:'🧠', general:'📖', all:'📰' };

function ArticleCard({ article, onClick }) {
  const catEmoji = CATEGORY_EMOJI[article.category] ?? '📰';
  return (
    <div onClick={() => onClick(article)} id={`article-${article._id}`}
      className="glass-card overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-200">
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {article.thumbnail
          ? <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-6xl opacity-20">{catEmoji}</span>
        }
        {article.mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl">▶</div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900/80 text-gray-300 capitalize">{catEmoji} {article.category}</span>
          {article.petType && article.petType !== 'all' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/50 text-white capitalize">{article.petType}</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 leading-snug">{article.title}</h3>
        {article.summary && <p className="text-gray-500 text-xs line-clamp-2 mb-3">{article.summary}</p>}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>By {article.author?.name ?? 'FurShield'}</span>
          <div className="flex items-center gap-2">
            {article.readTime && <span>⏱ {article.readTime} min</span>}
            <span>❤️ {article.likes ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleDetailView({ article, onLike }) {
  if (!article) return null;
  return (
    <div>
      {article.thumbnail && (
        <div className="h-52 rounded-xl overflow-hidden mb-5 -mx-0">
          <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 capitalize">
          {CATEGORY_EMOJI[article.category]} {article.category}
        </span>
        {article.petType && article.petType !== 'all' && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 capitalize">{article.petType}</span>
        )}
        {article.mediaType && article.mediaType !== 'article' && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 capitalize">{article.mediaType}</span>
        )}
      </div>

      <h2 className="text-xl font-black text-white mb-2">{article.title}</h2>
      <p className="text-gray-500 text-xs mb-4">
        By {article.author?.name ?? 'FurShield Team'}
        {article.readTime && ` · ${article.readTime} min read`}
        {article.publishedAt && ` · ${new Date(article.publishedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}`}
      </p>

      {article.summary && (
        <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15 mb-5">
          <p className="text-gray-300 text-sm italic">{article.summary}</p>
        </div>
      )}

      {/* Video embed */}
      {article.videoUrl && (
        <div className="mb-5">
          <a href={article.videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all">
            <span className="text-2xl">▶️</span>
            <span className="text-sm font-medium">Watch Video</span>
            <span className="ml-auto text-xs">↗</span>
          </a>
        </div>
      )}

      {/* Content */}
      {article.content && (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed text-sm whitespace-pre-wrap mb-5">
          {article.content}
        </div>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {article.tags.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/10">#{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button onClick={() => onLike(article._id)} id={`like-article-${article._id}`}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
          ❤️ {article.likes ?? 0} Likes
        </button>
      </div>
    </div>
  );
}

export default function CareTipsPage() {
  const [articles,  setArticles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('all');
  const [petType,   setPetType]   = useState('all');
  const [mediaType, setMediaType] = useState('all');
  const [search,    setSearch]    = useState('');
  const [active,    setActive]    = useState(null);
  const [showDetail,setShowDetail]= useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (category  !== 'all') params.category  = category;
      if (petType   !== 'all') params.petType   = petType;
      if (mediaType !== 'all') params.mediaType = mediaType;
      if (search.trim())       params.search    = search.trim();
      const { data } = await ArticleService.getAll(params);
      setArticles(data.data);
    } catch { setArticles([]); }
    finally { setLoading(false); }
  }, [category, petType, mediaType, search]);

  useEffect(() => { const t = setTimeout(fetchArticles, 300); return () => clearTimeout(t); }, [fetchArticles]);

  const handleLike = async (id) => {
    try { await ArticleService.like(id); fetchArticles(); } catch {}
  };

  return (
    <DashboardLayout pageTitle="Care Tips 📰">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white">Pet Care Library</h2>
          <p className="text-gray-500 text-sm mt-1">Expert articles, videos, and guides for every pet parent</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search tips…"
            className="bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60 transition-all" />
          {[
            { label: 'Category', opts: CATEGORIES, val: category, set: setCategory },
            { label: 'Pet',      opts: PET_TYPES,  val: petType,  set: setPetType  },
            { label: 'Type',     opts: MEDIA_TYPES, val: mediaType, set: setMediaType },
          ].map(({ label, opts, val, set }) => (
            <select key={label} value={val} onChange={(e) => set(e.target.value)}
              className="bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2 text-gray-300 text-sm focus:outline-none focus:border-primary-500/60 transition-all capitalize">
              {opts.map((o) => <option key={o} value={o} className="bg-gray-900 capitalize">{o === 'all' ? `All ${label}s` : o}</option>)}
            </select>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="h-40 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-30">📰</p>
            <p className="text-gray-400">No articles found. Try different filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {articles.map((a) => <ArticleCard key={a._id} article={a} onClick={(art) => { setActive(art); setShowDetail(true); }} />)}
          </div>
        )}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Care Article" size="lg">
        <ArticleDetailView article={active} onLike={handleLike} />
      </Modal>
    </DashboardLayout>
  );
}
