import React, { useState, useRef } from 'react';
import { Sparkles, Ruler, Palette, Gift, Check, ImagePlus, X } from 'lucide-react';

const steps = [
  { icon: <Sparkles size={28} />, title: '1. Share Your Idea', desc: 'Tell us what you want — a name, a design, an anime scene, anything.' },
  { icon: <Palette size={28} />, title: '2. We Design It', desc: 'We send you a design preview on WhatsApp within 24 hours.' },
  { icon: <Ruler size={28} />, title: '3. Approve & Confirm', desc: 'Happy with the preview? Confirm and we start cutting.' },
  { icon: <Gift size={28} />, title: '4. Crafted & Shipped', desc: 'Your custom piece is handcrafted and shipped in 7–10 days.' },
];

const productTypes = ['Custom Keychain', 'Frame - 9x12 inches', 'Frame - 15x20 inches', 'Frame - 18x24 inches', 'Phone Stand', 'Something Else'];

const pricing = {
  'Custom Keychain': { price: 150, note: 'Custom engraved name keychain' },
  'Frame - 9x12 inches': { price: 1000, note: 'Handcrafted laser-engraved frame - 9x12 inches' },
  'Frame - 15x20 inches': { price: 1600, note: 'Handcrafted laser-engraved frame - 15x20 inches' },
  'Frame - 18x24 inches': { price: 2200, note: 'Handcrafted laser-engraved frame - 18x24 inches' },
  'Phone Stand': { price: 200, note: 'Personalized phone stand' },
  'Something Else': { price: null, note: 'We will quote based on your idea' },
};

const inputStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  backgroundColor: 'var(--color-bg)',
};

const CustomOrders = () => {
  const [form, setForm] = useState({ name: '', contact: '', type: productTypes[0], details: '' });
  const [sent, setSent] = useState(false);
  const [refImages, setRefImages] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const next = [...refImages, ...valid].slice(0, 3);
    setRefImages(next);
  };

  const removeImage = (idx) => setRefImages(refImages.filter((_, i) => i !== idx));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try{
      const arr=JSON.parse(localStorage.getItem('eskraft-custom-orders')||'[]');
      arr.unshift({id:`CR-${Date.now().toString().slice(-6)}`,name:form.name,contact:form.contact,type:form.type,details:form.details,refs:refImages.length,createdAt:new Date().toISOString(),status:'pending'});
      localStorage.setItem('eskraft-custom-orders',JSON.stringify(arr));
    }catch{}
    setSent(true);
  };

  return (
    <div>
      <section style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', padding: '6rem 0' }}>
        <div className="container flex flex-col items-center text-center gap-md">
          <span className="text-sm font-bold" style={{ letterSpacing: '0.1em', color: 'var(--color-wood-light)' }}>IF YOU CAN DREAM IT, WE CAN MAKE IT.</span>
          <h1 className="text-5xl font-black">CUSTOM ORDERS</h1>
          <p className="text-lg" style={{ maxWidth: '600px', opacity: 0.8, textTransform: 'none', fontWeight: 400 }}>
            Personalized wooden pieces made exactly how you want them — engraved names, delightful keychains, photo frames and more.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2 className="text-4xl font-black text-center mb-8">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center gap-sm" style={{ padding: '2rem', backgroundColor: '#F5F3ED', borderRadius: '12px' }}>
              <div style={{ color: 'var(--color-wood-dark)' }}>{step.icon}</div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" style={{ maxWidth: '720px' }}>
        <h2 className="text-4xl font-black mb-2 text-center">START YOUR ORDER</h2>
        <p className="text-center text-gray mb-8" style={{ textTransform: 'none', fontWeight: 400 }}>
          Fill this in and we'll WhatsApp you a free design preview.
        </p>

        {sent ? (
          <div className="flex flex-col items-center text-center gap-md" style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '4rem 2rem' }}>
            <Check size={48} color="var(--color-accent)" />
            <h3 className="text-2xl font-black">REQUEST RECEIVED</h3>
            <p className="text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>
              We've got your idea for a <strong>{form.type}</strong>. Expect our design preview within 24 hours.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setSent(false); setForm({ name: '', contact: '', type: productTypes[0], details: '' }); setRefImages([]); }}
            >
              SUBMIT ANOTHER REQUEST
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            <label className="font-bold text-sm" htmlFor="co-name">YOUR NAME</label>
            <input id="co-name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Nithin" style={inputStyle} />

            <label className="font-bold text-sm" htmlFor="co-contact">WHATSAPP NUMBER OR EMAIL</label>
            <input id="co-contact" name="contact" value={form.contact} onChange={handleChange} required placeholder="So we can send your preview" style={inputStyle} />

            <label className="font-bold text-sm" htmlFor="co-type">WHAT DO YOU WANT MADE?</label>
            <select id="co-type" name="type" value={form.type} onChange={handleChange} style={inputStyle}>
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Live Price Badge */}
            {(() => {
              const p = pricing[form.type];
              return (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#F5F3ED',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ flex: 1 }}>
                    <p className="text-xs font-bold" style={{ letterSpacing: '0.08em', color: 'var(--color-wood-dark)', marginBottom: '0.15rem' }}>STARTING PRICE</p>
                    <p className="text-sm" style={{ color: 'var(--color-gray)', textTransform: 'none', fontWeight: 400 }}>{p.note}</p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    color: 'var(--color-wood-dark)',
                    whiteSpace: 'nowrap',
                  }}>
                    {p.price ? `₹${p.price}` : 'Get a Quote'}
                  </span>
                </div>
              );
            })()}

            <label className="font-bold text-sm" htmlFor="co-details">DESCRIBE YOUR IDEA</label>
            <textarea
              id="co-details"
              name="details"
              value={form.details}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Text to engrave, colors, size, links to reference images — anything that helps."
              style={{ ...inputStyle, resize: 'vertical' }}
            />

            {/* Reference Image Upload */}
            <div>
              <label className="font-bold text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>REFERENCE IMAGES <span style={{ fontWeight: 400, color: 'var(--color-gray)', textTransform: 'none' }}>(optional · up to 3)</span></label>

              {/* Drop Zone */}
              <div
                onClick={() => refImages.length < 3 && fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragging ? 'var(--color-wood-dark)' : 'var(--color-border)'}`,
                  borderRadius: '12px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  cursor: refImages.length < 3 ? 'pointer' : 'default',
                  backgroundColor: dragging ? 'rgba(74,50,34,0.04)' : '#F5F3ED',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  opacity: refImages.length >= 3 ? 0.5 : 1,
                }}
              >
                <ImagePlus size={32} color="var(--color-wood-light)" style={{ margin: '0 auto 0.75rem' }} />
                <p className="text-sm font-bold" style={{ marginBottom: '0.25rem' }}>Drag &amp; drop or click to upload</p>
                <p className="text-xs text-gray" style={{ textTransform: 'none' }}>JPG, PNG, WEBP — helps us match your vision exactly</p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />

              {/* Previews */}
              {refImages.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {refImages.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Reference ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          background: 'rgba(0,0,0,0.6)', border: 'none',
                          borderRadius: '50%', width: '22px', height: '22px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff', padding: 0,
                        }}
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-accent" style={{ marginTop: '1rem' }}>SEND MY REQUEST</button>
          </form>
        )}
      </section>
    </div>
  );
};

export default CustomOrders;
