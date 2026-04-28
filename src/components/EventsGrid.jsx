import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import apiClient from '../services/apiClient';

const EventsGrid = ({ filters }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Limpiamos los filtros para no enviar strings vacíos al backend
        const cleanParams = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );

        const { data: result } = await apiClient.get('/events', { params: cleanParams });
        const dataArray = result.data || result;
        
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          console.log("🔍 DATOS_CRUDOS_API (Primer evento):", dataArray[0]);
          const normalizedEvents = dataArray.map(item => ({
            id: item.id,
            title: item.title || item.name || 'SIN TÍTULO',
            lineup: item.lineup || item.organizer?.name || item.organizer || 'ARTISTAS POR ANUNCIAR',
            date: item.date ? item.date.split('T')[0] : (item.created_at ? item.created_at.split('T')[0] : 'TBA'),
            time: item.start_time ? item.start_time.slice(0, 5) : '00:00',
            location: item.location || item.location_name || item.neighborhood || 'TBA',
            style: Array.isArray(item.genres) ? item.genres.map(g => g.name || g).join(', ') : (item.style || 'TECHNO'),
            price: item.price ? `${item.price}€` : 'GRATIS',
            image: item.flyer || item.flyer_url || 'images/flyers/party1.jpg',
            tags: item.tags || []
          }));
          setEvents(normalizedEvents);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error cargando eventos:", err);
        setError(err.message || "Error desconocido al conectar con la API");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#1f1f1f] border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#110000] border border-red-900 p-8 text-center rounded-sm">
        <h3 className="text-red-500 font-display font-bold uppercase tracking-widest mb-2">Error de conexión</h3>
        <p className="text-red-400/70 font-mono text-sm">{error}</p>
        <p className="text-text-secondary mt-4 text-[11px] uppercase tracking-widest">Revisa que tu API en Railway esté encendida y respondiendo correctamente.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl text-white font-display font-black uppercase italic tracking-wider flex items-center gap-3">
          <span className="w-2 h-2 bg-accent shadow-[0_0_10px_var(--color-accent)] animate-pulse"></span>
          Próximos Eventos
        </h2>
        <span className="text-[#666] font-mono text-xs tracking-widest">{events.length} RESULTADOS</span>
      </div>
      
      {events.length === 0 ? (
        <div className="w-full py-20 text-center border border-dashed border-[#222] bg-[#050505]">
          <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">No hay eventos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsGrid;
