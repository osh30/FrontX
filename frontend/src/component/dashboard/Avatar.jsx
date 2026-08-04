import { useState } from 'react';
import { User } from 'lucide-react';

const Avatar = ({ src, alt, size = 32, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const iconSize = Math.max(Math.round(size * 0.3), 8);

  return (
    <div
      className={`relative overflow-hidden rounded-full flex-shrink-0 border border-gray-200/70 ${className}`}
      style={{ width: size, height: size }}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || 'Profile'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <User className="text-gray-300" size={iconSize} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
