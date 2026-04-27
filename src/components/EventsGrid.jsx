import React from 'react';
import EventCard from './EventCard';

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'INDUSTRIAL RESISTANCE',
    organizer: 'DJ TUPAPA',
    date: '27/10',
    time: '23:59h',
    location: 'POBLENOU',
    style: 'TECHNO',
    price: '15€',
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=800&q=80',
    tags: ['HARD-TECHNO', 'RAVE']
  },
  {
    id: 2,
    title: 'DEEP SESSIONS',
    organizer: 'EA QUI QUISQUAM',
    date: '28/10',
    time: '22:00h',
    location: 'BORN',
    style: 'HOUSE',
    price: 'GRATIS',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    tags: ['DEEP-HOUSE', 'GROOVE']
  },
  {
    id: 3,
    title: 'WOOOWOO',
    organizer: 'MOLESTIAS ET REP',
    date: '03/11',
    time: '20:00h',
    location: 'GRÀCIA',
    style: 'EXPERIMENTAL',
    price: '26€',
    image: 'https://images.unsplash.com/photo-1605364121556-97fa064cbafb?auto=format&fit=crop&w=800&q=80',
    tags: ['AMBIENT', 'LIVE-SET']
  },
  {
    id: 4,
    title: 'THE WAREHOUSE',
    organizer: 'TECHNO SYNDICATE',
    date: '10/11',
    time: '00:00h',
    location: 'POBLE SEC',
    style: 'TECH-HOUSE',
    price: '20€',
    image: 'https://images.unsplash.com/photo-1558317751-bc3ed6f85f72?auto=format&fit=crop&w=800&q=80',
    tags: ['UNDERGROUND']
  },
  {
    id: 5,
    title: 'SYNTHETIC VISIONS',
    organizer: 'ACID CLUB',
    date: '15/11',
    time: '23:00h',
    location: 'EIXAMPLE',
    style: 'MINIMAL',
    price: '12€',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    tags: ['ACID', 'VINYL-ONLY']
  },
  {
    id: 6,
    title: 'VOID PROTOCOL',
    organizer: 'BLACKOUT',
    date: '22/11',
    time: '01:00h',
    location: 'GÓTICO',
    style: 'INDUSTRIAL',
    price: '18€',
    image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80',
    tags: ['DARK', 'FAST']
  }
];

const EventsGrid = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl text-white font-display font-black uppercase italic tracking-wider flex items-center gap-3">
          <span className="w-2 h-2 bg-accent shadow-[0_0_10px_var(--color-accent)] animate-pulse"></span>
          Próximos Eventos
        </h2>
        <span className="text-[#666] font-mono text-xs tracking-widest">{MOCK_EVENTS.length} RESULTADOS</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_EVENTS.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsGrid;
