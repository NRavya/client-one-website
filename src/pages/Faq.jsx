import React, { useState } from 'react';
import InfoPage from '../components/InfoPage';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What materials do you use?',
    a: 'All our products are crafted from Teak wood, laser-cut and hand-finished. Every piece is inspected before it ships.',
  },
  {
    q: 'Do you use Teak Wood?',
    a: 'Yes, all our products are made from Teak wood. Each piece is laser-cut and hand-finished with care.',
  },
  {
    q: 'Do you take custom orders?',
    a: 'Yes — names, logos, anime art, photo frames, you name it. Head to the Custom Orders page and tell us what you have in mind.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard orders ship in 3–5 business days. Custom pieces take 7–10 days since they are made just for you.',
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes, verified COD is available across India. For orders above ₹999 we confirm the order on call/WhatsApp before dispatch.',
  },
  {
    q: 'Can I return a personalized item?',
    a: 'Personalized items can only be returned if they arrive damaged or defective. Everything else can be returned within 7 days.',
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <InfoPage title="FAQ" subtitle="Quick answers to the questions we get most.">
      <div className="flex flex-col gap-sm">
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="flex items-center justify-between w-full"
              style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
            >
              {faq.q}
              <ChevronDown size={20} style={{ transform: openIndex === i ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)', flexShrink: 0 }} />
            </button>
            {openIndex === i && (
              <p style={{ padding: '0 1.25rem 1.25rem', color: 'var(--color-gray)', textTransform: 'none', fontWeight: 400 }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </InfoPage>
  );
};

export default Faq;
