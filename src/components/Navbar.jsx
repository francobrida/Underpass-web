import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Hourglass, Ticket, Medal, User, LogOut, Loader2 } from 'lucide-react';
import apiClient, { clearAuth, getAuthUser } from '../services/apiClient';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = getAuthUser();

  const navItems = useMemo(() => {
    const items = [
      { name: 'PANEL ADMIN', icon: <Settings size={16} />, href: '#', adminOnly: true },
      { name: 'WAITING ROOM', icon: <Hourglass size={16} />, href: '/waiting-room' },
      { name: 'MIS EVENTOS', icon: <Ticket size={16} />, href: '#' },
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
      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-[#888] hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            {React.cloneElement(item.icon, { size: 18 })}
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 pl-4 border-l border-[#1f1f1f]">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-display font-black italic uppercase tracking-[0.2em] bg-white text-black hover:bg-accent hover:text-white transition-all duration-300 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <><LogOut size={18} /> SALIR</>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
