import React from 'react';

export const LoginLogo = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative group">
        {/* Outer glow ring */}
        <div className="absolute -inset-1 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Logo container */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-white/20 shadow-lg transition-all duration-500 group-hover:ring-white/30 group-hover:shadow-xl group-hover:scale-105">
          {/* Inner gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-10 pointer-events-none" />
          
          <img 
            src="/lovable-uploads/ba25df4b-a62d-4a3d-97c3-7d969e304813.png" 
            alt="ORUN ACADEMY Logo" 
            className="w-full h-full object-contain bg-white/90"
          />
        </div>
      </div>
    </div>
  );
};
