'use client';
// app/blog/[slug]/page.js
// Individual blog article page
// Tested: article content loads from slug, back link works ✓

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articlesAPI } from '../../../lib/api';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await articlesAPI.getOne(slug);
        setArticle(data.article);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-20 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
    </div>
  );

  if (!article) return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">Article not found</h2>
      <Link href="/blog" className="btn-primary">Back to Blog</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/blog" className="text-sm text-teal hover:text-teal-deep mb-6 inline-block">← Back to Blog</Link>

      <span className="badge-fixed mb-4 inline-block">{article.category?.replace('_', ' ')}</span>
      <h1 className="text-4xl font-serif font-bold text-teal-deep mb-4 leading-tight">{article.title}</h1>

      <div className="flex items-center gap-3 text-sm text-ink-soft mb-8 pb-6 border-b border-gray-200">
        <span>By {article.author?.name}</span>
        <span>·</span>
        <span>{new Date(article.publishedAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div className="prose max-w-none">
        {article.content?.split('\n').map((para, i) =>
          para.trim() ? (
            <p key={i} className="text-ink-soft leading-relaxed mb-4">{para}</p>
          ) : <br key={i} />
        )}
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <Link href="/blog" className="btn-ghost text-sm">← More Articles</Link>
      </div>
    </div>
  );
}
