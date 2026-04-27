import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';

const FiltersBar = () => {
  return (
    <div className="w-full bg-[#050505] border border-[#1f1f1f] p-6 relative overflow-hidden">
      
      {/* Decorative industrial lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#333] to-transparent opacity-50"></div>
      <div className="absolute top-0 left-6 w-16 h-[2px] bg-accent shadow-neon"></div>
      
      {/* Technical background pattern (subtle grid) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
        
        {/* Búsqueda */}
        <div className="flex-[1.5] w-full group">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">🔍</span> BÚSQUEDA
          </label>
          <input 
            type="text" 
            placeholder="INTRODUCE NOMBRE..." 
            className="w-full bg-black border border-[#222] rounded-none px-4 py-3 text-xs text-white font-mono placeholder-[#444] focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all"
          />
        </div>

        {/* Barrio */}
        <div className="flex-1 w-full group relative">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">📍</span> BARRIO
          </label>
          <div className="relative">
            <select className="w-full bg-black border border-[#222] rounded-none pl-4 pr-10 py-3 text-xs text-white font-mono focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all appearance-none cursor-pointer">
              <option>TODOS</option>
              <option>POBLE SEC</option>
              <option>POBLENOU</option>
              <option>BORN</option>
              <option>GRÀCIA</option>
              <option>GÓTICO</option>
              <option>EIXAMPLE</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Estilo */}
        <div className="flex-1 w-full group relative">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">🎧</span> ESTILO
          </label>
          <div className="relative">
            <select className="w-full bg-black border border-[#222] rounded-none pl-4 pr-10 py-3 text-xs text-white font-mono focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all appearance-none cursor-pointer">
              <option>CUALQUIERA</option>
              <option>TECHNO</option>
              <option>HOUSE</option>
              <option>TECH-HOUSE</option>
              <option>MINIMAL</option>
              <option>EXPERIMENTAL</option>
              <option>INDUSTRIAL</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Precio */}
        <div className="flex-1 w-full group relative">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">🎟️</span> PRECIO
          </label>
          <div className="relative">
            <select className="w-full bg-black border border-[#222] rounded-none pl-4 pr-10 py-3 text-xs text-white font-mono focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all appearance-none cursor-pointer">
              <option>CUALQUIERA</option>
              <option>GRATIS</option>
              <option>MENOS DE 10€</option>
              <option>10€ - 20€</option>
              <option>MÁS DE 20€</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Limpiar Filtros Button */}
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0a0a] hover:bg-accent border border-[#333] hover:border-accent rounded-none text-[11px] font-bold text-[#888] hover:text-white font-mono uppercase tracking-widest transition-all duration-300 group hover:shadow-[3px_3px_0px_rgba(255,255,255,0.2)]">
            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
            RESET
          </button>
        </div>

      </div>
    </div>
  );
};

export default FiltersBar;
