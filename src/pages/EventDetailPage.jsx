import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, ChevronLeft, 
  ExternalLink, AlertCircle, Download, QrCode,
  Star, History, MessageSquare
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';
import TechnicalLoader from '../components/TechnicalLoader';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vibeChecks, setVibeChecks] = useState(null);

  const isPast = event && new Date(event.date) < new Date(new Date().setHours(0,0,0,0));

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-gen");
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `STAMP_QR_${event?.title?.replace(/\s+/g, '_').toUpperCase()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

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
    style: 'Industrial Techno',
    organizer_email: 'organizer@test.com'
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
        // Si es un evento pasado y somos el dueño, traemos los vibechecks
        if (new Date(item.date) < new Date()) {
          try {
            const { data: vbResult } = await apiClient.get(`/events/${id}/vibechecks`);
            setVibeChecks(vbResult.data || vbResult);
          } catch (vErr) {
            console.warn("No vibechecks found or error fetching them");
          }
        }
      } catch (err) {
        console.warn("API Error or Offline, check ID:", id);
        // Fallback a mocks
        if (id === '999') {
          setEvent(mockPastEvent);
          setVibeChecks({
            sound_score: 4.5,
            safe_space_score: 4.8,
            average_score: 4.6,
            reviews: [
              { comment: "El sonido fue increíble, de los mejores de la temporada." },
              { comment: "Ambiente muy seguro y respetuoso." }
            ]
          });
        } else if (!event) {
          setEvent(mockEvent);
        }
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
          <TechnicalLoader />
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
          
          {/* Left Column: Flyer (Hidden for past events) */}
          {!isPast && (
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

              {/* QR STAMP SECTION (Owner Only - Only for active/future events already verified) */}
              {event.is_mine && event.is_verified && !isPast && (
                <div className="mt-8 bg-[#080808] border border-[#1f1f1f] p-6 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-accent opacity-50 shadow-[0_0_10px_var(--color-accent)]"></div>
                  
                  <div className="text-center space-y-1 mb-6">
                    <h3 className="text-white font-display font-black italic text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-2">
                      <QrCode size={14} className="text-accent" /> STAMP QR CODE
                    </h3>
                    <p className="text-[#555] font-mono text-[9px] uppercase tracking-widest">Escanea para coleccionar Stamp</p>
                  </div>
                  
                  <div className="flex justify-center bg-white p-5 rounded-sm">
                    <QRCodeCanvas 
                      id="qr-gen"
                      value={event.stamp_token || `underpass_stamp_${event.id}`}
                      size={220}
                      level={"H"}
                      includeMargin={false}
                    />
                  </div>

                  <div className="mt-6 space-y-3">
                    <button 
                      onClick={downloadQRCode}
                      className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-neon transform hover:-translate-y-1"
                    >
                      <Download size={14} /> DESCARGAR QR
                    </button>
                    <p className="text-[#333] font-mono text-[8px] text-center uppercase tracking-widest leading-relaxed">
                      * QR único para este evento.<br/>Click para descargar imagen de alta calidad
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Info */}
          <div className={`${isPast ? 'lg:col-span-12' : 'lg:col-span-7'} order-1 lg:order-2 space-y-8`}>
            <div className="space-y-4">
              <p className="text-accent/60 font-mono text-[10px] uppercase tracking-[0.5em] mb-2 animate-pulse">
                // ORG BY: {event.organizer || event.organizer_name || event.user?.name}
              </p>
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
                {/* Ticket Box - Integrated into right column */}
            <div className="pt-8 mt-10 border-t border-[#1a1a1a]">
              <div className="bg-[#050505] border border-accent/20 p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3">
                    <p className="text-[#666] text-[11px] font-mono uppercase tracking-[0.4em]">RESERVA_ACCESO</p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl text-white font-display font-black italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">{event.price}€</span>
                      <span className="text-accent font-mono text-xs uppercase tracking-widest font-bold">{event.price_info}</span>
                    </div>
                  </div>
                  
                  {event.ticket_link && (
                    <a 
                      href={event.ticket_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-12 py-5 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-sm tracking-[0.2em] transition-all shadow-neon flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                    >
                      TICKETS / LINK <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                
                
              </div>
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

      {/* VibeCheck Results Section (For Past Events) */}
      {isPast && vibeChecks && (
        <section className="max-w-[1200px] mx-auto w-full px-6 md:px-10 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="border-t-2 border-accent/20 pt-16 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Star size={24} fill="currentColor" />
                  <h2 className="text-3xl md:text-5xl text-white font-display font-black uppercase italic tracking-tighter">VibeChecks</h2>
                </div>
                <p className="text-[#999] font-mono text-[11px] uppercase tracking-[0.3em] font-bold">Reviews de la Comunidad</p>
              </div>
              
              <div className="flex gap-4">
                {[
                  { label: 'SONIDO', val: vibeChecks.sound_score, color: 'text-blue-400' },
                  { label: 'SEGURIDAD', val: vibeChecks.safe_space_score, color: 'text-green-400' },
                  { label: 'GLOBAL', val: vibeChecks.average_score, color: 'text-accent' }
                ].map((s, i) => (
                  <div key={i} className="bg-black border border-[#1a1a1a] p-5 min-w-[110px] text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <p className="text-[10px] text-[#999] font-mono uppercase tracking-widest mb-2 font-bold">{s.label}</p>
                    <p className={`text-3xl font-display font-black italic ${s.color}`}>{s.val || '0'}<span className="text-[12px] text-white/20 ml-1">/5</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#aaa] font-mono text-xs uppercase tracking-[0.2em] border-b border-[#1a1a1a] pb-3">
                  <MessageSquare size={14} className="text-accent" /> Feedback de la Comunidad
                </div>
                <div className="space-y-4">
                  {vibeChecks.reviews && vibeChecks.reviews.length > 0 ? vibeChecks.reviews.map((rev, i) => (
                    <div key={i} className="p-8 bg-[#050505] border-l-2 border-accent/40 font-mono text-sm text-[#ccc] italic leading-relaxed relative group">
                      <div className="absolute top-0 left-0 w-0 h-full bg-accent/5 group-hover:w-full transition-all duration-500"></div>
                      <span className="relative">"{rev.comment}"</span>
                    </div>
                  )) : (
                    <div className="py-20 text-center border border-dashed border-[#111] bg-black/20">
                      <p className="text-[#333] font-mono text-[10px] uppercase tracking-widest">No hay comentarios registrados para este evento</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default EventDetailPage;
