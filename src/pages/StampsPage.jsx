import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Calendar, Activity, Cpu, ShieldCheck, Database, Layers, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import apiClient, { getAuthUser } from '../services/apiClient';
import Navbar from '../components/Navbar';
import TechnicalLoader from '../components/TechnicalLoader';

const StampsPage = () => {
  const navigate = useNavigate();
  const [stamps, setStamps] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Simulation scanner form states
  const [stampToken, setStampToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUser = getAuthUser();
      const userCall = currentUser?.id ? apiClient.get(`/users/${currentUser.id}`) : Promise.resolve({ data: currentUser });

      const [stampsRes, userRes] = await Promise.all([
        apiClient.get('/stamps'),
        userCall
      ]);
      
      const apiStamps = stampsRes.data?.data || stampsRes.data || stampsRes || [];
      
      const stampsWithVibechecks = await Promise.all(
        apiStamps.map(async (stamp) => {
          if (!stamp.event?.id) return { ...stamp, alreadyVoted: false };
          try {
            const { data } = await apiClient.get(`/events/${stamp.event.id}/vibechecks`);
            const reviews = data.data || data || [];
            const hasVoted = reviews.some(r => r.user?.id === currentUser.id || r.user_id === currentUser.id);
            return { ...stamp, alreadyVoted: hasVoted };
          } catch (e) {
            console.error("Error getting vibecheck info for event", stamp.event.id, e);
            return { ...stamp, alreadyVoted: false };
          }
        })
      );

      setStamps(stampsWithVibechecks);
      setPoints(userRes.data?.points || userRes.data?.data?.points || userRes.points || userRes.data?.user?.points || 0);
    } catch (err) {
      console.error("Error fetching stamps/points:", err);
      setStamps([]);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimStamp = async (e) => {
    e.preventDefault();
    if (!stampToken.trim()) return;
    setIsSubmitting(true);

    try {
      await apiClient.post('/stamps', { 
        token: stampToken.trim(), 
        stamp_token: stampToken.trim() 
      });
      showNotification("¡Sello canjeado correctamente! Se te han adjudicado los puntos correspondientes.");
      setStampToken('');
      await fetchData();
    } catch (err) {
      console.error(err);
      let errMsg = "Error al canjear el sello. Verifica el token.";
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      showNotification(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVibecheckAvailable = (event) => {
    if (!event || !event.date) return false;
    const datePart = event.date.split('T')[0];
    const endTime = event.end_time || '23:59';
    const eventEndDateTime = new Date(`${datePart}T${endTime}`);
    const now = new Date();
    return now > eventEndDateTime;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <TechnicalLoader />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black font-sans relative pb-20">
      <Navbar />
      
      {/* BACKGROUND GRID DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden z-0 select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-10">
        
        {/* TOP STATUS BAR (INTEGRATED RACK) */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-1 panel-neon p-1 mb-8 bg-black/40 backdrop-blur-md">
          
          {/* RANKING ACCESS - DIRECT BUTTON */}
          <div className="lg:col-span-5 bg-black flex border-b lg:border-b-0 lg:border-r border-white/5">
            <button 
              onClick={() => navigate('/ranking')}
              className="group flex items-center justify-between w-full p-8 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Trophy size={24} />
                </div>
                <div className="text-left">
                  <p className="text-xl font-display font-black uppercase italic tracking-tight group-hover:text-accent transition-colors">Community Ranking</p>
                  <p className="text-[12px] font-mono text-[#666] uppercase tracking-[0.3em] mt-1">Ver el ranking de usuarios</p>
                </div>
              </div>
              <Activity size={18} className="text-[#222] group-hover:text-accent transition-colors animate-pulse" />
            </button>
          </div>

          {/* VU-METER PANEL - DIRECT POINTS */}
          <div className="lg:col-span-7 p-8 bg-[#030303] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                <span className="text-3xl font-mono font-black text-white tracking-tighter">
                  {points} <span className="text-[15px] text-accent/80 uppercase tracking-[0.4em] ml-2">Puntos Acumulados</span>
                </span>
              </div>
            </div>

            {/* Segmented VU Meter */}
            <div className="flex gap-[3px] h-12 items-end">
              {[...Array(40)].map((_, i) => {
                const isActive = (i / 40) < (points / 2000);
                let colorClass = "bg-[#111]";
                if (isActive) {
                  if (i < 24) colorClass = "bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
                  else if (i < 34) colorClass = "bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]";
                  else colorClass = "bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
                }
                return (
                  <div 
                    key={i} 
                    className={`flex-1 h-full transition-all duration-700 delay-${i * 10} ${colorClass} rounded-[1px]`}
                    style={{ height: `${20 + (i * 2)}%` }}
                  ></div>
                );
              })}
            </div>
          </div>
        </header>

        {/* Global Alert Notification */}
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

        {/* SIMULATOR: MANUAL SCANNER/CODE ENTRY */}
        <section className="panel-neon p-8 bg-black/80 backdrop-blur-md border border-accent/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#1a1a1a]">
            <Cpu size={18} className="text-accent animate-pulse" />
            <div>
              <h3 className="text-base text-white font-display font-black uppercase italic tracking-wider">Simulador de Escaneo de QR</h3>
              <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-1">Canjea manualmente un token de evento para conseguir tu stamp</p>
            </div>
          </div>

          <form onSubmit={handleClaimStamp} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-2 w-full">
              <label className="block text-[9px] text-[#666] font-mono uppercase tracking-[0.3em] font-bold">Código Token del Evento / Stamp</label>
              <input 
                type="text" 
                value={stampToken}
                onChange={(e) => setStampToken(e.target.value)}
                placeholder="Ej. underpass_stamp_123"
                className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all uppercase tracking-widest"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || !stampToken.trim()}
              className="w-full md:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-neon transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Validando...' : 'CANJEAR STAMP'}
            </button>
          </form>
        </section>

        {/* MAIN DECK: STAMPS PASSPORT IN LIST FORMAT */}
        <section className="relative overflow-hidden bg-black/60 backdrop-blur-md border border-[#111]">
          {/* Section Header */}
          <div className="p-6 border-b border-white/5 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="text-2xl text-white font-display font-black uppercase italic tracking-wider leading-none">SELLOS COLECCIONADOS</h2>
                <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">Historial y certificados de asistencia</p>
              </div>
            </div>
          </div>

          {/* List layout of Stamps with Grungy style */}
          <div className="p-6 md:p-8 space-y-4">
            {stamps.map((stamp, i) => {
              const vibeAvailable = isVibecheckAvailable(stamp.event) && !stamp.alreadyVoted;
              
              // Resolve flyer image path
              let finalSrc = '';
              if (stamp.event?.image || stamp.event?.flyer) {
                const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
                const imagePath = stamp.event.image || stamp.event.flyer;
                const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
                finalSrc = imagePath.startsWith('http') ? imagePath : `${baseUrl}/${cleanPath}`;
              }

              return (
                <div key={stamp.id} className="group relative bg-[#040404] border border-[#1a1a1a] hover:border-green-500/40 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 rounded-sm hover:shadow-[0_0_20px_rgba(34,197,94,0.06)] relative overflow-hidden">
                  
                  {/* Rustic ink stamp graphic on the left */}
                  <div className="flex-grow flex flex-col md:flex-row items-center gap-6 text-center md:text-left select-none w-full">
                    
                    {/* Worn-out circular flyer/sello */}
                    <div 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-green-500 group-hover:border-accent transition-all duration-300 bg-[#080808] flex-shrink-0 select-none overflow-hidden flex items-center justify-center relative"
                      style={{ boxShadow: '0 0 25px rgba(34, 197, 94, 0.4), inset 0 0 15px rgba(34, 197, 94, 0.2)' }}
                    >
                      {finalSrc ? (
                        <img 
                          src={finalSrc} 
                          alt="flyer" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-accent/20 flex items-center justify-center text-[9px] font-mono font-black text-green-500/60 uppercase">
                          FLYER
                        </div>
                      )}
                      {/* Distressed ink texture overlay */}
                      <div className="absolute inset-0 bg-black/10 mix-blend-color-burn pointer-events-none"></div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-display font-black uppercase italic leading-none text-[#bbb] group-hover:text-white transition-colors tracking-normal">
                        {stamp.event?.title || 'SESSION'}
                      </h3>
                      {stamp.event?.organizer?.name && (
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent/80 group-hover:text-accent">
                          Organizador: {stamp.event.organizer.name}
                        </div>
                      )}
                      <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-mono text-[#555] group-hover:text-[#888] transition-colors">
                        <Calendar size={12} className="text-green-500/50 group-hover:text-accent/50" />
                        <span className="uppercase tracking-widest">{stamp.event?.date ? stamp.event.date.split('T')[0] : '2024'}</span>
                      </div>
                    </div>

                    {/* Corner Label */}
                    <div className="absolute top-3 left-3 text-[8px] font-mono text-[#333] font-black italic">STAMP_ID://{stamp.id}</div>
                  </div>

                  {/* Interactive Button */}
                  <div className="flex-shrink-0 w-full md:w-auto relative z-20">
                    {stamp.alreadyVoted ? (
                      <button 
                        disabled
                        className="w-full md:w-auto px-6 py-3 bg-[#0d0d0d] border border-green-500/30 text-green-500 font-display font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <ShieldCheck size={14} /> VIBECHECK ENVIADO
                      </button>
                    ) : vibeAvailable ? (
                      <button 
                        onClick={() => navigate(`/events/${stamp.event?.id}/vibecheck`)}
                        className="w-full md:w-auto px-6 py-3 bg-accent/90 hover:bg-accent hover:text-white text-white font-display font-black italic uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 border border-accent/40 shadow-none hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                      >
                        <MessageSquare size={14} /> DEJAR VIBECHECK
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full md:w-auto px-6 py-3 bg-[#0d0d0d] border border-[#1a1a1a] text-[#333] font-display font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <AlertCircle size={14} /> NO DISPONIBLE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};

export default StampsPage;
