import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80');

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
        No Images Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xxs">
        <img
          src={activeImage}
          alt="Product details"
          className="h-full w-full object-contain p-4 transition-transform duration-300 ease-out hover:scale-135 cursor-zoom-in"
        />
      </div>

      {/* Thumbnails Navigation Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`relative aspect-square w-18 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-all ${
                activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <img src={img} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
