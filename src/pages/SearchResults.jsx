import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { trackPixelEvent } from '../utils/metaPixel';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  const results = query
    ? productsData.filter((p) =>
        [p.name, p.category, p.type, p.shortDescription, ...(p.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : [];

  const handleChange = (e) => {
    const params = new URLSearchParams();
    const value = e.target.value.trim();
    if (value) params.set('q', value);
    navigate(params.toString() ? `/search?${params}` : '/search', { replace: true });
  };

  // Fires once per submitted query (effect depends on `query`, not keystrokes).
  useEffect(() => {
    if (query) {
      trackPixelEvent('Search', { search_string: query });
    }
  }, [query]);

  return (
    <div className="container section">
      <h1 className="text-4xl font-black mb-2">
        {query ? `SEARCH: "${query}"` : 'SEARCH'}
      </h1>
      {query && (
        <p className="text-gray mb-8" style={{ textTransform: 'none', fontWeight: 400 }}>
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </p>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-sm" style={{ maxWidth: '560px', marginBottom: '3rem' }}>
        <input
          key={query}
          defaultValue={query}
          onChange={handleChange}
          placeholder="Search frames, stands, keychains…"
          aria-label="Search products"
          className="input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn">SEARCH</button>
      </form>

      {query && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <p className="text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>
          No matches. Try "frame", "anime", or check out{' '}
          <Link to="/category/all" style={{ textDecoration: 'underline' }}>all products</Link>.
        </p>
      )}
    </div>
  );
};

export default SearchResults;
