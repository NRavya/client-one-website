const fs = require('fs');
const productsFile = 'e:\\\\project - client 01\\\\src\\\\data\\\\products.json';
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

const nameUpdates = {
  'odyssey-the-odyssey': 'Odysseyus | The Odyssey',
  'achilles-the-odyssey': 'Achilles | The Odyssey',
  'the-odyssey-the-odyssey-01': 'The Odyssey | The Odyssey',

  'peacock': 'Peacock',
  'jaguar': 'Jaguar',
  'japanese-quote-1': 'Japanese Quotes 1',
  'zen-temple-frame-2': 'Zen Temple Frame 2',
  'zen-temple-frame': 'Zen Temple Frame',

  'one-piece-1': 'Anime – One Piece – 1',
  'one-piece': 'Anime – One Piece – 2',
  'jujutsu-kaisen-1': 'Anime – Jujutsu Kaisen – 1',
  'jujutsu-kaisen-2': 'Anime – Jujutsu Kaisen – 2',
  'demon-slayer-1': 'Anime – Demon Slayer 1',
  'demon-slayer-2': 'Anime – Demon Slayer 2',

  'hibiscus': 'Hibiscus',
  'rose': 'Rose',
  'flower-dog': 'Flower Dog',
  'coolers-dog': 'Coolers Dog',
  'sitting-cat-2': 'Sitting Cat-2',
  'sitting-cat': 'Sitting Cat',
  'doodle-cat': 'Doodle Cat',
  'flower-cat': 'Flower Cat',

  'music-is-my-drug': 'Music is my Drug',
  'consistency': 'Consistency',
  'can-t-rush-greatness': "Can't Rush Greatness",
  'staying-delulu-is-the-solulu': 'Delulu is the solulu',
  'original': 'Original',
  'no-risk-no-story': 'No Risk. No Story.',
  'main-character-energy': 'Main Character Energy',
  'ew-people': 'Eww... People.',
  'dreamcatcher': 'Dreamcatcher',
  'dream-it-believe-it-achieve-it-': 'Dream it! Believe it! Achieve it!',
  'chill': 'CHILL',
  'it-s-just-a-bad-day-not-a-bad-life': "It's just a bad day, not a bad life",

  '2010-year-engraved': '2010 Year Engraved',
  '2009-year-engraved': '2009 Year Engraved',
  '2008-year-engraved': '2008 Year Engraved',
  '2007-year-engraved': '2007 Year Engraved',
  '2006-year-engraved': '2006 Year Engraved',
  '2005-year-engraved': '2005 Year Engraved',
  '2004-year-engraved': '2004 Year Engraved',
  '2003-year-engraved': '2003 Year Engraved',
  '2002-year-engraved': '2002 Year Engraved',
  '2001-year-engraved': '2001 Year Engraved',
  '2000-year-engraved': '2000 Year Engraved'
};

products.forEach(p => {
  if (nameUpdates[p.slug]) {
    p.name = nameUpdates[p.slug];
  }
});

fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
console.log('Product names updated successfully!');
