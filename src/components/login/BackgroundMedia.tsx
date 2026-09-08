import React from 'react';

interface BackgroundMediaProps {
  url: string;
  isVideo: boolean;
}

export const BackgroundMedia = ({ url, isVideo }: BackgroundMediaProps) => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute h-full w-full object-cover scale-105"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={url}
          alt="Background"
          className="absolute h-full w-full object-cover scale-105"
        />
      )}
      {/* Premium overlay with vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};
