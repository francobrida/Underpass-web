import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Hourglass, Ticket, Medal, User, LogOut, Loader2 } from 'lucide-react';
import apiClient, { clearAuth, getAuthUser } from '../services/apiClient';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = getAuthUser();

  const navItems = useMemo(() => {
    const items = [
      { name: 'PANEL ADMIN', icon: <Settings size={16} />, href: '/admin', adminOnly: true },
      { name: 'WAITING ROOM', icon: <Hourglass size={16} />, href: '/waiting-room' },
      { name: 'MIS EVENTOS', icon: <Ticket size={16} />, href: '/my-events' },
      { name: 'SELLOS Y PUNTOS', icon: <Medal size={16} />, href: '#' },
      { name: 'PERFIL', icon: <User size={16} />, href: '#' },
    ];

    // Solo mostramos items que no son adminOnly, o si el usuario es admin
    return items.filter(item => !item.adminOnly || user?.role === 'admin');
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Intentamos avisar al backend
      await apiClient.post('/logout');
    } catch (err) {
      console.warn("Error al cerrar sesión en el servidor, limpiando localmente...");
    } finally {
      // Siempre limpiamos localmente aunque el servidor falle o esté offline
      clearAuth();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  return (
    <nav className="w-full bg-background border-b border-border px-8 py-5 flex items-center justify-between">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link to="/events" className="text-2xl text-white tracking-tighter uppercase font-black italic">
          UNDER<span className="text-accent">PASS</span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest transition-all duration-200 rounded ${
                isActive 
                  ? 'text-white bg-white/10' 
                  : 'text-[#888] hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="ml-4 flex items-center gap-2 px-5 py-2 border border-border text-text-secondary hover:text-white hover:border-accent hover:shadow-[0_0_10px_rgba(139,92,246,0.2)] rounded font-display uppercase text-[11px] font-bold tracking-widest transition-all duration-300 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 size={14} className="animate-spin text-accent" />
          ) : (
            <LogOut size={14} className="text-accent" />
          )}
          {isLoggingOut ? 'Saliendo...' : 'Salir'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
