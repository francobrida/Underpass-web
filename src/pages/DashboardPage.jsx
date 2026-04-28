import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FiltersBar from '../components/FiltersBar';
import EventsGrid from '../components/EventsGrid';

const DashboardPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    neighborhood: '',
    genre: '',
    price: ''
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-12 mt-4">

        {/* Header Titles */}
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl text-white font-display font-black uppercase italic tracking-tighter">
            Agenda Electrónica
          </h1>
          <p className="text-text-secondary text-xs uppercase tracking-[0.2em] font-bold">
            Barcelona Underground Scene
          </p>
        </div>

        {/* Filters */}
        <FiltersBar onFilterChange={handleFilterChange} filters={filters} />

        {/* Events Grid */}
        <div className="pt-4">
          <EventsGrid filters={filters} />
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;
