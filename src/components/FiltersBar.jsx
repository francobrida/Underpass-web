import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown, Search, MapPin, Music, SlidersHorizontal } from 'lucide-react';
import apiClient from '../services/apiClient';

const FiltersBar = ({ onFilterChange, filters }) => {
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const { data: gResult } = await apiClient.get('/genres');
        setAvailableGenres(gResult.data || gResult || []);

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
    <div className="w-full bg-[#040404]/80 backdrop-blur-lg border border-[#141414] hover:border-[#222] p-6 relative overflow-hidden transition-all duration-500 rounded-sm shadow-[0_0_40px_rgba(139,92,246,0.45)]">
      {/* Visual background lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#222] to-transparent opacity-60"></div>
      
      <div className="flex flex-row flex-nowrap gap-1 sm:gap-2 md:gap-4 items-end relative z-10 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
        
        {/* Búsqueda */}
        <div className="flex-[1.4] w-full group min-w-[70px] sm:min-w-[120px]">
          <label className="flex items-center gap-0.5 sm:gap-1.5 text-[6px] sm:text-[9px] md:text-xs text-[#999] font-mono uppercase tracking-[0.1em] sm:tracking-[0.25em] mb-1 md:mb-2 group-focus-within:text-accent transition-colors font-bold select-none whitespace-nowrap">
            <Search size={12} className="text-accent/80" /> BÚSQUEDA
          </label>
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="BUSCAR..." 
            className="w-full bg-[#080808] border border-[#1a1a1a] px-1 sm:px-2 py-1.5 sm:py-2 md:px-4 md:py-3 text-[8px] sm:text-[10px] md:text-sm text-white font-mono placeholder-[#444] focus:outline-none focus:border-accent hover:border-[#333] transition-all"
          />
        </div>

        {/* Barrio */}
        <div className="flex-1 w-full group relative min-w-[60px] sm:min-w-[100px]">
          <label className="flex items-center gap-0.5 sm:gap-1.5 text-[6px] sm:text-[9px] md:text-xs text-[#999] font-mono uppercase tracking-[0.1em] sm:tracking-[0.25em] mb-1 md:mb-2 group-focus-within:text-accent transition-colors font-bold select-none whitespace-nowrap">
            <MapPin size={10} className="text-accent/80 sm:w-3 sm:h-3" /> BARRIO
          </label>
          <div className="relative">
            <select 
              value={filters.neighborhood}
              onChange={(e) => onFilterChange({ neighborhood: e.target.value })}
              className="w-full bg-[#080808] border border-[#1a1a1a] pl-1 pr-4 sm:pl-2 sm:pr-6 py-1.5 sm:py-2 md:pl-4 md:pr-10 md:py-3 text-[8px] sm:text-[10px] md:text-sm text-white font-mono focus:outline-none focus:border-accent hover:border-[#333] transition-all appearance-none cursor-pointer"
            >
              <option value="">TODOS</option>
              {availableNeighborhoods.map((n, i) => (
                <option key={i} value={n}>
                  {n.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[#777] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Estilo / Género */}
        <div className="flex-1 w-full group relative min-w-[60px] sm:min-w-[100px]">
          <label className="flex items-center gap-0.5 sm:gap-1.5 text-[6px] sm:text-[9px] md:text-xs text-[#999] font-mono uppercase tracking-[0.1em] sm:tracking-[0.25em] mb-1 md:mb-2 group-focus-within:text-accent transition-colors font-bold select-none whitespace-nowrap">
            <Music size={10} className="text-accent/80 sm:w-3 sm:h-3" /> ESTILO
          </label>
          <div className="relative">
            <select 
              value={filters.genre}
              onChange={(e) => onFilterChange({ genre: e.target.value })}
              className="w-full bg-[#080808] border border-[#1a1a1a] pl-1 pr-4 sm:pl-2 sm:pr-6 py-1.5 sm:py-2 md:pl-4 md:pr-10 md:py-3 text-[8px] sm:text-[10px] md:text-sm text-white font-mono focus:outline-none focus:border-accent hover:border-[#333] transition-all appearance-none cursor-pointer"
            >
              <option value="">CUALQUIERA</option>
              {availableGenres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[#777] pointer-events-none group-focus-within:text-accent transition-colors" />
          </div>
        </div>

        {/* Ordenar por Precio */}
        <div className="flex-1 w-full group relative min-w-[60px] sm:min-w-[100px]">
          <label className="flex items-center gap-0.5 sm:gap-1.5 text-[6px] sm:text-[9px] md:text-xs text-[#999] font-mono uppercase tracking-[0.1em] sm:tracking-[0.25em] mb-1 md:mb-2 group-focus-within:text-accent transition-colors font-bold select-none whitespace-nowrap">
            <SlidersHorizontal size={10} className="text-accent/80 sm:w-3 sm:h-3" /> ORDENAR
          </label>
          <button 
            onClick={() => {
              const nextPrice = filters.price === '' ? 'asc' : (filters.price === 'asc' ? 'desc' : '');
              onFilterChange({ price: nextPrice });
            }}
            className={`w-full flex items-center justify-between px-1 sm:px-2 py-1.5 sm:py-2 md:px-4 md:py-3 border text-[8px] sm:text-[10px] md:text-sm font-mono transition-all ${
              filters.price 
                ? 'bg-accent/10 border-accent text-accent' 
                : 'bg-[#080808] border-[#1a1a1a] text-[#888] hover:border-[#333] hover:text-[#bbb]'
            }`}
          >
            <span className="uppercase tracking-widest sm:tracking-wider truncate max-w-[80%]">
              {filters.price === '' && 'POR FECHA'}
              {filters.price === 'asc' && 'MÁS BARATO'}
              {filters.price === 'desc' && 'MÁS CARO'}
            </span>
            {filters.price === 'asc' && <ChevronDown size={12} className="rotate-180 text-accent" />}
            {filters.price === 'desc' && <ChevronDown size={12} className="text-accent" />}
            {filters.price === '' && <RotateCcw size={12} className="opacity-30" />}
          </button>
        </div>

        {/* Limpiar Filtros */}
        <div className="flex-shrink-0 mt-0">
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 md:px-6 md:py-3 bg-[#0d0d0d] hover:bg-accent hover:text-white border border-[#1a1a1a] hover:border-accent text-[8px] sm:text-[10px] md:text-xs font-bold text-[#888] font-mono uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all duration-300 group shadow-none h-full"
          >
            <RotateCcw size={12} className="group-hover:-rotate-180 transition-transform duration-500 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FiltersBar;
