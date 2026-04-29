import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';
import { 
  Save, X, AlertTriangle, Loader2, 
  Calendar, Clock, MapPin, Type, AlignLeft, Tag, DollarSign
} from 'lucide-react';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lineup: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    neighborhood: '',
    price: '',
    style: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data: result } = await apiClient.get(`/events/${id}`);
        const event = result.data || result;
        setFormData({
          title: event.title || '',
          lineup: event.lineup || '',
          description: event.description || '',
          date: event.date ? event.date.split('T')[0] : '',
          start_time: event.start_time || '',
          end_time: event.end_time || '',
          location: event.location || '',
          neighborhood: event.neighborhood || '',
          price: event.price || '',
          style: event.style || ''
        });
      } catch (err) {
        console.error("Error cargando evento:", err);
        alert("No se pudo cargar la información del evento.");
        navigate('/my-events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // LLAMADA AL ENDPOINT OFICIAL: PUT /api/v1/events/{id}
      await apiClient.put(`/events/${id}`, formData);
      alert("Evento actualizado correctamente. Recuerda que ha vuelto a la Waiting Room para ser verificado.");
      navigate('/my-events');
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al guardar los cambios. Revisa los datos introducidos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-accent" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Navbar />
      
      <main className="max-w-[800px] mx-auto w-full px-6 mt-12 space-y-10">
        
        {/* Header con advertencia */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
            <div>
              <h1 className="text-4xl text-white font-display font-black uppercase italic tracking-tighter">Editar Evento</h1>
              <p className="text-accent font-mono text-xs uppercase tracking-widest mt-1 italic">ID: {id}</p>
            </div>
          </div>
          
          <div className="bg-accent/10 border border-accent/30 p-4 flex items-start gap-4">
            <AlertTriangle className="text-accent shrink-0" size={20} />
            <p className="text-[11px] text-accent font-mono uppercase leading-relaxed tracking-wider">
              ATENCIÓN: Al guardar los cambios, el evento perderá su verificación (si la tenía) y deberá recibir 3 nuevos vouches en la Waiting Room.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-[#050505] border border-[#111] p-8 md:p-12 shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Título */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <Type size={12} /> Título del Evento
              </label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                placeholder="EJ: UNDERGROUND SECRET SESSION"
              />
            </div>

            {/* Lineup */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <Tag size={12} /> Lineup (DJs / Artistas)
              </label>
              <input 
                type="text"
                required
                value={formData.lineup}
                onChange={(e) => setFormData({...formData, lineup: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-accent font-mono focus:border-accent outline-none transition-all uppercase"
                placeholder="DJ NAME, ARTIST 2, ARTIST 3..."
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <AlignLeft size={12} /> Descripción / Info
              </label>
              <textarea 
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-[#aaa] font-mono focus:border-accent outline-none transition-all resize-none"
                placeholder="Detalles del evento, reglas, vibe..."
              />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <Calendar size={12} /> Fecha
              </label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
              />
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <DollarSign size={12} /> Precio (€)
              </label>
              <input 
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                placeholder="EJ: 15€ / GRATIS"
              />
            </div>

            {/* Horarios */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <Clock size={12} /> Hora Inicio
              </label>
              <input 
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <Clock size={12} /> Hora Fin
              </label>
              <input 
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <MapPin size={12} /> Sala / Club
              </label>
              <input 
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                placeholder="EJ: RAZZMATAZZ"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <MapPin size={12} /> Barrio
              </label>
              <input 
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                placeholder="EJ: POBLENOU"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-[#111]">
            <button 
              type="button"
              onClick={() => navigate('/my-events')}
              className="flex-1 flex items-center justify-center gap-2 py-4 border border-[#222] text-[#666] font-display font-black italic uppercase text-xs hover:bg-[#111] transition-all"
            >
              <X size={16} /> Cancelar
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black font-display font-black italic uppercase text-xs hover:bg-accent hover:text-white transition-all shadow-neon disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar Cambios
            </button>
          </div>
        </form>

        <p className="text-center text-[9px] text-[#333] font-mono uppercase tracking-[0.5em]">
          Underpass System // Event Protocol Update // {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
};

export default EditEventPage;
