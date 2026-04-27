import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FiltersBar from './components/FiltersBar';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 mt-4">
        
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

        {/* This is where the events grid will go next */}
        <div className="pt-8">
          {/* placeholder for events grid */}
        </div>

      </main>
    </div>
  );
}

export default App;
