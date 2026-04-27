import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FiltersBar from './components/FiltersBar';
import EventsGrid from './components/EventsGrid';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Main Content Area */}
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

        {/* Filters Section */}
        <FiltersBar />

        {/* Events Grid Section */}
        <div className="pt-4">
          <EventsGrid />
        </div>

      </main>
    </div>
  );
}

export default App;
