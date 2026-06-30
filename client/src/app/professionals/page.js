'use client';
// app/professionals/page.js
// Browse/search professional directory with category and district filters
// Tested: filter by category works, empty state shows correctly ✓

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { professionalsAPI } from '../../lib/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'land_surveyor', label: 'Land Surveyor' },
  { value: 'registration_agent', label: 'Registration Agent' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'consultant', label: 'Consultant' },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-gold' : 'text-gray-300'}`}>★</span>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/4 mb-4" />
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  );
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (search) params.district = search;
        const data = await professionalsAPI.getAll(params);
        setProfessionals(data.professionals || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, [category, search]);

  const categoryLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">Find a Professional</h1>
          <p className="text-ink-soft max-w-2xl">
            Connect with land surveyors, registration agents, lawyers and consultants who can help you
            formalise your inheritance division in Bangladesh.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="form-input sm:w-56"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by district (e.g. Dhaka, Sylhet)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input flex-1"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="font-serif font-bold text-teal-deep text-xl mb-2">No professionals found</h3>
            <p className="text-ink-soft text-sm">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map(pro => (
              <div key={pro._id} className="card flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-teal-deep text-lg mb-1">{pro.name}</h3>
                  <span className="badge-fixed mb-3 inline-block">{categoryLabel(pro.category)}</span>
                  <p className="text-sm text-ink-soft mb-1">📍 {pro.district}{pro.upazila ? `, ${pro.upazila}` : ''}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={pro.averageRating} />
                    <span className="text-xs text-ink-soft">({pro.totalReviews} reviews)</span>
                  </div>
                  {pro.experience > 0 && (
                    <p className="text-xs text-ink-soft">{pro.experience} years experience</p>
                  )}
                </div>
                <Link href={`/professionals/${pro._id}`} className="btn-ghost text-center mt-4 text-sm py-2">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
