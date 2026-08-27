import React, { useState } from 'react';
import InfoPage from '../components/InfoPage';
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <InfoPage title="Message Sent" subtitle="Thanks for reaching out — we'll get back to you within 24 hours.">
        <button type="button" className="btn btn-outline" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
          SEND ANOTHER MESSAGE
        </button>
      </InfoPage>
    );
  }

  const inputStyle = { width: '100%', padding: '0.9rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem', backgroundColor: 'var(--color-bg)' };

  return (
    <InfoPage title="Contact Us" subtitle="Questions about a product, an order, or a custom idea? Talk to us.">
      <div className="flex flex-wrap gap-md">
        <div className="flex flex-col gap-sm text-sm" style={{ minWidth: '220px', color: 'var(--color-gray)' }}>
          <span className="flex items-center gap-xs"><Mail size={16} /> eskraft135@gmail.com</span>
          <span className="flex items-center gap-xs"><MessageCircle size={16} /> WhatsApp: +91 89397 75500</span>
          <span className="flex items-center gap-xs"><MapPin size={16} /> No.13 Reddypalayam Street West -Mogappair Chennai-600037</span>
          <span className="flex items-center gap-xs"><Clock size={16} /> Mon–Sat, 10 AM – 7 PM IST</span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-sm" style={{ flex: 1, minWidth: '280px' }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className="input w-full" style={inputStyle} />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Your email" required style={inputStyle} />
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="How can we help?" required rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
          <button type="submit" className="btn">SEND MESSAGE</button>
        </form>
      </div>
    </InfoPage>
  );
};

export default Contact;
