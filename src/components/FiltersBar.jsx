import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import apiClient from '../services/apiClient';

const FiltersBar = ({ onFilterChange, filters }) => {
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Cargar Géneros
        const { data: gResult } = await apiClient.get('/genres');
        setAvailableGenres(gResult.data || gResult || []);

        // Cargar Barrios
        // Si no tienes este endpoint, el catch usará el backup
        const { data: nResult } = await apiClient.get('/neighborhoods');
        setAvailableNeighborhoods(nResult.data || nResult || []);
      } catch (err) {
        console.error("Error cargando filtros dinámicos:", err);
        setAvailableGenres([]);
        setAvailableNeighborhoods([]);
      }
    };
    fetchFilterData();
  }, []);

  const handleReset = () => {
    onFilterChange({
      search: '',
      neighborhood: '',
      genre: '',
      price: ''
    });
  };

  return (
    <div className="w-full bg-[#050505] border border-[#1f1f1f] p-6 relative overflow-hidden">
      
      {/* Decorative industrial lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#333] to-transparent opacity-50"></div>
      <div className="absolute top-0 left-6 w-16 h-[2px] bg-accent shadow-neon"></div>
      
      <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
        
        {/* Búsqueda */}
        <div className="flex-[1.5] w-full group">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">🔍</span> BÚSQUEDA
          </label>
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="NOMBRE O LINEUP..." 
            className="w-full bg-black border border-[#222] rounded-none px-4 py-3 text-xs text-white font-mono placeholder-[#444] focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all"
          />
        </div>

        {/* Barrio */}
        <div className="flex-1 w-full group relative">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">📍</span> BARRIO
          </label>
          <div className="relative">
            <select 
              value={filters.neighborhood}
              onChange={(e) => onFilterChange({ neighborhood: e.target.value })}
              className="w-full bg-black border border-[#222] rounded-none pl-4 pr-10 py-3 text-xs text-white font-mono focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all appearance-none cursor-pointer"
            >
              <option value="">TODOS</option>
              {availableNeighborhoods.map((n, i) => (
                <option key={i} value={n}>
                  {n.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Estilo / Género */}
        <div className="flex-1 w-full group relative">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">🎧</span> ESTILO
          </label>
          <div className="relative">
            <select 
              value={filters.genre}
              onChange={(e) => onFilterChange({ genre: e.target.value })}
              className="w-full bg-black border border-[#222] rounded-none pl-4 pr-10 py-3 text-xs text-white font-mono focus:outline-none focus:border-accent focus:shadow-[3px_3px_0px_var(--color-accent)] transition-all appearance-none cursor-pointer"
            >
              <option value="">CUALQUIERA</option>
              {availableGenres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Botón de Ordenar por Precio */}
        <div className="flex-1 w-full group relative">
          <label className="flex items-center gap-2 text-[11px] text-[#888] font-display font-black uppercase tracking-[0.15em] mb-2 group-focus-within:text-accent transition-colors">
            <span className="text-sm">🎟️</span> ORDENAR
          </label>
          <button 
            onClick={() => {
              const nextPrice = filters.price === '' ? 'asc' : (filters.price === 'asc' ? 'desc' : '');
              onFilterChange({ price: nextPrice });
            }}
            className={`w-full flex items-center justify-between px-4 py-3 border text-xs font-mono transition-all ${
              filters.price 
                ? 'bg-accent/10 border-accent text-accent shadow-[3px_3px_0px_var(--color-accent)]' 
                : 'bg-black border-[#222] text-[#666] hover:border-[#444]'
            }`}
          >
            <span className="uppercase tracking-widest">
              {filters.price === '' && 'POR FECHA'}
              {filters.price === 'asc' && 'MÁS BARATO'}
              {filters.price === 'desc' && 'MÁS CARO'}
            </span>
            {filters.price === 'asc' && <ChevronDown size={14} className="rotate-180" />}
            {filters.price === 'desc' && <ChevronDown size={14} />}
            {filters.price === '' && <RotateCcw size={14} className="opacity-30" />}
          </button>
        </div>

        {/* Limpiar Filtros Button */}
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={handleReset}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0a0a] hover:bg-accent border border-[#333] hover:border-accent rounded-none text-[11px] font-bold text-[#888] hover:text-white font-mono uppercase tracking-widest transition-all duration-300 group hover:shadow-[3px_3px_0px_rgba(255,255,255,0.2)]"
          >
            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
            RESET
          </button>
        </div>

      </div>
    </div>
  );
};

export default FiltersBar;
