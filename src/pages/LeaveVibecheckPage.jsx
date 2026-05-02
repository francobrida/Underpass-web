import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Shield, MessageSquare, AlertTriangle, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import Navbar from '../components/Navbar';
import TechnicalLoader from '../components/TechnicalLoader';

const LeaveVibecheckPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vibecheck form state
  const [soundScore, setSoundScore] = useState(5);
  const [safeSpaceScore, setSafeSpaceScore] = useState(5);
  const [comment, setComment] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const { data: result } = await apiClient.get(`/events/${id}`);
        setEvent(result.data || result);
      } catch (err) {
        console.error("Error fetching event for vibecheck:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id && id !== 'mock-past-event' && id !== 'mock-future-event') {
      fetchEvent();
    } else {
      setEvent({
        id: id,
        title: id === 'mock-past-event' ? 'RESISTANCE (MOCK PAST)' : 'DARK ROOM (MOCK FUTURE)'
      });
      setLoading(false);
    }
  }, [id]);

  const handleSubmitVibecheck = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showNotification("Por favor, introduce un comentario de tu experiencia.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (id === 'mock-past-event' || id === 'mock-future-event') {
        showNotification("¡Vibecheck enviado con éxito! (Mock de prueba).");
        setTimeout(() => navigate('/stamps'), 2000);
      } else {
        await apiClient.post(`/events/${id}/vibechecks`, {
          sound_score: soundScore,
          safe_space_score: safeSpaceScore,
          comment: comment.trim()
        });
        showNotification("¡Vibecheck enviado con éxito! Redirigiendo...");
        setTimeout(() => navigate('/stamps'), 2000);
      }
    } catch (err) {
      console.error("Error posting vibecheck:", err);
      let errorMsg = "No se pudo guardar el vibecheck. Revisa los datos.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      showNotification(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <TechnicalLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pb-20 selection:bg-accent selection:text-black relative z-10">
      <Navbar />

      {/* BACKGROUND TEXTURE */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden opacity-[0.05]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <main className="max-w-[800px] mx-auto w-full px-6 mt-12 space-y-10 relative z-10">
        
        {/* Header section with back link */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/stamps')}
            className="group flex items-center gap-2 text-[#999] hover:text-accent transition-colors font-mono text-[10px] uppercase tracking-[0.3em]"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            [ volver a stamps ]
          </button>
        </div>

        {/* Action Title */}
        <div className="border-l-4 border-accent pl-6">
          <h1 className="text-4xl text-white font-display font-black uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            DEJAR VIBECHECK
          </h1>
          <p className="text-[#666] font-mono text-[11px] uppercase tracking-[0.3em] mt-2">
            Valoración y feedback para el evento: {event?.title || 'UNDERPASS SESSION'}
          </p>
        </div>

        {notification && (
          <div className={`p-4 font-mono text-xs border uppercase tracking-widest flex items-center justify-between animate-in fade-in duration-300 ${
            notification.type === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-accent/10 border-accent/30 text-accent font-bold font-mono'
          }`}>
            <span className="flex items-center gap-2">
              <Sparkles size={14} /> {notification.msg}
            </span>
          </div>
        )}

        {/* Feedback form */}
        <form onSubmit={handleSubmitVibecheck} className="bg-black/80 backdrop-blur-md border border-accent/20 p-8 shadow-[0_0_40px_rgba(139,92,246,0.08)] relative space-y-8">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
          
          {/* Sound rating - Audio Fader */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] text-[#aaa] font-mono uppercase tracking-[0.3em] font-bold">
              <Star size={12} className="text-accent" fill="currentColor" /> Calidad de Sonido (Sound Score)
            </label>
            <div className="space-y-3 bg-[#080808] border border-[#1a1a1a] p-5 rounded-sm">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#555] uppercase tracking-widest">1 (Deficiente)</span>
                <span className="text-accent font-display font-black text-2xl drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] italic">
                  LEVEL: {soundScore}/5
                </span>
                <span className="text-[#555] uppercase tracking-widest">5 (Excelente)</span>
              </div>
              <div className="relative pt-1 flex items-center">
                {/* Custom fader track background */}
                <div className="absolute top-1/2 left-0 w-full h-[6px] bg-[#151515] border border-[#262626] rounded-sm transform -translate-y-1/2 pointer-events-none"></div>
                {/* Active track level */}
                <div 
                  className="absolute top-1/2 left-0 h-[6px] bg-accent rounded-sm transform -translate-y-1/2 transition-all duration-100 pointer-events-none"
                  style={{ width: `${((soundScore - 1) / 4) * 100}%` }}
                ></div>
                {/* Input slider */}
                <input 
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={soundScore}
                  onChange={(e) => setSoundScore(Number(e.target.value))}
                  className="w-full h-8 bg-transparent cursor-pointer outline-none accent-accent relative z-10 hover:brightness-110 transition-all"
                />
              </div>
              {/* Slider meter ticks */}
              <div className="flex justify-between text-white text-[10px] font-mono select-none px-1">
                <span>| 1</span>
                <span>| 2</span>
                <span>| 3</span>
                <span>| 4</span>
                <span>| 5</span>
              </div>
            </div>
          </div>

          {/* Safe space rating - Audio Fader */}
          <div className="space-y-4 pt-4">
            <label className="flex items-center gap-2 text-[10px] text-[#aaa] font-mono uppercase tracking-[0.3em] font-bold">
              <Shield size={12} className="text-accent" /> Ambiente Seguro (Safe Space Score)
            </label>
            <div className="space-y-3 bg-[#080808] border border-[#1a1a1a] p-5 rounded-sm">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#555] uppercase tracking-widest">1 (Inseguro)</span>
                <span className="text-accent font-display font-black text-2xl drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] italic">
                  LEVEL: {safeSpaceScore}/5
                </span>
                <span className="text-[#555] uppercase tracking-widest">5 (Seguro)</span>
              </div>
              <div className="relative pt-1 flex items-center">
                {/* Custom fader track background */}
                <div className="absolute top-1/2 left-0 w-full h-[6px] bg-[#151515] border border-[#262626] rounded-sm transform -translate-y-1/2 pointer-events-none"></div>
                {/* Active track level */}
                <div 
                  className="absolute top-1/2 left-0 h-[6px] bg-accent rounded-sm transform -translate-y-1/2 transition-all duration-100 pointer-events-none"
                  style={{ width: `${((safeSpaceScore - 1) / 4) * 100}%` }}
                ></div>
                {/* Input slider */}
                <input 
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={safeSpaceScore}
                  onChange={(e) => setSafeSpaceScore(Number(e.target.value))}
                  className="w-full h-8 bg-transparent cursor-pointer outline-none accent-accent relative z-10 hover:brightness-110 transition-all"
                />
              </div>
              {/* Slider meter ticks */}
              <div className="flex justify-between text-white text-[10px] font-mono select-none px-1">
                <span>| 1</span>
                <span>| 2</span>
                <span>| 3</span>
                <span>| 4</span>
                <span>| 5</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-4 pt-4">
            <label className="flex items-center gap-2 text-[10px] text-[#aaa] font-mono uppercase tracking-[0.3em] font-bold">
              <MessageSquare size={12} className="text-accent" /> Comentario de tu experiencia
            </label>
            <textarea
              required
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-black border border-[#222] p-5 text-sm text-white font-mono focus:border-accent outline-none transition-all resize-none"
              placeholder="¿Cómo fue la fiesta? Hazle una review privada al organizador..."
            ></textarea>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-neon transform hover:-translate-y-1 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin text-white" /> : <Sparkles size={14} />}
              {isSubmitting ? 'ENVIANDO VIBECHECK...' : 'ENVIAR FEEDBACK'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LeaveVibecheckPage;
