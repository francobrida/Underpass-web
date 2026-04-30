import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient, { getAuthUser } from '../services/apiClient';
import EventCard from '../components/EventCard';
import { 
  Edit3, Trash2, AlertTriangle, History, 
  ShieldCheck, Hourglass, Star, MessageSquare, 
  X, Loader2, Calendar, Clock, MapPin 
} from 'lucide-react';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const user = getAuthUser();
  const [events, setEvents] = useState({ verified: [], pending: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [selectedVibeCheck, setSelectedVibeCheck] = useState(null);
  const [showEditWarning, setShowEditWarning] = useState(null);

  const fetchMyEvents = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: result } = await apiClient.get(`/users/${user.id}/events`);
      const allEvents = result.data || result;
      
      if (!Array.isArray(allEvents)) {
        console.error("La API no devolvió un array:", allEvents);
        setEvents({ verified: [], pending: [], past: [] });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const categorized = allEvents.reduce((acc, event) => {
        if (!event) return acc;
        
        const eventDate = event.date ? new Date(event.date) : new Date();
        const isPast = eventDate < today;
        
        if (isPast) {
          acc.past.push(event);
        } else if (event.is_verified === false || event.is_verified === 0) {
          acc.pending.push(event);
        } else {
          acc.verified.push(event);
        }
        return acc;
      }, { verified: [], pending: [], past: [] });

      // Inyectamos el Mock para testear el diseño del archivo
      categorized.past.push({
        id: '999',
        title: 'VINTAGE TECHNO NIGHT (MOCK)',
        date: '2024-01-01',
        is_verified: true,
        location_name: 'The Old Warehouse',
        flyer: 'party1.jpg'
      });

      setEvents(categorized);
    } catch (err) {
      console.error("Error cargando mis eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento? Esta acción es irreversible.")) {
      try {
        await apiClient.delete(`/events/${id}`);
        fetchMyEvents();
      } catch (err) {
        alert("Error al eliminar el evento");
      }
    }
  };

  const handleFetchVibeChecks = async (id) => {
    try {
      const { data: result } = await apiClient.get(`/events/${id}/vibechecks`);
      setSelectedVibeCheck(result.data || result);
    } catch (err) {
      alert("No se pudieron cargar los VibeChecks");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto w-full px-6 md:px-10 mt-10 space-y-20">
        
        {/* SECTION 1: VERIFIED ACTIVE EVENTS */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-l-4 border-green-500 pl-6">
            <ShieldCheck className="text-green-500" size={32} />
            <div>
              <h2 className="text-3xl text-white font-display font-black uppercase italic tracking-tighter">Eventos Activos</h2>
              <p className="text-[#666] font-mono text-[10px] uppercase tracking-[0.2em]">Publicados y verificados en la agenda principal</p>
            </div>
          </div>
          
          {events.verified.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.verified.map(event => (
                <div key={event.id} className="relative group">
                  <EventCard event={event} />
                  {/* Overlays for Edit/Delete */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowEditWarning(event.id); }}
                      className="p-2 bg-white text-black hover:bg-accent hover:text-white transition-colors shadow-xl"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                      className="p-2 bg-black text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors shadow-xl"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No tienes eventos verificados actualmente." />
          )}
        </section>

        {/* SECTION 2: PENDING EVENTS */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
            <Hourglass className="text-accent" size={32} />
            <div>
              <h2 className="text-3xl text-white font-display font-black uppercase italic tracking-tighter">En Espera</h2>
              <p className="text-[#666] font-mono text-[10px] uppercase tracking-[0.2em]">Pendientes de validación comunitaria (Vouches)</p>
            </div>
          </div>
          
          {events.pending.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.pending.map(event => (
                <div key={event.id} className="relative group">
                  <div className="opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                    <EventCard event={event} />
                  </div>
                  
                  {/* Vouch Count Badge for Pending */}
                  <div className="absolute top-4 left-4 z-30">
                    <span className="px-2 py-1 bg-accent text-white font-mono text-[9px] font-bold uppercase tracking-widest shadow-neon">
                      {event.vouch_count || 0} / 3 VOUCHES
                    </span>
                  </div>

                  {/* Overlays for Edit/Delete */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/events/edit/${event.id}`); }}
                      className="p-2 bg-white text-black hover:bg-accent hover:text-white transition-colors shadow-xl"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                      className="p-2 bg-black text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors shadow-xl"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No hay eventos en espera." />
          )}
        </section>

        {/* SECTION 3: PAST EVENTS */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-l-4 border-[#333] pl-6">
            <History className="text-[#666]" size={32} />
            <div>
              <h2 className="text-3xl text-white font-display font-black uppercase italic tracking-tighter opacity-50">Archivo Histórico</h2>
              <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.2em]">Eventos finalizados y reportes de VibeCheck</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.past.map(event => {
              const flyer = event.flyer || 'party1.jpg';
              const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
              const finalSrc = flyer.startsWith('http') ? flyer : (flyer === 'party1.jpg' ? 'party1.jpg' : `${baseUrl}/${flyer.startsWith('/') ? flyer.substring(1) : flyer}`);

              return (
                <button 
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="flex items-center gap-4 p-4 bg-[#050505] border border-[#111] hover:border-accent/40 transition-all text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 flex-shrink-0 bg-black border border-[#111] overflow-hidden relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                    <img 
                      src={finalSrc} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                      alt="" 
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=200&q=80'}
                    />
                  </div>
                  <div className="relative z-10 flex-grow">
                    <h4 className="text-xs text-white font-bold uppercase tracking-wider group-hover:text-accent transition-colors leading-tight">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[9px] text-[#444] font-mono">{event.date}</p>
                      <span className="w-1 h-1 bg-[#222] rounded-full"></span>
                      <p className="text-[9px] text-accent/50 font-mono uppercase tracking-widest">ARCHIVED</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {events.past.length === 0 && <EmptyState message="No hay eventos pasados en tu registro." />}
          </div>
        </section>

      </main>

      {/* MODALS */}
      {showEditWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0a0a0a] border-2 border-accent p-8 space-y-6">
            <div className="flex items-center gap-3 text-accent">
              <AlertTriangle size={32} />
              <h3 className="text-2xl font-display font-black italic uppercase italic">Aviso Crítico</h3>
            </div>
            <p className="text-text-secondary font-mono text-sm leading-relaxed">
              Si editas este evento, <span className="text-white font-bold">perderá su estado de verificación actual</span> y volverá a la Waiting Room para ser validado nuevamente por la comunidad.
            </p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setShowEditWarning(null)}
                className="flex-1 py-3 border border-[#333] text-white font-bold uppercase text-xs hover:bg-[#111]"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowEditWarning(null);
                  navigate(`/events/edit/${showEditWarning}`);
                }}
                className="flex-1 py-3 bg-accent text-white font-bold uppercase text-xs shadow-neon"
              >
                Entendido, Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVibeCheck && (
        <VibeCheckModal 
          data={selectedVibeCheck} 
          onClose={() => setSelectedVibeCheck(null)} 
        />
      )}
    </div>
  );
};


const VibeCheckModal = ({ data, onClose }) => {
  const stats = [
    { label: 'SONIDO', value: data.sound_score || 0, color: 'text-blue-400' },
    { label: 'SEGURIDAD', value: data.safe_space_score || 0, color: 'text-green-400' },
    { label: 'GLOBAL', value: data.average_score || 0, color: 'text-accent' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95">
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-[#222] flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#050505]">
          <h3 className="text-xl text-white font-display font-black uppercase italic italic tracking-widest">REPORTE VIBECHECK</h3>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-10">
          <div className="grid grid-cols-3 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center space-y-2 p-4 bg-[#111] border border-[#222]">
                <p className="text-[10px] text-[#555] font-mono tracking-widest">{s.label}</p>
                <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}<span className="text-xs text-[#333]">/5</span></p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#555] font-mono text-xs uppercase tracking-widest border-b border-[#222] pb-2">
              <MessageSquare size={14} /> COMENTARIOS DE LA COMUNIDAD
            </div>
            <div className="space-y-3">
              {data.reviews && data.reviews.length > 0 ? data.reviews.map((rev, i) => (
                <div key={i} className="p-4 bg-[#050505] border-l-2 border-accent/30 font-mono text-xs text-[#aaa] italic leading-relaxed">
                  "{rev.comment}"
                </div>
              )) : (
                <p className="text-[#333] font-mono text-xs text-center py-10">No hay comentarios para este evento.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-[#050505] border-t border-[#222] text-center">
          <p className="text-[8px] text-[#333] font-mono uppercase tracking-[0.4em]">Underpass Archive System // Finalized Event Data</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="py-12 text-center border border-dashed border-[#111] bg-black/50">
    <p className="text-[#333] font-mono text-xs uppercase tracking-widest">{message}</p>
  </div>
);

export default MyEventsPage;
