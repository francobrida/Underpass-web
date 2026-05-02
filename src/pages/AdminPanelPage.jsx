import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import apiClient, { getAuthUser } from '../services/apiClient';
import { 
  Users, Calendar, Shield, ShieldCheck, 
  Trash2, Edit3, AlertTriangle, 
  CheckCircle2, Hourglass, Search,
  ChevronLeft, ChevronRight, History, Clock, MapPin, User,
  ArrowBigDown, XCircle
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
  const [userToEdit, setUserToEdit] = useState(null); // Usuario seleccionado para editar
  const [editFormData, setEditFormData] = useState({}); // Datos temporales del formulario
  const [eventToEdit, setEventToEdit] = useState(null); // Evento seleccionado para editar
  const [eventEditFormData, setEventEditFormData] = useState({}); // Datos temporales del formulario de evento

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data: result } = await apiClient.get('/users');
        setUsers(result.data || result || []);
      } else {
        const [vResponse, uResponse] = await Promise.all([
          apiClient.get('/events', { params: { verified: 'true' } }),
          apiClient.get('/events', { params: { verified: 'false' } })
        ]);
        
        const vData = vResponse.data?.data || vResponse.data || [];
        const uData = uResponse.data?.data || uResponse.data || [];
        
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
  const handleEditClick = (user) => {
    setUserToEdit(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'clubber',
      points: user.points || 0
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/users/${userToEdit.id}`, editFormData);
      setUserToEdit(null);
      fetchData();
    } catch (err) {
      alert("Error al actualizar usuario");
    }
  };

  // --- LOGIC FOR EVENTS ---
  const handleEventEditClick = (event) => {
    setEventToEdit(event);
    setEventEditFormData({
      title: event.title || '',
      lineup: event.lineup || '',
      description: event.description || '',
      date: event.date ? event.date.split('T')[0] : '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      neighborhood: event.neighborhood || '',
      price: event.price || 0,
      price_info: event.price_info || '',
      ticket_link: event.ticket_link || '',
      vouch_count: event.vouch_count || event.vouches_count || 0,
      is_verified: event.is_verified === true || event.is_verified === 1,
      is_18_plus: event.is_18_plus === true || event.is_18_plus === 1,
      flyer: event.flyer || ''
    });
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      // Construimos el payload base
      const payload = {
        title: eventEditFormData.title,
        lineup: eventEditFormData.lineup,
        description: eventEditFormData.description,
        date: eventEditFormData.date,
        location_name: eventEditFormData.location,
        neighborhood: eventEditFormData.neighborhood,
        price: parseFloat(eventEditFormData.price) || 0,
        is_18_plus: !!eventEditFormData.is_18_plus,
        is_verified: !!eventEditFormData.is_verified,
        start_time: eventEditFormData.start_time ? eventEditFormData.start_time.slice(0, 5) : null,
        end_time: eventEditFormData.end_time ? eventEditFormData.end_time.slice(0, 5) : null,
      };

      // Campos opcionales: Solo se envían si tienen contenido para evitar errores 
      // de validación en el backend
      if (eventEditFormData.price_info && eventEditFormData.price_info.trim() !== '') {
        payload.price_info = eventEditFormData.price_info;
      }
      
      if (eventEditFormData.ticket_link && eventEditFormData.ticket_link.trim() !== '') {
        payload.ticket_link = eventEditFormData.ticket_link;
      }

      await apiClient.put(`/events/${eventToEdit.id}`, payload);
      setEventToEdit(null);
      fetchData();
    } catch (err) {
      console.error("Error detallado:", err.response?.data || err.message);
      
      let errorDetail = "";
      const serverData = err.response?.data;
      
      if (serverData?.errors) {
        errorDetail = Object.values(serverData.errors).flat().join('\n');
      } else {
        errorDetail = serverData?.message || err.message || "Error desconocido";
      }

      alert(`Error al actualizar evento:\n${errorDetail}`);
    }
  };

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

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => {
      const eventDate = new Date(e.date);
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

  const getImageUrl = (path) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.split('/api/v1')[0];
    const imagePath = path || 'images/flyers/party1.jpg';
    return imagePath.startsWith('http') ? imagePath : `${baseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 text-white">
      <Navbar />
      
      <main className="max-w-[1500px] mx-auto w-full px-6 md:px-10 mt-10 space-y-8 text-sm">
        
        {!eventToEdit ? (
          <>
            {/* Admin Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#111] pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-accent">
                  <Shield size={40} className="animate-pulse" />
                  <h1 className="text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter">Admin Control</h1>
                </div>
                <p className="text-[#aaa] font-mono text-xs uppercase tracking-[0.4em]">// Barcelona Underground Event Protocol //</p>
              </div>

              <div className="flex bg-[#050505] border border-[#111] p-1.5 self-start">
                <button 
                  onClick={() => { setActiveTab('users'); setUserPage(1); }}
                  className={`flex items-center gap-3 px-10 py-4 font-display font-black italic text-sm uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'users' ? 'bg-white text-black shadow-neon' : 'text-[#888] hover:text-white'
                  }`}
                >
                  <Users size={18} /> Usuarios
                </button>
                <button 
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-3 px-10 py-4 font-display font-black italic text-sm uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'events' ? 'bg-white text-black shadow-neon' : 'text-[#888] hover:text-white'
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
                          Rol <ArrowBigDown size={12} className={roleSortOrder === 'desc' ? 'rotate-180' : ''} />
                        </th>
                        <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest text-right">Acciones</th>
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
                                onClick={() => handleEditClick(u)}
                                className="p-3 bg-[#111] text-[#aaa] hover:text-white hover:bg-[#222] transition-all border border-[#222] hover:border-[#333] cursor-pointer"
                                title="Editar Perfil"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => setItemToDelete({ type: 'usuario', id: u.id, name: u.name })}
                                className="p-3 bg-[#111] text-[#aaa] hover:text-red-500 hover:bg-red-500/10 transition-all border border-[#222] hover:border-red-500/30 cursor-pointer"
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
                
                {totalUserPages > 1 && (
                  <div className="flex justify-center items-center gap-6 pt-4">
                    <button 
                      disabled={userPage === 1}
                      onClick={() => setUserPage(p => p - 1)}
                      className="p-4 border border-[#222] text-[#aaa] hover:text-white disabled:opacity-20 hover:bg-[#111] cursor-pointer"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="flex gap-3">
                      {[...Array(totalUserPages)].map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => setUserPage(i + 1)}
                          className={`w-12 h-12 font-mono text-sm transition-all border cursor-pointer ${userPage === i + 1 ? 'bg-white text-black font-bold border-white' : 'text-[#aaa] hover:text-white border-[#222] hover:bg-[#111]'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      disabled={userPage === totalUserPages}
                      onClick={() => setUserPage(p => p + 1)}
                      className="p-4 border border-[#222] text-[#aaa] hover:text-white disabled:opacity-20 hover:bg-[#111] cursor-pointer"
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
                      className={`flex items-center gap-3 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
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
                        <th className="p-5 text-xs font-mono text-[#aaa] uppercase tracking-widest"></th>
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
                             <div className="w-16 h-16 bg-black border border-[#222] overflow-hidden group-hover:scale-105 transition-all duration-500">
                                <img src={getImageUrl(e.flyer)} className="w-full h-full object-cover" alt="" />
                             </div>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-base font-bold uppercase tracking-tight text-white group-hover:text-accent transition-colors leading-none">
                                {e.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#aaa] uppercase tracking-widest flex items-center gap-2">
                                <User size={12} className="text-accent" /> 
                                {e.organizer?.name || e.organizer || 'UNDERPASS_SYSTEM'}
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
                              
                              <button 
                                onClick={() => handleEventEditClick(e)}
                                className="p-3 bg-[#111] text-[#aaa] hover:text-white hover:bg-[#222] border border-[#222] hover:border-[#333] transition-all cursor-pointer"
                                title="Editar Evento"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => setItemToDelete({ type: 'evento', id: e.id, name: e.title })}
                                className="p-3 bg-[#111] text-[#aaa] hover:text-red-500 hover:bg-red-500/10 border border-[#222] hover:border-red-500/30 transition-all cursor-pointer"
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
          </>
        ) : (
          /* --- DEDICATED EVENT EDIT VIEW --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between mb-10 border-b border-[#111] pb-8">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-display font-black italic uppercase tracking-tighter text-white">Editar Evento</h2>
                <div className="flex items-center gap-3 text-accent font-mono text-sm uppercase tracking-[0.3em]">
                   Organizador: {eventToEdit.organizer?.name || eventToEdit.organizer || 'Underpass'}
                </div>
              </div>
              <button 
                onClick={() => setEventToEdit(null)}
                className="px-8 py-4 border border-[#222] text-[#888] font-display font-black italic uppercase text-xs tracking-widest hover:bg-[#111] hover:text-white transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Left Column: Visuals & Genres (4/12) */}
              <div className="lg:col-span-4 space-y-8">
                <div className="aspect-[3/4] bg-[#050505] border border-[#111] overflow-hidden group relative shadow-2xl">
                   <img 
                     src={getImageUrl(eventEditFormData.flyer)} 
                     className="w-full h-full object-cover transition-all duration-700" 
                     alt="" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
                </div>

                <div className="p-8 bg-[#050505] border border-[#111] space-y-4">
                  <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Géneros</p>
                  <div className="flex flex-wrap gap-2">
                    {eventToEdit.genres?.map(g => (
                      <span key={g.id} className="px-3 py-1 bg-black border border-[#222] text-[10px] text-accent font-mono">
                        #{g.name.toUpperCase()}
                      </span>
                    ))}
                    {!eventToEdit.genres?.length && <span className="text-[10px] text-[#333] font-mono italic">SIN GÉNEROS ASIGNADOS</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Form Fields (8/12) */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Título</label>
                    <input 
                      type="text" 
                      value={eventEditFormData.title} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, title: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-2xl font-bold focus:border-accent outline-none text-white uppercase" 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Lineup</label>
                    <textarea 
                      value={eventEditFormData.lineup} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, lineup: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base h-28 focus:border-accent outline-none text-white uppercase font-bold resize-none leading-relaxed" 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Descripción</label>
                    <textarea 
                      value={eventEditFormData.description} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, description: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base h-40 focus:border-accent outline-none text-[#888] resize-none leading-relaxed" 
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Fecha</label>
                    <input 
                      type="date" 
                      value={eventEditFormData.date} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, date: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base focus:border-accent outline-none text-white cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Inicio</label>
                    <input 
                      type="time" 
                      value={eventEditFormData.start_time} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, start_time: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base focus:border-accent outline-none text-white cursor-pointer" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Fin</label>
                    <input 
                      type="time" 
                      value={eventEditFormData.end_time} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, end_time: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base focus:border-accent outline-none text-white cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Sala / Localización</label>
                    <input 
                      type="text" 
                      value={eventEditFormData.location} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, location: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base focus:border-accent outline-none text-white uppercase font-bold" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Barrio</label>
                    <input 
                      type="text" 
                      value={eventEditFormData.neighborhood} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, neighborhood: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base focus:border-accent outline-none text-white uppercase font-bold" 
                    />
                  </div>
                </div>

                {/* Commercial & Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Precio Base (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={eventEditFormData.price} 
                      onChange={(e) => setEventEditFormData({...eventEditFormData, price: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-3xl font-display font-black italic text-accent focus:border-accent outline-none" 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Info de Precios</label>
                    <input 
                      type="text" 
                      value={eventEditFormData.price_info} 
                      placeholder="EJ: 15€ EARLY / 20€ TAQUILLA"
                      onChange={(e) => setEventEditFormData({...eventEditFormData, price_info: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base focus:border-accent outline-none text-white uppercase" 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-3">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.4em]">Link de Entradas</label>
                    <input 
                      type="text" 
                      value={eventEditFormData.ticket_link} 
                      placeholder="https://link-externo-de-tickets.com"
                      onChange={(e) => setEventEditFormData({...eventEditFormData, ticket_link: e.target.value})} 
                      className="w-full bg-black border border-[#111] p-5 text-base font-mono focus:border-accent outline-none text-accent" 
                    />
                  </div>
                </div>

                {/* System Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="flex gap-6 items-end md:col-span-2">
                    <button 
                      type="button" 
                      onClick={() => setEventEditFormData({...eventEditFormData, is_verified: !eventEditFormData.is_verified})} 
                      className={`flex-1 h-[68px] flex items-center justify-center gap-4 border-2 transition-all font-display font-black italic uppercase text-sm tracking-widest cursor-pointer ${eventEditFormData.is_verified ? 'bg-green-500 text-black border-green-500 shadow-neon' : 'bg-black border-[#222] text-[#444]'}`}
                    >
                      <ShieldCheck size={20} /> {eventEditFormData.is_verified ? 'Verificado' : 'Pendiente'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEventEditFormData({...eventEditFormData, is_18_plus: !eventEditFormData.is_18_plus})} 
                      className={`flex-1 h-[68px] flex items-center justify-center gap-4 border-2 transition-all font-display font-black italic uppercase text-sm tracking-widest cursor-pointer ${eventEditFormData.is_18_plus ? 'bg-red-500 text-white border-red-500 shadow-neon' : 'bg-black border-[#222] text-[#444]'}`}
                    >
                      <AlertTriangle size={20} /> {eventEditFormData.is_18_plus ? '+18 Plus' : 'Todo Público'}
                    </button>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="pt-16 flex gap-8">
                  <button 
                    type="button" 
                    onClick={() => setEventToEdit(null)} 
                    className="flex-1 py-8 border border-[#222] text-[#666] font-display font-black italic uppercase tracking-[0.3em] hover:bg-[#111] hover:text-white transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-8 bg-white text-black font-display font-black italic uppercase tracking-[0.3em] shadow-neon hover:bg-accent hover:text-white transition-all transform hover:-translate-y-1 cursor-pointer"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* --- EXTERNAL MODALS --- */}

      {/* MODAL: ELIMINAR ITEM */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-[#0a0a0a] border-2 border-red-500/50 p-8 space-y-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-4 text-red-500">
              <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={30} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter">Eliminar {itemToDelete.type}</h3>
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
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-4 border border-[#222] text-[#888] font-display font-black italic uppercase text-xs hover:bg-[#111] transition-all cursor-pointer"
              >
                Abortar
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 text-white font-display font-black italic uppercase text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500 transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO COMPACTO */}
      {userToEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="max-w-2xl w-full bg-[#0a0a0a] border border-[#222] p-6 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-start border-b border-[#111] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter text-white">Editar Perfil</h3>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/80">Gestión de Usuario</p>
              </div>
              <button onClick={() => setUserToEdit(null)} className="text-[#333] hover:text-white transition-colors cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5 opacity-50">
                  <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest">ID</label>
                  <div className="bg-[#111] p-2.5 text-xs font-mono border border-[#222]">#{userToEdit.id}</div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest">Nombre</label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-black border border-[#222] p-2.5 text-xs focus:border-accent outline-none transition-all uppercase" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest">Email</label>
                  <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-black border border-[#222] p-2.5 text-xs focus:border-accent outline-none transition-all lowercase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest">Rol</label>
                  <select value={editFormData.role} onChange={(e) => setEditFormData({...editFormData, role: e.target.value})} className="w-full bg-black border border-[#222] p-2.5 text-xs focus:border-accent outline-none transition-all uppercase cursor-pointer">
                    <option value="clubber">Clubber</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest">Puntos</label>
                  <input type="number" value={editFormData.points} onChange={(e) => setEditFormData({...editFormData, points: parseInt(e.target.value) || 0})} className="w-full bg-black border border-[#222] p-2.5 text-xs focus:border-accent outline-none transition-all text-accent font-bold" />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setUserToEdit(null)} className="flex-1 py-3.5 border border-[#222] text-[#888] font-display font-black italic uppercase text-[10px] hover:bg-[#111] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-3.5 bg-white text-black font-display font-black italic uppercase text-[10px] shadow-neon transition-all cursor-pointer">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
