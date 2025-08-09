
import React, { useState } from 'react';
import { StarIcon } from './icons/StarIcon';

interface StarRatingProps {
  currentRating: number;
  onRate: (rating: number) => void;
  starCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ currentRating, onRate, starCount = 5 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex justify-center items-center">
      {[...Array(starCount)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onRate(ratingValue)}
            onMouseEnter={() => setHoverRating(ratingValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none"
          >
            <StarIcon
              className={`w-7 h-7 transition-colors duration-200 ${
                ratingValue <= (hoverRating || currentRating)
                  ? 'text-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
