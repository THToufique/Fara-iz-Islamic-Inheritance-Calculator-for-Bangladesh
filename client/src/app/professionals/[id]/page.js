'use client';
// app/professionals/[id]/page.js
// Individual professional profile with reviews and review submission form
// Tested: profile loads, review submission shows success message ✓

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { professionalsAPI } from '../../../lib/api';
import { isLoggedIn } from '../../../lib/auth';

function Stars({ rating, interactive, onSelect }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onSelect(s) : undefined}
          className={`text-xl ${s <= rating ? 'text-gold' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-gold transition-colors' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProfessionalProfilePage() {
  const { id } = useParams();
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await professionalsAPI.getOne(id);
        setProfessional(data.professional);
        setReviews(data.reviews || []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    if (id) fetchProfile();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) { setReviewError('Please select a rating.'); return; }
    setSubmitting(true); setReviewError('');
    try {
      await professionalsAPI.addReview(id, reviewForm);
      setSubmitted(true);
    } catch (err) {
      setReviewError(err.message);
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center text-ink-soft">Loading profile...</div>
  );

  if (!professional) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">Professional not found</h2>
      <Link href="/professionals" className="btn-primary">Back to Directory</Link>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/professionals" className="text-sm text-teal hover:text-teal-deep mb-4 inline-block">← Back to Directory</Link>
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-2">{professional.name}</h1>
          <span className="badge-fixed">{professional.category?.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-teal-deep mb-3 text-sm">Contact Details</h3>
            <div className="space-y-2 text-sm text-ink-soft">
              <p>📍 {professional.district}{professional.upazila ? `, ${professional.upazila}` : ''}</p>
              {professional.phone && <p>📞 {professional.phone}</p>}
              {professional.email && <p>✉️ {professional.email}</p>}
              {professional.experience > 0 && <p>🗓 {professional.experience} years experience</p>}
            </div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-teal-deep mb-1">{professional.averageRating?.toFixed(1) || '—'}</div>
            <Stars rating={professional.averageRating || 0} />
            <p className="text-xs text-ink-soft mt-1">{professional.totalReviews} reviews</p>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          {professional.bio && (
            <div className="card">
              <h3 className="font-serif font-bold text-teal-deep mb-3">About</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{professional.bio}</p>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="font-serif font-bold text-teal-deep text-xl mb-4">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-ink-soft">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-teal-deep text-sm">{r.user?.name || 'User'}</p>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-sm text-ink-soft">{r.comment}</p>}
                    <p className="text-xs text-ink-soft mt-2">{new Date(r.createdAt).toLocaleDateString('en-BD')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review form */}
          {isLoggedIn() && !submitted && (
            <div className="card">
              <h3 className="font-serif font-bold text-teal-deep mb-4">Leave a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Your Rating</label>
                  <Stars rating={reviewForm.rating} interactive onSelect={r => setReviewForm({ ...reviewForm, rating: r })} />
                </div>
                <div>
                  <label className="form-label">Comment (optional)</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="form-input h-24 resize-none"
                    placeholder="Share your experience..."
                    maxLength={500}
                  />
                </div>
                {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
          {submitted && <div className="bg-sage rounded-lg p-4 text-sm text-teal-deep font-medium">✓ Thank you for your review!</div>}
          {!isLoggedIn() && (
            <p className="text-sm text-ink-soft">
              <Link href="/login" className="text-teal font-medium">Login</Link> to leave a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
