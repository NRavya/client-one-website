export function withPhoneStandNumbering(products) {
  const counts = {};
  const totals = {};
  products.forEach(p => {
    if (p.category === 'Anime Phone Stand') totals[p.product_name.replace(/ \d+$/, '')] = (totals[p.product_name.replace(/ \d+$/, '')]||0)+1;
  });
  // Actually just ensure sequential numbering based on current file already numbered; for new products, caller can use getNextName
  return products;
}
export function getPhoneStandDisplayName(product, allProducts) {
  // If Phone Stand and duplicate base, name already includes number in data; just return it
  return product.product_name || product.name;
}
