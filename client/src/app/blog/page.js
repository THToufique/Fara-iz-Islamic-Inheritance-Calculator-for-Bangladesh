'use client';
// app/blog/page.js
// Blog article listing with category filter tabs
// Tested: articles load, category filter updates list correctly ✓

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { articlesAPI } from '../../lib/api';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'inheritance_law', label: 'Inheritance Law' },
  { value: 'property_guide', label: 'Property Guide' },
  { value: 'common_mistakes', label: 'Common Mistakes' },
  { value: 'news', label: 'News' },
];

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        const data = await articlesAPI.getAll(params);
        setArticles(data.articles || []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    fetchArticles();
  }, [category]);

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">Blog &amp; Articles</h1>
          <p className="text-ink-soft">Guides, updates, and insights on Islamic inheritance law and property documentation in Bangladesh.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-teal text-cream'
                  : 'bg-sage text-teal-deep hover:bg-teal hover:text-cream'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="font-serif font-bold text-teal-deep text-xl mb-2">No articles yet</h3>
            <p className="text-ink-soft text-sm">Check back soon for guides and updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <div key={article._id} className="card flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="badge-fixed mb-3 inline-block">{article.category?.replace('_', ' ')}</span>
                  <h3 className="font-serif font-bold text-teal-deep text-lg mb-2 leading-snug">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-ink-soft leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-ink-soft">
                    <span>{article.author?.name}</span>
                    <span className="mx-2">·</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <Link href={`/blog/${article.slug}`} className="text-teal text-sm font-semibold hover:text-teal-deep">
                    Read →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
