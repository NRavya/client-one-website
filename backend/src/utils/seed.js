const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const productsFile = path.join(__dirname, '../../../src/data/products.json');
  // fallback to backend local copy if exists
  const alt = path.join(__dirname, '../../prisma/products.json');
  const file = fs.existsSync(productsFile) ? productsFile : alt;
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of products) {
    const image = Array.isArray(p.images) ? p.images[0] : (p.image || null);
    const data = { slug: p.slug, name: p.name, description: p.description || p.shortDescription || '', price: p.price, stock: p.stock ?? 100, image, category: p.category, type: p.type, badge: p.badge || null, active: true };
    await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: data });
  }
  console.log(`Seeded ${products.length} products`);
  // seed admin & customer
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eskraft.in' }, update: {},
    create: { name: 'Admin', email: 'admin@eskraft.in', phone: '9999999999', password: adminPass, role: 'ADMIN', customer: { create: { name: 'Admin', email: 'admin@eskraft.in', phone: '9999999999' } } }
  });
  const custPass = await bcrypt.hash('Customer@123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@test.com' }, update: {},
    create: { name: 'Test Customer', email: 'customer@test.com', phone: '8888888888', password: custPass, role: 'CUSTOMER', customer: { create: { name: 'Test Customer', email: 'customer@test.com', phone: '8888888888', address: 'Test Address' } } }
  });
  console.log('Seeded admin (admin@eskraft.in / Admin@123) and customer (customer@test.com / Customer@123)');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(async()=>await prisma.$disconnect());
