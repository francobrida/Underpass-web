import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';
import { 
  Save, X, AlertTriangle, Loader2, 
  Calendar, Clock, MapPin, Type, AlignLeft, Tag, DollarSign,
  ExternalLink
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
    price_info: '',
    ticket_link: '',
    style: '',
    flyer: null
  });
  const [notification, setNotification] = useState(null);
  const [currentFlyer, setCurrentFlyer] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data: result } = await apiClient.get(`/events/${id}`);
        const event = result.data || result;
        const flyerPath = event.image || event.flyer || '';
        if (flyerPath) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
          const cleanPath = flyerPath.startsWith('/') ? flyerPath.substring(1) : flyerPath;
          const finalSrc = flyerPath.startsWith('http') ? flyerPath : `${baseUrl}/${cleanPath}`;
          setCurrentFlyer(finalSrc);
        }
        setFormData({
          title: event.title || '',
          lineup: event.lineup || '',
          description: event.description || '',
          date: event.date ? event.date.split('T')[0] : '',
          start_time: event.start_time || '',
          end_time: event.end_time || '',
          location: event.location || event.location_name || '',
          neighborhood: event.neighborhood || '',
          price: event.price || '',
          price_info: event.price_info || '',
          ticket_link: event.ticket_link || '',
          style: event.style || ''
        });
      } catch (err) {
        console.error("Error cargando evento:", err);
        showNotification("No se pudo cargar la información del evento.", "error");
        setTimeout(() => navigate('/my-events'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let flyerBase64 = null;
    if (formData.flyer) {
      try {
        flyerBase64 = await fileToBase64(formData.flyer);
      } catch (err) {
        console.error("Error converting file to base64:", err);
        showNotification("Error al procesar la imagen del flyer.", "error");
        setSaving(false);
        return;
      }
    }

    const payload = {
      title: formData.title,
      lineup: formData.lineup,
      description: formData.description,
      date: formData.date,
      location_name: formData.location,
      neighborhood: formData.neighborhood,
      price: parseFloat(formData.price) || 0,
      start_time: formData.start_time ? formData.start_time.slice(0, 5) : null,
      end_time: formData.end_time ? formData.end_time.slice(0, 5) : null,
    };

    // Solo incluimos estos si tienen contenido para evitar errores de validación 'string' vs 'null'
    if (formData.price_info && formData.price_info.trim() !== "") {
      payload.price_info = formData.price_info;
    }
    
    if (formData.ticket_link && formData.ticket_link.trim() !== "") {
      payload.ticket_link = formData.ticket_link;
    }

    if (flyerBase64) {
      payload.flyer_base64 = flyerBase64;
    }

    try {
      await apiClient.put(`/events/${id}`, payload);
      showNotification("Evento actualizado correctamente. Volviendo a la Waiting Room...");
      setTimeout(() => navigate('/my-events'), 2000);
    } catch (err) {
      console.error("Error al actualizar:", err);
      showNotification("Error al guardar los cambios. Revisa los datos.", "error");
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

            {/* Info de Precio (Opcional) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <DollarSign size={12} /> Info adicional precio
              </label>
              <input 
                type="text"
                value={formData.price_info}
                onChange={(e) => setFormData({...formData, price_info: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-[#aaa] font-mono focus:border-accent outline-none transition-all"
                placeholder="EJ: INCLUYE UNA COPA"
              />
            </div>

            {/* Ticket Link (Opcional) */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <ExternalLink size={12} /> Link de Entradas
              </label>
              <input 
                type="url"
                value={formData.ticket_link}
                onChange={(e) => setFormData({...formData, ticket_link: e.target.value})}
                className="w-full bg-black border border-[#222] p-4 text-sm text-accent font-mono focus:border-accent outline-none transition-all"
                placeholder="https://ra.co/events/..."
              />
            </div>

            {/* Subir Flyer (Opcional en Edición) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {currentFlyer && (
                <div className="md:col-span-4 flex flex-col items-start gap-2">
                  <span className="text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">Flyer Actual</span>
                  <div className="w-full max-h-48 rounded-sm overflow-hidden border border-[#222]">
                    <img 
                      src={currentFlyer} 
                      alt="Current Flyer" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
              <div className={`${currentFlyer ? 'md:col-span-8' : 'md:col-span-12'} space-y-2 w-full`}>
                <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                  <ExternalLink size={12} /> Actualizar Flyer / Imagen (Opcional)
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, flyer: e.target.files[0]})}
                  className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all cursor-pointer file:bg-accent file:border-0 file:text-black file:font-display file:font-black file:italic file:uppercase file:text-[10px] file:px-4 file:py-2 file:mr-4 file:hover:bg-accent-hover file:transition-all"
                />
              </div>
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

      {/* Custom Notification Toast */}
      {notification && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-950/20 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
            : 'bg-accent/10 border-accent/50 text-accent shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.2)]'
        }`}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <Save size={18} />}
          <p className="font-mono text-[11px] uppercase tracking-widest font-bold">
            {notification.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default EditEventPage;
