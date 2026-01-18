"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 20,
  showValue = false,
  className = ""
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              transition-all duration-150
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded
            `}
            aria-label={`Rate ${value} stars`}
          >
            <Star
              size={size}
              className={`
                transition-all duration-150
                ${
                  value <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-gray-300'
                }
                ${!readonly && hoverRating >= value ? 'scale-110' : ''}
              `}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'N/A'}
        </span>
      )}
    </div>
  );
}

// Read-only compact version for displaying ratings
interface RatingDisplayProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function RatingDisplay({
  rating,
  size = 16,
  showValue = true,
  className = ""
}: RatingDisplayProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star
        size={size}
        className="fill-yellow-400 text-yellow-400"
      />
      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {rating && rating > 0 ? Number(rating).toFixed(1) : 'N/A'}
        </span>
      )}
    </div>
  );
}
