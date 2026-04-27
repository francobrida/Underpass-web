import React from 'react';
import { Settings, Hourglass, Ticket, Medal, User } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { name: 'PANEL ADMIN', icon: <Settings size={16} />, href: '#' },
    { name: 'WAITING ROOM', icon: <Hourglass size={16} />, href: '#' },
    { name: 'MIS EVENTOS', icon: <Ticket size={16} />, href: '#' },
    { name: 'SELLOS Y PUNTOS', icon: <Medal size={16} />, href: '#' },
    { name: 'PERFIL', icon: <User size={16} />, href: '#' },
  ];

  return (
    <nav className="w-full bg-background border-b border-border px-8 py-5 flex items-center justify-between">
      {/* Logo */}
      <div className="flex-shrink-0">
        <a href="#" className="text-2xl text-white tracking-tighter uppercase font-black italic">
          UNDER<span className="text-accent">PASS</span>
        </a>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center gap-2 text-text-secondary hover:text-white text-[11px] font-bold tracking-widest transition-colors duration-200"
          >
            <span className="text-text-secondary">{item.icon}</span>
            {item.name}
          </a>
        ))}
        
        {/* Logout Button */}
        <button className="ml-4 px-5 py-2 border border-border text-text-secondary hover:text-white hover:border-accent hover:shadow-[0_0_10px_rgba(139,92,246,0.2)] rounded font-display uppercase text-[11px] font-bold tracking-widest transition-all duration-300">
          Salir
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
