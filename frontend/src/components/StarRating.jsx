import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ value = 0, onChange, readonly = false, size = 20 }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={`star-rating-container ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${isFilled ? 'active' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            disabled={readonly}
          >
            <Star
              size={size}
              className={`star-icon ${isFilled ? 'filled' : ''}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
