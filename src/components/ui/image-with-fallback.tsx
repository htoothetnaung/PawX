import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-pulse w-full h-full bg-gray-200 rounded-lg" />
        </div>
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover rounded-lg transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onError={() => {
          console.log(`Failed to load image: ${src}, falling back to: ${fallbackSrc}`);
          setError(true);
          setLoading(false);
        }}
        onLoad={() => {
          console.log(`Successfully loaded image: ${src}`);
          setLoading(false);
        }}
        {...props}
      />
    </div>
  );
} 