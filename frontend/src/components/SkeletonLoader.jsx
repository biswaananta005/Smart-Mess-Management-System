import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {items.map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line medium"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        {items.map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-line text"></div>
            <div className="skeleton-line text"></div>
            <div className="skeleton-line text"></div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="skeleton-line block"></div>;
};

export default SkeletonLoader;
