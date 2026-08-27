import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, Star } from 'lucide-react';

const values = [
  {
    icon: <Heart size={36} />,
    title: 'MADE BY HAND, MADE WITH LOVE',
    desc: 'Every piece is designed in-house and finished by hand. No mass production, no shortcuts.',
  },
  {
    icon: <Package size={36} />,
    title: 'SMALL BATCHES ONLY',
    desc: 'We drop limited runs so every product stays special. When it sells out, it is gone.',
  },
  {
    icon: <Star size={36} />,
    title: 'BUILT FOR YOU',
    desc: 'From anime fans to gift hunters — our pieces are made to feel personal, not generic.',
  },
];

const About = () => (
  <div>
    <section style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', padding: '6rem 0' }}>
      <div className="container flex flex-col items-center text-center gap-md">
        <span className="text-sm font-bold" style={{ letterSpacing: '0.1em', color: 'var(--color-wood-light)' }}>THE STORY BEHIND THE WOOD</span>
        <h1 className="text-5xl font-black">ABOUT ESKRAFT</h1>
        <p className="text-lg" style={{ maxWidth: '640px', opacity: 0.8, textTransform: 'none', fontWeight: 400 }}>
          We started ESKRAFT with one laser cutter and one belief: everyday objects should have personality.
          Today we handcraft frames, stands and personalized wooden pieces for people who refuse to own boring things.
        </p>
      </div>
    </section>

    <section className="section container">
      <h2 className="text-4xl font-black text-center mb-8">WHAT WE STAND FOR</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {values.map((v) => (
          <div key={v.title} className="flex flex-col items-center text-center gap-sm" style={{ padding: '3rem 2rem', backgroundColor: '#F5F3ED', borderRadius: '12px' }}>
            <div style={{ color: 'var(--color-wood-dark)' }}>{v.icon}</div>
            <h3 className="text-lg font-bold">{v.title}</h3>
            <p className="text-sm text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section container text-center">
      <h2 className="text-4xl font-black mb-2">WANT SOMETHING THAT'S YOURS ONLY?</h2>
      <p className="text-gray mb-8" style={{ textTransform: 'none', fontWeight: 400 }}>
        We turn your ideas into engraved, cut and polished reality.
      </p>
      <Link to="/custom-orders" className="btn btn-accent">START A CUSTOM ORDER</Link>
    </section>
  </div>
);

export default About;
