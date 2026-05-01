import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';
import { ShieldCheck, UserCheck, AlertCircle, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import TechnicalLoader from '../components/TechnicalLoader';

const WaitingRoomPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWaitingEvents = async () => {
    try {
      const { data: result } = await apiClient.get('/events', { 
        params: { verified: 'false' } 
      });
      const dataArray = result.data || result;
      setEvents(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error("Error en Waiting Room:", err);
      setError("No se pudieron cargar los eventos en espera.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitingEvents();
  }, []);

  const handleVouch = async (eventId) => {
    console.log(`🎫 ENVIANDO_VOUCH -> Evento ID: ${eventId}`);
    try {
      const response = await apiClient.post(`/events/${eventId}/vouches`);
      console.log("✅ VOUCH_EXITOSO:", response.data);
      fetchWaitingEvents();
    } catch (err) {
      console.error("❌ ERROR_AL_DAR_VOUCH:", err.response || err);
      const msg = err.response?.data?.message || "No se pudo procesar el voto. Quizás ya votaste por este evento o no tienes permisos.";
      alert(`ERROR: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow p-6 md:p-10 max-w-[1200px] mx-auto w-full space-y-12 mt-4">
        
        {/* Header Section */}
        <div className="space-y-4 border-l-4 border-accent pl-6 py-2">
          <h1 className="text-4xl md:text-5xl text-white font-display font-black uppercase italic tracking-tighter">
            The Waiting Room
          </h1>
          <div className="flex items-center gap-3 text-text-secondary">
            <ShieldCheck size={18} className="text-accent" />
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">
              VERIFICACIÓN COMUNITARIA: 3 CONFIRMACIONES PARA PUBLICAR EN LA AGENDA.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <TechnicalLoader />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 text-center">
            <p className="text-red-500 font-mono text-sm">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#222] bg-[#050505]">
            <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">No hay eventos pendientes de verificación.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map(event => (
              <WaitingEventCard 
                key={event.id} 
                event={event} 
                onVouch={() => handleVouch(event.id)} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const WaitingEventCard = ({ event, onVouch }) => {
  const [isVouching, setIsVouching] = useState(false);
  const [isJustVerified, setIsJustVerified] = useState(false);
  const vouchCount = event.vouch_count || 0;
  const progress = (vouchCount / 3) * 100;

  // Construcción de URL de imagen similar a EventCard
  const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
  const imagePath = event.flyer || 'images/flyers/party1.jpg';
  const finalSrc = imagePath.startsWith('http') ? imagePath : `${baseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;

  const handleAction = async () => {
    setIsVouching(true);
    await onVouch();
    
    // Si con este voto llega a 3, disparamos la animación
    if (vouchCount + 1 >= 3) {
      setIsJustVerified(true);
      // Esperamos a que termine la animación antes de que el padre refresque y lo quite
      setTimeout(() => {
        setIsVouching(false);
      }, 1000);
    } else {
      setIsVouching(false);
    }
  };

  return (
    <div className={`group relative bg-[#0a0a0a] border p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 transition-all duration-700 ${
      isJustVerified 
        ? 'border-green-500 bg-green-500/10 scale-[1.02] z-50 shadow-[0_0_50px_rgba(34,197,94,0.3)] translate-x-full opacity-0' 
        : 'border-[#1a1a1a] hover:border-accent/30 hover:bg-[#0d0d0d]'
    }`}>
      
      {/* Verification Overlay Animation */}
      {isJustVerified && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm z-50 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center animate-bounce">
            <ShieldCheck size={60} className="text-green-500 filter drop-shadow-[0_0_15px_rgba(34,197,94,1)]" />
            <span className="text-green-500 font-display font-black italic text-xl tracking-tighter uppercase">VERIFIED</span>
          </div>
        </div>
      )}
      <div className="relative w-full md:w-44 h-44 flex-shrink-0 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100 border border-[#222]">
        <img src={finalSrc} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-grow space-y-4 text-center md:text-left py-2">
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl text-white font-display font-black uppercase italic tracking-tighter leading-none">
            {event.title}
          </h3>
          <p className="text-accent font-mono text-sm md:text-base uppercase tracking-widest font-bold">
            {event.lineup}
          </p>
        </div>

        <div className="space-y-2">
          {/* Date & Time */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[#aaa] font-mono">
              <Calendar size={14} className="text-accent/60" />
              {event.date ? event.date.split('T')[0] : 'TBA'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#aaa] font-mono">
              <Clock size={14} className="text-accent/60" />
              {event.start_time ? event.start_time.slice(0, 5) : '00:00'} HS
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-[#aaa] font-mono uppercase tracking-wider">
            <MapPin size={14} className="text-accent/60" />
            {event.location || event.neighborhood || 'LOCALIZACIÓN POR CONFIRMAR'}
          </div>
        </div>

        <p className="text-[10px] text-[#444] font-mono uppercase tracking-[0.2em]">
          Organizado por: {event.organizer?.name || event.organizer || 'USER_COMMUNITY'}
        </p>
      </div>

      {/* Vouch Progress & Button */}
      <div className="flex flex-col items-center md:items-end gap-6 min-w-[240px] bg-black/40 p-4 border border-[#1a1a1a] rounded-sm">
        
        {/* Progress Tracker */}
        <div className="w-full space-y-3">
          <div className="flex justify-between text-[11px] font-mono font-bold text-[#999] uppercase tracking-[0.3em] mb-1">
            <span>Progreso</span>
            <span className={vouchCount > 0 ? 'text-accent' : ''}>{vouchCount} / 3 VOUCHES</span>
          </div>
          
          {/* Main Progress Bar */}
          <div className="h-4 w-full bg-black border border-[#333] relative overflow-hidden rounded-full p-[2px]">
            <div 
              className="h-full bg-accent shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.6)] transition-all duration-1000 rounded-full"
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                boxShadow: progress > 0 ? '0 0 15px rgba(255, 255, 255, 0.3)' : 'none' 
              }}
            ></div>
          </div>

          {/* Larger LED Indicators */}
          <div className="flex gap-3 justify-center md:justify-end pt-1">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-8 h-2 border-2 transition-all duration-500 rounded-sm ${
                  i <= vouchCount 
                    ? 'bg-accent border-accent shadow-[0_0_15px_var(--color-accent)] scale-110' 
                    : 'bg-transparent border-[#222]'
                }`}
              ></div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleAction}
          disabled={isVouching || event.has_vouched || event.is_mine}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 font-display font-black italic text-[11px] tracking-[0.2em] uppercase transition-all duration-300 border-2 ${
            (isVouching || event.has_vouched || event.is_mine)
              ? 'bg-transparent text-[#444] cursor-default border-[#222]' 
              : 'bg-white text-black hover:bg-accent hover:text-white hover:border-accent hover:shadow-neon cursor-pointer border-transparent transform hover:-translate-y-1'
          }`}
        >
          {isVouching ? (
            <Loader2 size={14} className="animate-spin" />
          ) : event.has_vouched ? (
            <><ShieldCheck size={14} className="text-accent" /> VOUCHED</>
          ) : event.is_mine ? (
            <><AlertCircle size={14} /> TU EVENTO</>
          ) : (
            <><UserCheck size={14} /> DAR Vouch</>
          )}
        </button>
      </div>

      {/* "Tu Evento" badge if applicable (simulado) */}
      {event.is_mine && (
        <div className="absolute top-0 right-0 p-1">
           <span className="text-[8px] font-mono text-accent opacity-50 uppercase tracking-widest">TU EVENTO</span>
        </div>
      )}
    </div>
  );
};

export default WaitingRoomPage;
