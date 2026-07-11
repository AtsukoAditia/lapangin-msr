"use client";

import { useEffect, useState } from "react";
import StarRating from "./StarRating";

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName?: string;
  customerAvatar?: string;
  photos?: { id: string; photoUrl: string }[];
  createdAt: string;
}

interface ReviewListProps {
  venueId: string;
}

export default function ReviewList({ venueId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?venueId=${venueId}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || []);
        setAvgRating(d.avgRating || 0);
        setReviewCount(d.reviewCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [venueId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Memuat review...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
          <StarRating value={Math.round(avgRating)} readonly size="sm" />
          <div className="text-sm text-gray-500 mt-1">{reviewCount} review</div>
        </div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Belum ada review</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">
                  {review.customerName?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium text-sm">{review.customerName || "Anonim"}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="ml-auto">
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 text-sm">{review.comment}</p>
              )}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.photoUrl}
                      alt="Review photo"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
