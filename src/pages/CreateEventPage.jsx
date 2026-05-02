import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';
import { 
  Save, X, Loader2, Calendar, Clock, MapPin, 
  Type, AlignLeft, Tag, DollarSign, ExternalLink,
  Image as ImageIcon, AlertTriangle, ShieldCheck,
  Disc
} from 'lucide-react';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);
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
    price_info: '',
    ticket_link: '',
    flyer: null,
    is_18_plus: true,
    genres: []
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data } = await apiClient.get('/genres');
        setAvailableGenres(data.data || data || []);
      } catch (err) {
        console.error("Error cargando géneros:", err);
      }
    };
    fetchGenres();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, flyer: file });
    }
  };

  const toggleGenre = (genreId) => {
    const current = formData.genres;
    if (current.includes(genreId)) {
      setFormData({ ...formData, genres: current.filter(id => id !== genreId) });
    } else {
      setFormData({ ...formData, genres: [...current, genreId] });
    }
  };

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
    
    if (!formData.flyer) {
      showNotification("El Flyer/Imagen es obligatorio para crear el evento.", "error");
      setSaving(false);
      return;
    }

    let flyerBase64 = null;
    try {
      flyerBase64 = await fileToBase64(formData.flyer);
    } catch (err) {
      console.error("Error converting file to base64:", err);
      showNotification("Error al procesar la imagen del flyer.", "error");
      setSaving(false);
      return;
    }

    const payload = {
      title: formData.title,
      lineup: formData.lineup,
      description: formData.description,
      date: formData.date,
      location_name: formData.location,
      neighborhood: formData.neighborhood,
      price: parseFloat(formData.price) || 0,
      is_18_plus: formData.is_18_plus ? 1 : 0,
      genres: formData.genres,
      start_time: formData.start_time ? formData.start_time.slice(0, 5) : undefined,
      end_time: formData.end_time ? formData.end_time.slice(0, 5) : undefined,
      price_info: formData.price_info && formData.price_info.trim() !== "" ? formData.price_info : undefined,
      ticket_link: formData.ticket_link && formData.ticket_link.trim() !== "" ? formData.ticket_link : undefined,
      flyer_base64: flyerBase64
    };

    try {
      await apiClient.post(`/events`, payload);
      showNotification("Evento creado. Ha sido enviado a la Waiting Room para verificación.");
      setTimeout(() => navigate('/my-events'), 2500);
    } catch (err) {
      console.error("Error al crear:", err);
      let errorMsg = "Error al crear el evento. Revisa los datos requeridos.";
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        if (Array.isArray(firstError)) {
          errorMsg = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMsg = firstError;
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      showNotification(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pb-20 selection:bg-accent selection:text-black relative">
      <Navbar />
      
      {/* BACKGROUND GRID DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] -mr-[400px] -mt-[400px]"></div>
      </div>

      <main className="max-w-[800px] mx-auto w-full px-6 mt-12 space-y-10 relative z-10">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
            <div>
              <h1 className="text-4xl text-white font-display font-black uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">Crear Evento</h1>
              <p className="text-[#666] font-mono text-[10px] uppercase tracking-[0.2em] mt-1">
                Nuevo protocolo de autorización
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-black/80 backdrop-blur-md border border-accent/30 p-8 md:p-12 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative">
          
          {/* Subtle top border glow inside form */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
          
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

            {/* Flyer Upload */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <ImageIcon size={12} /> Flyer / Imagen Oficial
              </label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-black border border-[#222] p-3 text-sm text-[#aaa] font-mono focus:border-accent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-mono file:uppercase file:tracking-widest file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
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
                placeholder="EJ: 15 / 0 PARA GRATIS"
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
                placeholder="EJ: INCLUYE UNA COPA ANTES DE LA 1:00"
              />
            </div>

            {/* +18 Toggle Compacto */}
            <div className="flex items-center justify-between p-4 bg-black border border-[#222] h-[82px] self-end mb-[2px]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={formData.is_18_plus ? "text-accent" : "text-[#555]"} />
                <div>
                  <p className="text-xs font-display font-black italic uppercase text-white tracking-widest leading-none">Evento +18</p>
                  <p className="text-[9px] text-[#555] font-mono uppercase tracking-[0.2em] mt-1">Acceso a mayores</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, is_18_plus: !formData.is_18_plus})}
                className={`w-10 h-5 flex items-center p-0.5 border transition-all ${
                  formData.is_18_plus ? 'border-accent bg-accent/20 justify-end shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-[#333] bg-[#111] justify-start'
                }`}
              >
                <div className={`w-3.5 h-3.5 ${formData.is_18_plus ? 'bg-accent shadow-[0_0_10px_var(--color-accent)]' : 'bg-[#555]'}`}></div>
              </button>
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
            
            {/* Géneros Musicales */}
            <div className="md:col-span-2 space-y-3 pt-4 border-t border-[#111]">
              <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                <Disc size={12} /> Géneros Musicales
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.length > 0 ? availableGenres.map(genre => {
                  const isSelected = formData.genres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-4 py-2 border font-mono text-[10px] uppercase tracking-widest transition-all ${
                        isSelected 
                          ? 'border-accent bg-accent/20 text-accent shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                          : 'border-[#222] bg-[#050505] text-[#666] hover:border-[#444] hover:text-white'
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                }) : (
                  <p className="text-[10px] text-[#444] font-mono uppercase">Cargando géneros...</p>
                )}
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
              Publicar Evento
            </button>
          </div>
        </form>
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

export default CreateEventPage;
