import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import apiClient, { getAuthUser } from '../services/apiClient';
import { 
  Users, Calendar, Shield, ShieldCheck, 
  Trash2, Edit3, AlertTriangle, 
  CheckCircle2, Hourglass, Loader2, Search,
  ChevronLeft, ChevronRight, History, Clock, MapPin, User
} from 'lucide-react';

const AdminPanelPage = () => {
  const currentUser = getAuthUser();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'events'
  const [eventSubTab, setEventSubTab] = useState('verified'); // 'verified', 'pending', 'past'
  
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for filters & pagination
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [roleSortOrder, setRoleSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'user'|'event', id: id, name: name }

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data: result } = await apiClient.get('/users');
        setUsers(result.data || result || []);
      } else {
        // Obtenemos los eventos verificados y pendientes por separado si 'all' no funciona
        const [vResponse, uResponse] = await Promise.all([
          apiClient.get('/events', { params: { verified: 'true' } }),
          apiClient.get('/events', { params: { verified: 'false' } })
        ]);
        
        const vData = vResponse.data?.data || vResponse.data || [];
        const uData = uResponse.data?.data || uResponse.data || [];
        
        // Unimos ambos arrays para gestionarlos localmente con los sub-filtros
        setEvents([...vData, ...uData]);
      }
    } catch (err) {
      console.error("Error cargando datos de admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- LOGIC FOR USERS ---
  const filteredUsers = useMemo(() => {
    let result = users.filter(u => 
      u.id !== currentUser?.id && 
      (u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
       u.email?.toLowerCase().includes(userSearch.toLowerCase()))
    );

    const rolePriority = { admin: 1, organizer: 2, clubber: 3 };
    result.sort((a, b) => {
      const pA = rolePriority[a.role] || 4;
      const pB = rolePriority[b.role] || 4;
      return roleSortOrder === 'asc' ? pA - pB : pB - pA;
    });

    return result;
  }, [users, userSearch, roleSortOrder, currentUser]);

  const totalUserPages = Math.ceil(filteredUsers.length / 10);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * 10, userPage * 10);

  // --- LOGIC FOR EVENTS ---
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => {
      const eventDate = new Date(e.date);
      // is_verified puede venir como 1/0 o true/false según el backend
      const isVerified = e.is_verified === true || e.is_verified === 1;
      
      if (eventSubTab === 'verified') return isVerified && eventDate >= now;
      if (eventSubTab === 'pending') return !isVerified;
      if (eventSubTab === 'past') return eventDate < now;
      return true;
    });
  }, [events, eventSubTab]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'user') {
        await apiClient.delete(`/users/${itemToDelete.id}`);
      } else {
        await apiClient.delete(`/events/${itemToDelete.id}`);
      }
      fetchData();
      setItemToDelete(null);
    } catch (err) {
      alert(`Error al eliminar ${itemToDelete.type}`);
    }
  };

  const toggleVerification = async (event) => {
    try {
      await apiClient.put(`/events/${event.id}`, { 
        ...event, 
        is_verified: !event.is_verified 
      });
      fetchData();
    } catch (err) {
      alert("Error al cambiar estado de verificación");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('T')[0];
  };

  // Helper para URL de imagen
  const getImageUrl = (path) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
    const imagePath = path || 'images/flyers/party1.jpg';
    return imagePath.startsWith('http') ? imagePath : `${baseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 text-white">
      <Navbar />
      
      <main className="max-w-[1500px] mx-auto w-full px-6 md:px-10 mt-10 space-y-8 text-sm">
        
        {/* Admin Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#111] pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-accent">
              <Shield size={40} className="animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter">Admin Control</h1>
            </div>
            <p className="text-[#aaa] font-mono text-xs uppercase tracking-[0.4em]">Barcelona Underground Event Protocol // System v1.2</p>
          </div>

          <div className="flex bg-[#050505] border border-[#111] p-1.5 self-start">
            <button 
              onClick={() => { setActiveTab('users'); setUserPage(1); }}
              className={`flex items-center gap-3 px-10 py-4 font-display font-black italic text-sm uppercase tracking-widest transition-all ${
                activeTab === 'users' ? 'bg-purple-500 text-white shadow-neon' : 'text-[#888] hover:text-white'
              }`}
            >
              <Users size={18} /> Usuarios
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-3 px-10 py-4 font-display font-black italic text-sm uppercase tracking-widest transition-all ${
                activeTab === 'events' ? 'bg-purple-500 text-white shadow-neon' : 'text-[#888] hover:text-white'
              }`}
            >
              <Calendar size={18} /> Eventos
            </button>
          </div>
        </div>

        {/* --- USERS TAB VIEW --- */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                <input 
                  type="text"
                  placeholder="BUSCAR POR NOMBRE O EMAIL..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="w-full bg-black border border-[#111] p-4 pl-12 text-sm font-mono focus:border-accent outline-none transition-all uppercase tracking-widest text-white"
                />
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-[#aaa] uppercase">
                <Users size={14} /> total: {filteredUsers.length} registros
              </div>
            </div>

            <div className="bg-[#050505] border border-[#111] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#111] bg-[#080808]">
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">ID</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Identidad</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Email</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Puntos</th>
                    <th 
                      className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest cursor-pointer hover:text-white transition-colors flex items-center gap-2"
                      onClick={() => setRoleSortOrder(roleSortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      Rol <Shield size={12} className={roleSortOrder === 'desc' ? 'rotate-180' : ''} />
                    </th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest text-right">Protocolos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111]">
                  {paginatedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-5 text-sm font-mono text-[#666]">#{u.id}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#111] border border-[#222] flex items-center justify-center text-white group-hover:border-accent transition-colors shadow-lg">
                            <User size={18} />
                          </div>
                          <span className="text-base font-bold uppercase tracking-tight">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-[#aaa] font-mono lowercase">{u.email}</td>
                      <td className="p-5">
                        <span className="text-base font-display font-black italic text-accent">{u.points || 0}</span>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 text-[10px] font-black italic uppercase tracking-tighter border ${
                          u.role === 'admin' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 
                          u.role === 'organizer' ? 'border-accent/50 text-accent bg-accent/10' : 
                          'border-[#333] text-[#aaa]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            className="p-3 bg-[#111] text-[#aaa] hover:text-white hover:bg-[#222] transition-all border border-[#222] hover:border-[#333]"
                            title="Editar Perfil"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => setItemToDelete({ type: 'user', id: u.id, name: u.name })}
                            className="p-3 bg-[#111] text-[#aaa] hover:text-red-500 hover:bg-red-500/10 transition-all border border-[#222] hover:border-red-500/30"
                            title="Eliminar Usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalUserPages > 1 && (
              <div className="flex justify-center items-center gap-6 pt-4">
                <button 
                  disabled={userPage === 1}
                  onClick={() => setUserPage(p => p - 1)}
                  className="p-4 border border-[#222] text-[#aaa] hover:text-white disabled:opacity-20 hover:bg-[#111]"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex gap-3">
                  {[...Array(totalUserPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setUserPage(i + 1)}
                      className={`w-12 h-12 font-mono text-sm transition-all border ${userPage === i + 1 ? 'bg-white text-black font-bold border-white' : 'text-[#aaa] hover:text-white border-[#222] hover:bg-[#111]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={userPage === totalUserPages}
                  onClick={() => setUserPage(p => p + 1)}
                  className="p-4 border border-[#222] text-[#aaa] hover:text-white disabled:opacity-20 hover:bg-[#111]"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- EVENTS TAB VIEW --- */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-4 border-b border-[#111] pb-1">
              {[
                { id: 'verified', label: 'Verificados', icon: <CheckCircle2 size={16} /> },
                { id: 'pending', label: 'Pendientes', icon: <Hourglass size={16} /> },
                { id: 'past', label: 'Archivo/Pasados', icon: <History size={16} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setEventSubTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-all relative ${
                    eventSubTab === tab.id ? 'text-accent' : 'text-[#888] hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {eventSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-neon"></div>}
                </button>
              ))}
            </div>

            <div className="bg-[#050505] border border-[#111] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#111] bg-[#080808]">
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Flyer</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Evento / Organizador</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Fecha</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Horarios</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest">Localización</th>
                    <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111]">
                  {filteredEvents.map(e => (
                    <tr key={e.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-5">
                         <div className="w-16 h-16 bg-black border border-[#222] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                            <img src={getImageUrl(e.flyer)} className="w-full h-full object-cover" alt="" />
                         </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-base font-bold uppercase tracking-tight text-white group-hover:text-accent transition-colors leading-none">
                            {e.title}
                          </span>
                          <span className="text-xs font-mono text-[#aaa] uppercase tracking-widest flex items-center gap-2">
                            <User size={12} className="text-accent" /> {e.organizer?.name || 'USER_ID: ' + e.user_id}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-[#bbb] font-mono">{formatDate(e.date)}</td>
                      <td className="p-5 text-sm text-[#bbb] font-mono">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-bold"><Clock size={14} className="text-accent" /> {e.start_time?.slice(0, 5) || '00:00'} HS</div>
                            <div className="text-[10px] text-[#666] tracking-widest">HASTA {e.end_time?.slice(0, 5) || '--:--'} HS</div>
                         </div>
                      </td>
                      <td className="p-5 text-sm text-[#bbb] font-mono uppercase tracking-wider">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2"><MapPin size={14} className="text-accent" /> {e.location || 'SALA TBD'}</div>
                          <div className="text-[10px] text-[#666]">{e.neighborhood || 'BARRIO TBD'}</div>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-3">
                          {eventSubTab === 'pending' && (
                            <button 
                              onClick={() => toggleVerification(e)}
                              className="p-3 bg-[#111] text-green-500 hover:bg-green-500/10 border border-[#222] hover:border-green-500/30 transition-all"
                              title="Verificar Evento"
                            >
                              <ShieldCheck size={20} />
                            </button>
                          )}
                          <button 
                            className="p-3 bg-[#111] text-[#aaa] hover:text-white hover:bg-[#222] border border-[#222] hover:border-[#333] transition-all"
                            title="Editar Evento"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => setItemToDelete({ type: 'evento', id: e.id, name: e.title })}
                            className="p-3 bg-[#111] text-[#aaa] hover:text-red-500 hover:bg-red-500/10 border border-[#222] hover:border-red-500/30 transition-all"
                            title="Eliminar Evento"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE ELIMINACIÓN (SIN CAMBIOS, YA ESTÁ ESTILIZADO) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-[#0a0a0a] border-2 border-red-500/50 p-8 space-y-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-4 text-red-500">
              <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={30} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-black italic uppercase italic tracking-tighter">Eliminar {itemToDelete.type}</h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 text-white">Confirmación de Protocolo</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-[#aaa] font-mono text-sm leading-relaxed">
                Estás a punto de eliminar permanentemente el registro:
              </p>
              <div className="p-4 bg-red-500/5 border border-red-500/20">
                <p className="text-white font-bold uppercase text-base tracking-widest">{itemToDelete.name}</p>
                <p className="text-[10px] font-mono text-[#555]">ID: {itemToDelete.id}</p>
              </div>
              <p className="text-[10px] text-red-500 font-mono uppercase italic">Esta acción no se puede deshacer.</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-4 border border-[#222] text-[#aaa] font-display font-black italic uppercase text-xs hover:bg-[#111] transition-all"
              >
                Abortar
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 text-white font-display font-black italic uppercase text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
