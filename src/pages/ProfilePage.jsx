import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Eye, EyeOff, Save, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import apiClient, { getAuthUser, setAuthUser } from '../services/apiClient';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Notifications
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showNotification("El nombre y el correo electrónico son obligatorios.", "error");
      return;
    }

    setSavingUser(true);
    try {
      // Intentamos actualizar contra la API
      let updatedUser = { ...currentUser, name, email };

      try {
        // Probamos endpoint estándar /users/{id} o /profile
        await apiClient.put(`/users/${currentUser.id}`, { name, email });
      } catch (err) {
        console.warn("Error en /users/{id}, probando con /profile...");
        try {
          await apiClient.put('/profile', { name, email });
        } catch (subErr) {
          console.warn("Fallo en actualizar en el backend.");
          throw subErr;
        }
      }

      setAuthUser(updatedUser);
      setCurrentUser(updatedUser);
      showNotification("Perfil de usuario actualizado con éxito.");
    } catch (error) {
      let errorMsg = "Hubo un error al actualizar los datos requeridos.";
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        if (Array.isArray(firstError)) {
          errorMsg = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMsg = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      showNotification(errorMsg, "error");
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification("Todos los campos de contraseña son obligatorios.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("La nueva contraseña y la confirmación no coinciden.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("La nueva contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    setSavingPass(true);
    try {
      try {
        await apiClient.put(`/users/${currentUser.id}/password`, {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword
        });
      } catch (err) {
        console.warn("Intentando endpoint alternativo /profile/password...");
        try {
          await apiClient.put('/profile/password', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword
          });
        } catch (subErr) {
          console.warn("Endpoint de contraseña no disponible en el backend temporalmente.");
          throw subErr;
        }
      }
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification("Contraseña modificada correctamente.");
    } catch (error) {
      let errorMsg = "Error al actualizar la contraseña.";
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        if (Array.isArray(firstError)) {
          errorMsg = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMsg = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      showNotification(errorMsg, "error");
    } finally {
      setSavingPass(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pb-20 selection:bg-accent selection:text-black relative selection:text-white">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[130px] -mr-[300px] -mt-[300px]"></div>
      </div>

      <main className="max-w-[1100px] mx-auto w-full px-6 mt-12 space-y-10 relative z-10">

        <div className="space-y-6">
          <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
            <div>
              <h1 className="text-4xl text-white font-display font-black uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">Perfil del Usuario</h1>
              <p className="text-[#666] font-mono text-[10px] uppercase tracking-[0.2em] mt-1">
                Ajustes de la cuenta de Underpass
              </p>
            </div>
          </div>
        </div>

        {notification && (
          <div className={`p-4 font-mono text-xs border uppercase tracking-widest flex items-center justify-between animate-in fade-in duration-300 ${
            notification.type === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-accent/10 border-accent/30 text-accent'
          }`}>
            <span className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertTriangle size={14} /> : <Sparkles size={14} />}
              {notification.msg}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-5 space-y-8 bg-black/80 backdrop-blur-md border border-accent/20 p-8 shadow-[0_0_40px_rgba(139,92,246,0.08)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
            
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 rounded-sm bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto shadow-neon relative group-hover:scale-105 transition-all duration-300">
                <User size={36} className="text-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl text-white font-display font-black italic uppercase tracking-wider">{currentUser.name}</h3>
                <p className="text-[#666] font-mono text-[11px] uppercase tracking-widest">{currentUser.email}</p>
                <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-[9px] font-mono font-bold uppercase tracking-widest mt-2 rounded-sm">
                  Rol: {currentUser.role || 'Usuario'}
                </div>
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-6 space-y-4">
              <h4 className="text-[10px] text-white font-mono uppercase tracking-[0.3em] font-bold">Resumen de cuenta</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b0b0b] border border-[#1f1f1f] p-4 text-center space-y-1">
                  <p className="text-[#555] font-mono text-[8px] uppercase tracking-widest leading-none">Acceso ID</p>
                  <p className="text-accent font-display font-black italic text-lg">{currentUser.id}</p>
                </div>
                <div className="bg-[#0b0b0b] border border-[#1f1f1f] p-4 text-center space-y-1">
                  <p className="text-[#555] font-mono text-[8px] uppercase tracking-widest leading-none">Status</p>
                  <p className="text-green-400 font-display font-black italic text-lg uppercase">ACTIVO</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">

            <form onSubmit={handleUpdateProfile} className="bg-black/80 backdrop-blur-md border border-accent/20 p-8 shadow-[0_0_40px_rgba(139,92,246,0.08)] relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
              
              <div className="flex items-center gap-2 pb-6 border-b border-[#1a1a1a]">
                <Shield size={16} className="text-accent" />
                <h3 className="text-lg text-white font-display font-black italic uppercase tracking-wider">Información Personal</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                    <User size={12} /> Nombre Completo
                  </label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                    placeholder="Escribe tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                    <Mail size={12} /> Correo Electrónico
                  </label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-[#222] p-4 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                    placeholder="Escribe tu email"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-neon transform hover:-translate-y-1 disabled:opacity-50"
                  >
                    {savingUser ? <Loader2 size={14} className="animate-spin text-white" /> : <Save size={14} />}
                    {savingUser ? 'ACTUALIZANDO...' : 'GUARDAR CAMBIOS'}
                  </button>
                </div>
              </div>
            </form>

            <form onSubmit={handleUpdatePassword} className="bg-black/80 backdrop-blur-md border border-accent/20 p-8 shadow-[0_0_40px_rgba(139,92,246,0.08)] relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
              
              <div className="flex items-center gap-2 pb-6 border-b border-[#1a1a1a]">
                <Lock size={16} className="text-accent" />
                <h3 className="text-lg text-white font-display font-black italic uppercase tracking-wider">Modificar Contraseña</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6">

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input 
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black border border-[#222] p-4 pr-12 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                      placeholder="Contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-accent transition-colors"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black border border-[#222] p-4 pr-12 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-accent transition-colors"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-[#555] font-mono uppercase tracking-[0.2em] font-bold">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black border border-[#222] p-4 pr-12 text-sm text-white font-mono focus:border-accent outline-none transition-all"
                      placeholder="Escribe de nuevo"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-accent transition-colors"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPass}
                    className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-display font-black italic uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-neon transform hover:-translate-y-1 disabled:opacity-50"
                  >
                    {savingPass ? <Loader2 size={14} className="animate-spin text-white" /> : <Save size={14} />}
                    {savingPass ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
