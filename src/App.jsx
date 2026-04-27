import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="card w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl text-white tracking-tighter uppercase font-black italic">
          Under<span className="text-accent">Pass</span>
        </h1>
        <p className="text-text-secondary text-lg">
          Agenda comunitaria de eventos de música electrónica under en Barcelona.
        </p>
        <div className="pt-4">
          <button className="btn-primary">
            Explorar Eventos
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
