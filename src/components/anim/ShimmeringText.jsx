import React from 'react';
import './ShimmeringText.css';

/** A slow gold shimmer sweeping through text — background-clip gradient
 * on an infinite drift. Ported from Animate UI's Shimmering Text, recolored
 * to the museum's gold ramp. Meant for the small uppercase section kickers,
 * where a full reveal animation would be too loud. */
export default function ShimmeringText({ text, duration = 7, className = '', as: Tag = 'span' }) {
  return (
    <Tag
      className={`shimmering-text ${className}`}
      style={{ '--shimmer-duration': `${duration}s` }}
    >
      {text}
    </Tag>
  );
}
