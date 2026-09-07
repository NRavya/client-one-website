import React from 'react';
import { Link } from 'react-router-dom';

const WhyNoCod = () => {
  return (
    <div className="container section" style={{ maxWidth: '760px', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p
          style={{
            display: 'inline-block',
            background: '#FFF6E8',
            border: '1px solid #F0D9B5',
            color: '#8B6A2E',
            fontSize: '0.70rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            borderRadius: 999,
            marginBottom: '1rem',
          }}
        >
          A note from our small studio 💛
        </p>
        <h1
          className="font-heading"
          style={{
            fontWeight: 900,
            fontSize: 'clamp(1.9rem, 4.5vw, 2.75rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            color: '#111111',
          }}
        >
          Why We Don&apos;t Offer
          <br />
          Cash on Delivery 💛
        </h1>
        <p
          style={{
            marginTop: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#6B5A3A',
            letterSpacing: '0.02em',
          }}
        >
          A note from ESKraft
        </p>
        <div
          style={{
            width: 72,
            height: 3,
            background: '#111111',
            margin: '1.25rem auto 0',
            borderRadius: 999,
            opacity: 0.9,
          }}
        />
      </div>

      {/* Main warm card */}
      <article
        style={{
          background: '#FFFBF5',
          border: '1px solid #F0E6D8',
          borderRadius: 20,
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 8px 30px rgba(17,17,17,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem',
          lineHeight: 1.85,
          color: '#2B2216',
          fontSize: '0.98rem',
        }}
      >
        {/* Intro empathy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ color: '#3A2E1F' }}>
            We know that Cash on Delivery can feel more convenient.
          </p>
          <p style={{ color: '#3A2E1F' }}>
            You get your order first, see the product, and then pay.
          </p>
          <p style={{ color: '#3A2E1F' }}>
            We completely understand why many customers prefer it.
          </p>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F0E6D8',
            borderLeft: '4px solid #111111',
            borderRadius: 12,
            padding: '1.1rem 1.25rem',
            margin: '0.25rem 0',
          }}
        >
          <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111111', lineHeight: 1.5 }}>
            So you might be wondering:
          </p>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.15rem',
              color: '#111111',
              marginTop: '0.25rem',
            }}
          >
            “Why doesn&apos;t ESKraft offer COD?”
          </p>
          <p style={{ marginTop: '0.65rem', color: '#3A2E1F', fontWeight: 600 }}>
            The simple answer is: we&apos;re still a business, and COD is a risk we currently cannot afford.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p>Behind every order you place with us, there is more happening than what you see.</p>
          <p>
            When a COD order is shipped, we still have to pay the courier charges upfront to send your
            package to you.
          </p>
          <p>
            If the order isn&apos;t accepted or delivered, the package has to travel all the way back to us.
            Which means we can end up paying delivery charges again for the return.
          </p>
          <p>For a business like ours, these costs add up very quickly.</p>
        </div>

        <div
          style={{
            background: '#FFF3CD',
            border: '1px solid #EED9A0',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: 2 }}>📦</span>
          <p style={{ fontSize: '0.93rem', color: '#5A4400', lineHeight: 1.7, margin: 0 }}>
            Our courier team at <strong>DTDC</strong> has also shared with us that COD orders can have a higher
            rate of returns compared with prepaid orders. When a package comes back, we don&apos;t just lose a
            sale. We lose the money spent on shipping it and bringing it back.
          </p>
        </div>

        <p>Unlike a large company, we don&apos;t have a huge margin or a massive budget to absorb those losses.</p>

        {/* Emphasis block */}
        <div
          style={{
            textAlign: 'center',
            padding: '1.1rem 1rem',
            background: '#111111',
            color: '#FFFFFF',
            borderRadius: 14,
            margin: '0.35rem 0',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            We&apos;re not a big company.
            <br />
            <span style={{ color: '#FFD978' }}>We&apos;re growing.</span>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p>Every product you see on ESKraft is part of a journey we&apos;re building step by step.</p>
          <p>When you place an order with us, you&apos;re not just buying a craft.</p>
          <p style={{ fontWeight: 700, color: '#111111' }}>You&apos;re supporting a dream.</p>
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
          }}
        >
          {[
            'You’re helping us buy materials.',
            'You’re helping us create new designs.',
            'You’re helping us improve our packaging.',
            'You’re helping us reach more people.',
          ].map((t) => (
            <li
              key={t}
              style={{
                display: 'flex',
                gap: '0.7rem',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '1px solid #F0E6D8',
                borderRadius: 999,
                padding: '0.65rem 1rem',
                fontSize: '0.93rem',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: '#111111',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              {t}
            </li>
          ))}
          <li
            style={{
              display: 'flex',
              gap: '0.7rem',
              alignItems: 'center',
              background: '#FFF6E8',
              border: '1px solid #F0D9B5',
              borderRadius: 999,
              padding: '0.65rem 1rem',
              fontSize: '0.93rem',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: '#D1A54A',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                flexShrink: 0,
              }}
            >
              ♥
            </span>
            Most importantly, you&apos;re helping ESKraft continue to exist and grow.
          </li>
        </ul>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #111111',
            borderRadius: 12,
            padding: '1.15rem 1.25rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 800, color: '#111111', fontSize: '1rem' }}>
            That&apos;s why, for now, we have made the decision to keep our store{' '}
            <span style={{ background: '#111111', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>
              prepaid only
            </span>
            .
          </p>
          <p style={{ marginTop: '0.65rem', color: '#5A4A32', fontSize: '0.92rem', lineHeight: 1.7 }}>
            We know this may not be everyone&apos;s preferred option. We&apos;re genuinely sorry if it makes
            ordering less convenient.
          </p>
          <p style={{ marginTop: '0.4rem', color: '#5A4A32', fontSize: '0.92rem' }}>
            We&apos;d rather be honest with you than hide behind a complicated explanation.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.15rem',
              color: '#111111',
            }}
          >
            Who knows?
          </p>
          <p>Maybe one day, as ESKraft grows, we&apos;ll be able to offer COD.</p>
          <p>It is definitely something we want to consider in the future.</p>
          <p style={{ fontWeight: 600 }}>For now, every prepaid order gives us a little confidence to keep going.</p>
        </div>

        <div
          style={{
            borderTop: '1px dashed #E8DCCA',
            borderBottom: '1px dashed #E8DCCA',
            padding: '1.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 800, color: '#111111' }}>So if you&apos;ve ever placed an order with us:</p>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.35rem',
              color: '#C0392B',
            }}
          >
            Thank you. ❤️
          </p>
          <p style={{ color: '#5A4A32', fontSize: '0.95rem', lineHeight: 1.75 }}>
            If you&apos;ve supported us by sharing our page, recommending us to a friend, liking a post, or
            simply taking the time to look at our creations.
          </p>
          <p style={{ fontWeight: 800, color: '#111111', fontSize: '1.05rem' }}>Thank you.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
          <p>Small businesses don&apos;t grow overnight.</p>
          <p style={{ fontWeight: 700 }}>They grow because people choose to believe in them.</p>
          <p>Every order, no matter how small, means more to us than you might realize.</p>
        </div>

        <div
          style={{
            background: '#FFF6E8',
            border: '1px solid #F0D9B5',
            borderRadius: 14,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 700, color: '#6B5A3A' }}>Thank you for understanding.</p>
          <p style={{ fontWeight: 700, color: '#6B5A3A' }}>Thank you for supporting small.</p>
          <p style={{ fontWeight: 700, color: '#6B5A3A' }}>Thank you for supporting handmade.</p>
          <p style={{ fontWeight: 800, color: '#111111', marginTop: '0.25rem' }}>
            Thank you for being a part of the ESKraft journey.
          </p>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              letterSpacing: '0.08em',
              fontSize: '1.25rem',
              color: '#111111',
            }}
          >
            ESKraft
          </p>
          <p
            style={{
              fontStyle: 'italic',
              color: '#8B6A4A',
              marginTop: '0.25rem',
              fontSize: '0.95rem',
            }}
          >
            Crafting joy, one piece, at a time. ❤️
          </p>
        </div>
      </article>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.75rem' }}>
        <Link to="/category/all" className="btn" style={{ borderRadius: 999, padding: '0.9rem 1.6rem', fontSize: '0.85rem' }}>
          Explore Collection
        </Link>
        <Link
          to="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.9rem 1.6rem',
            borderRadius: 999,
            border: '1px solid #111111',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: '#fff',
            color: '#111111',
          }}
        >
          Contact Us
        </Link>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#9A8A6E' }}>
        Have questions about prepaid payment? We&apos;re always happy to help on{' '}
        <a href="mailto:eskraft135@gmail.com" style={{ textDecoration: 'underline', color: '#111' }}>
          eskraft135@gmail.com
        </a>{' '}
        or WhatsApp +91 89397 75500.
      </p>
    </div>
  );
};

export default WhyNoCod;
