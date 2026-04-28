import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, ChevronLeft, 
  ExternalLink, AlertCircle
} from 'lucide-react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data basado estrictamente en las columnas reales del README
  const mockEvent = {
    id: id,
    title: 'INDUSTRIAL DARKNESS',
    lineup: 'Kobosil, Shlømo, Clara Cuvé',
    description: 'Una noche dedicada a los sonidos más crudos y mecánicos de la escena berlinesa traídos directamente al corazón de Barcelona. Sistema de sonido reforzado, iluminación estroboscópica y atmósfera sin concesiones. \n\nNo se permiten fotos ni videos en la pista de baile. El respeto al espacio y a los demás asistentes es obligatorio.',
    date: '2026-05-15',
    start_time: '23:00',
    end_time: '06:00',
    price: '18',
    price_info: '+ 1 Consumición antes de la 1:00 AM',
    ticket_link: 'https://ra.co/events/example',
    location_name: 'Bunker Collective',
    neighborhood: 'Poblenou',
    flyer: 'party1.jpg',
    is_18_plus: true,
    style: 'Industrial Techno' // Usamos style como género para las etiquetas
  };

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      try {
        const { data: result } = await apiClient.get(`/events/${id}`);
        const item = result.data || result;
        console.log("🔍 DETALLE_EVENTO_CRUDO:", item);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
        const flyerPath = item.flyer_url || item.flyer;
        
        let flyerUrl = mockEvent.flyer;
        if (flyerPath) {
          if (flyerPath.startsWith('http')) {
            flyerUrl = flyerPath;
          } else {
            const cleanPath = flyerPath.startsWith('/') ? flyerPath.substring(1) : flyerPath;
            flyerUrl = `${baseUrl}/${cleanPath}`;
          }
        }

        // Buscamos géneros en 'genres', 'styles' o el campo 'style' directo
        const genreData = item.genres || item.styles || [];
        const genreString = Array.isArray(genreData) 
          ? genreData.map(g => g.name || g).join(', ') 
          : (item.style || item.genre || 'TECHNO');

        setEvent({
          ...item,
          title: item.title || 'SIN TÍTULO',
          lineup: item.lineup || 'ARTISTAS POR ANUNCIAR',
          date: item.date ? item.date.split('T')[0] : (item.created_at ? item.created_at.split('T')[0] : 'TBA'),
          start_time: item.start_time ? item.start_time.slice(0, 5) : '00:00',
          end_time: item.end_time ? item.end_time.slice(0, 5) : '00:00',
          style: genreString,
          price: item.price || '0',
          location_name: item.location || item.location_name || 'SECRET LOCATION',
          flyer: flyerUrl
        });
      } catch (err) {
        console.warn("API Error or Offline, check ID:", id);
        // Fallback a mock solo si no hay datos reales en absoluto
        if (!event) setEvent(mockEvent);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-16 h-[2px] bg-accent animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto w-full px-6 md:px-10 mt-10 md:mt-16 flex-grow">
        
        {/* Header Section: Title & Back Button */}
        <div className="mb-10 flex items-center justify-between">
          <button 
            onClick={() => navigate('/events')}
            className="group flex items-center gap-2 text-[#999] hover:text-accent transition-colors font-mono text-[10px] uppercase tracking-[0.3em]"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            [ archivos_agenda ]
          </button>
          
          {event.is_18_plus && (
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={12} /> +18 ONLY
            </span>
          )}
        </div>

        {/* Main Content: Flyer next to Name */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          
          {/* Left Column: Flyer (More importance) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-accent/30 blur opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-black border border-[#1f1f1f] p-2 shadow-2xl">
                <img 
                  src={event.flyer} 
                  alt="Official Flyer" 
                  className="w-full h-auto"
                  onError={(e) => {
                    if (e.target.src !== 'party1.jpg' && !e.target.src.includes('unsplash')) {
                      console.error("Fallo flyer en:", event.flyer);
                      e.target.src = 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=1200&q=80';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl text-white font-display font-black uppercase italic tracking-tighter leading-tight">
                {event.title}
              </h1>
              <div className="space-y-3">
                <p className="text-accent font-mono text-lg md:text-2xl uppercase tracking-[0.1em] font-bold leading-tight">
                  {event.lineup}
                </p>
                {/* Genre Neon Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {(event.style || 'ELECTRONIC').split(',').map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-accent/10 border border-accent/40 text-accent text-[9px] font-mono font-bold uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 gap-px bg-[#1f1f1f] border border-[#1f1f1f]">
              {[
                { label: 'FECHA', value: event.date, icon: Calendar },
                { label: 'SALA', value: event.location_name, icon: MapPin },
                { label: 'START', value: event.start_time, icon: Clock },
                { label: 'END', value: event.end_time, icon: Clock }
              ].map((stat, i) => (
                <div key={i} className="bg-black p-5 flex items-center gap-4">
                  <stat.icon size={16} className="text-accent/60" />
                  <div>
                    <p className="text-[#666] text-[8px] font-mono uppercase tracking-widest">{stat.label}</p>
                    <p className="text-[#ccc] font-display font-bold uppercase italic text-xs tracking-wider">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <p className="text-[#aaa] font-mono text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Ticket Box - Integrated into right column */}
            <div className="pt-8 mt-10 border-t border-[#1a1a1a]">
              <div className="bg-[#050505] border border-accent/20 p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-[#555] text-[9px] font-mono uppercase tracking-[0.4em]">RESERVA_ACCESO</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-white font-display font-black italic tracking-tighter">{event.price}€</span>
                      <span className="text-accent font-mono text-[9px] uppercase tracking-widest">{event.price_info}</span>
                    </div>
                  </div>
                  
                  <a 
                    href={event.ticket_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-10 py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-xs tracking-[0.2em] transition-all shadow-neon flex items-center justify-center gap-2"
                  >
                    COMPRAR TICKETS <ExternalLink size={14} />
                  </a>
                </div>
                
                <p className="mt-4 text-[#333] font-mono text-[8px] uppercase tracking-widest">
                  Secure Transaction // ID_{event.id?.toString().padStart(6, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-[#111] text-center">
        <p className="text-[#333] text-[9px] font-mono uppercase tracking-[0.5em]">
          © 2026 UNDERPASS — BARCELONA UNDERGROUND ARCHIVE
        </p>
      </footer>
    </div>
  );
};

export default EventDetailPage;
