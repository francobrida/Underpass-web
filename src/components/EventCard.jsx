import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
  const imagePath = event.image || event.flyer || 'images/flyers/party1.jpg';
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  const finalSrc = imagePath.startsWith('http') ? imagePath : `${baseUrl}/${cleanPath}`;

  return (
    <div 
      onClick={() => navigate(`/events/${event.id}`)}
      className="group relative bg-[#050505] border border-[#1f1f1f] hover:border-accent overflow-hidden transition-all duration-500 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] cursor-pointer"
    >
      
      {/* Glitch/Scanline effect overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>

      {/* Image Container */}
      <div className="relative h-20 sm:h-32 md:h-48 w-full overflow-hidden">
        <img 
          src={finalSrc} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          onError={(e) => {
            if (!e.target.src.includes('unsplash')) {
              e.target.src = 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />
        
        {/* Floating Tags Top */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20">
          <div className="flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-3 md:py-1 bg-black/80 backdrop-blur-sm border border-[#333] text-[8px] md:text-[10px] font-mono text-white tracking-widest uppercase">
            <MapPin size={10} className="text-accent" />
            {event.location || event.neighborhood || 'BCN'}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-1.5 sm:p-3 md:p-6 relative z-20 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent -mt-6 sm:-mt-10 pt-8 sm:pt-12 transition-transform duration-300 flex flex-col flex-grow">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2 md:mb-3">
          {event.style && (
            <span className="text-[5px] sm:text-[8px] md:text-[10px] text-accent font-mono border border-accent/30 bg-accent/10 px-0.5 sm:px-1 md:px-2 py-[1px] sm:py-0.5">
              #{event.style}
            </span>
          )}
          {event.tags?.map(tag => (
            <span key={tag} className="text-[5px] sm:text-[8px] md:text-[10px] text-[#666] font-mono border border-[#222] bg-[#111] px-0.5 sm:px-1 md:px-2 py-[1px] sm:py-0.5 group-hover:border-[#444] transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-[7px] leading-tight sm:text-sm md:text-2xl text-white font-display font-black uppercase italic tracking-tight mb-0.5 sm:mb-1 group-hover:text-accent transition-colors line-clamp-2 sm:line-clamp-1">
          {event.title}
        </h3>
        <p className="text-[5px] sm:text-[9px] md:text-xs text-[#ccc] font-mono uppercase tracking-widest mb-2 sm:mb-4 md:mb-6 line-clamp-1">
          LINEUP: {event.lineup || 'Por confirmar'}
        </p>

        {/* Date & Time Footer */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between border-t border-[#1f1f1f] pt-1.5 sm:pt-3 md:pt-4 mt-auto gap-0.5 sm:gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 md:gap-4">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 text-[5px] sm:text-[9px] md:text-xs text-[#aaa] font-mono">
              <Calendar size={12} className="text-accent/60 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5" />
              {event.date ? event.date.split('T')[0] : 'TBA'}
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 text-[5px] sm:text-[9px] md:text-xs text-[#aaa] font-mono">
              <Clock size={12} className="text-accent/60 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5" />
              {event.time || (event.start_time ? event.start_time.slice(0, 5) : '00:00')} HS
            </div>
          </div>
          {/* Precio */}
          <div className="text-white font-display font-black italic text-[6px] sm:text-xs md:text-sm mt-1 sm:mt-0">
            {event.price || 'GRATIS'}
          </div>
        </div>

        {/* Button Overlay */}
        <div className="overflow-hidden mt-0 h-0 group-hover:h-5 sm:group-hover:h-10 md:group-hover:h-12 group-hover:mt-1.5 sm:group-hover:mt-3 md:group-hover:mt-4 transition-all duration-300 ease-out">
          <button className="w-full bg-white text-black font-display font-black italic uppercase text-[5px] sm:text-[10px] md:text-xs tracking-widest py-0.5 sm:py-2 md:py-3 hover:bg-accent hover:text-white transition-colors duration-300">
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
