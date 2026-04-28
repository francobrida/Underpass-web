import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
  const imagePath = event.image || 'images/flyers/party1.jpg';
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  const finalSrc = imagePath.startsWith('http') ? imagePath : `${baseUrl}/${cleanPath}`;

  console.log(`📸 CARGANDO_IMAGEN [Evento: ${event.id}]:`, finalSrc);

  return (
    <div 
      onClick={() => navigate(`/events/${event.id}`)}
      className="group relative bg-[#050505] border border-[#1f1f1f] hover:border-accent overflow-hidden transition-all duration-500 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] cursor-pointer"
    >
      
      {/* Glitch/Scanline effect overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>

      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={finalSrc} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          onError={(e) => {
            if (!e.target.src.includes('unsplash')) {
              console.error("❌ ERROR_CRITICO en:", finalSrc);
              e.target.src = 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />
        
        {/* Floating Tags Top */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-sm border border-[#333] text-[10px] font-mono text-white tracking-widest uppercase">
            <MapPin size={10} className="text-accent" />
            {event.location}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 relative z-20 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent -mt-10 pt-12 transition-transform duration-300">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-[10px] text-accent font-mono border border-accent/30 bg-accent/10 px-2 py-0.5">
            #{event.style}
          </span>
          {event.tags.map(tag => (
            <span key={tag} className="text-[10px] text-[#666] font-mono border border-[#222] bg-[#111] px-2 py-0.5 group-hover:border-[#444] transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-2xl text-white font-display font-black uppercase italic tracking-tight mb-1 group-hover:text-accent transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-[#ccc] font-mono uppercase tracking-widest mb-6">
          LINEUP: {event.lineup}
        </p>

        {/* Date & Time Footer */}
        <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-4 mt-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[#aaa] font-mono">
              <Calendar size={14} className="text-accent/60" />
              {event.date}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#aaa] font-mono">
              <Clock size={14} className="text-accent/60" />
              {event.time}
            </div>
          </div>
          {/* Precio alineado a la derecha del horario */}
          <div className="text-white font-display font-black italic text-sm">
            {event.price}
          </div>
        </div>

        {/* Hidden Button that reveals on hover */}
        <div className="overflow-hidden mt-0 h-0 group-hover:h-12 group-hover:mt-4 transition-all duration-300 ease-out">
          <button className="w-full bg-white text-black font-display font-black italic uppercase text-xs tracking-widest py-3 hover:bg-accent hover:text-white transition-colors duration-300">
            Ver Detalles
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventCard;
