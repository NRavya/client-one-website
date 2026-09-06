import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';

const categoryMap = {
  'all': { title: 'ALL PRODUCTS', filter: () => true },
  'frames': { title: 'FRAMES', filter: (p) => p.category === 'Frames' },
  'anime-phone-stands': { title: 'ANIME PHONE STANDS', filter: (p) => p.category === 'Anime Phone Stand' },
  'engraved-crafts': { title: 'ENGRAVED WOODEN CRAFTS', filter: (p) => p.category === 'Engraved Wooden Crafts' },
  'dog-tag-keychains': { title: 'DOG TAG KEYCHAINS', filter: (p) => p.category === 'Dog Tag Keychain' },
  'engraved-dates': { title: 'ENGRAVED DATES', filter: (p) => p.category === 'Engraved Dates' },
  'new-drops': { title: 'NEW DROPS', filter: () => false },
  'bestsellers': { title: 'BESTSELLERS', filter: (p) => p.isBestseller },
  /* legacy aliases */
  'the-odyssey': { title: 'FRAMES', filter: (p) => p.category === 'Frames' },
  'anime-corner': { title: 'ANIME PHONE STANDS', filter: (p) => p.category === 'Anime Phone Stand' },
};

const filters = [
  { label: 'All', slug: 'all' },
  { label: 'New Drops', slug: 'new-drops' },
  { label: 'Frames', slug: 'frames' },
  { label: 'Phone Stands', slug: 'anime-phone-stands' },
  { label: 'Engraved Crafts', slug: 'engraved-crafts' },
  { label: 'Dog Tags', slug: 'dog-tag-keychains' },
  { label: 'Engraved Dates', slug: 'engraved-dates' },
];

const Category = () => {
  const { category = 'all' } = useParams();
  const active = categoryMap[category] || categoryMap['all'];
  const items = productsData.filter(active.filter);

  return (
    <div className="container section">
      <h1 className="text-5xl font-black mb-2">{active.title}</h1>
      <p className="text-gray mb-8" style={{ textTransform: 'none', fontWeight: 400 }}>
        {items.length} {items.length === 1 ? 'piece' : 'pieces'} in this collection
      </p>

      <div className="flex flex-wrap gap-sm mb-8">
        {filters.map((f) => (
          <Link
            key={f.slug}
            to={`/category/${f.slug}`}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: `1px solid ${f.slug === category ? 'var(--color-text)' : 'var(--color-border)'}`,
              backgroundColor: f.slug === category ? 'var(--color-text)' : 'transparent',
              color: f.slug === category ? 'var(--color-bg)' : 'var(--color-text)',
              opacity: f.slug === category ? 1 : 0.7,
            }}
          >
            {f.label.toUpperCase()}
          </Link>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} showCode />
          ))}
        </div>
      ) : (
        <p className="text-gray text-center section">Nothing here yet — new drops land every month.</p>
      )}
    </div>
  );
};

export default Category;
