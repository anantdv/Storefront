import React, { useEffect, useState } from 'react';
import { getInitials, resolveErpnextUrl } from '../../utils/erpnext';

interface UserAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  imageUrl,
  className = 'h-12 w-12 rounded-2xl',
  fallbackClassName = 'bg-[#1357d9] text-white',
  imageClassName = '',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const resolvedImageUrl = resolveErpnextUrl(imageUrl);
  const initials = getInitials(name);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {resolvedImageUrl && !imageFailed ? (
        <img
          src={resolvedImageUrl}
          alt={name ? `${name} avatar` : 'User avatar'}
          onError={() => setImageFailed(true)}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center font-black uppercase ${fallbackClassName}`}>
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
};
