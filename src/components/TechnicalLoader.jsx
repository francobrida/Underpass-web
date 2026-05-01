import React from 'react';

const TechnicalLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="flex items-end gap-1 h-12">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 animate-pulse-fast`}
            style={{ 
              animationDelay: `${i * 0.1}s`,
              backgroundColor: i < 8 ? '#8b5cf6' : '#22c55e', // Violeta y luego Verde Neón
              boxShadow: i < 8 
                ? '0 0 10px rgba(139, 92, 246, 0.5)' 
                : '0 0 10px rgba(34, 197, 94, 0.5)',
              height: `${20 + Math.sin(i) * 30 + 50}%` // Alturas variables iniciales
            }}
          ></div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-fast {
          0%, 100% { height: 30%; opacity: 0.6; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default TechnicalLoader;
