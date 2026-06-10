const products = [
  // ── OIL PERFUMES ──────────────────────────────────────────────
  {
    id: 1,
    name: "Oud Royale",
    category: "oil",
    price: 8500,
    size: "12ml",
    description: "Deep, smoky agarwood blended with amber and musk. A regal scent that commands presence.",
    notes: { top: "Oud, Smoke", mid: "Amber, Sandalwood", base: "Musk, Vetiver" },
    badge: "Bestseller",
    stock: 50
  },
  {
    id: 2,
    name: "Rose Taif",
    category: "oil",
    price: 7200,
    size: "12ml",
    description: "The legendary rose of Taif, pure and intoxicating, layered with soft white musk.",
    notes: { top: "Rose Petals", mid: "Jasmine, Geranium", base: "White Musk, Sandalwood" },
    badge: "New",
    stock: 40
  },
  {
    id: 3,
    name: "Amber Noir",
    category: "oil",
    price: 6500,
    size: "12ml",
    description: "Rich golden amber warmed by vanilla and spice. Sensual and long-lasting.",
    notes: { top: "Bergamot, Cardamom", mid: "Amber, Benzoin", base: "Vanilla, Labdanum" },
    badge: null,
    stock: 35
  },
  {
    id: 4,
    name: "Musk Al Tahara",
    category: "oil",
    price: 5500,
    size: "12ml",
    description: "The classic pure white musk — clean, soft, and skin-like. Perfect for daily wear.",
    notes: { top: "Clean Musk", mid: "White Flowers", base: "Sandalwood, Musk" },
    badge: "Bestseller",
    stock: 60
  },
  {
    id: 5,
    name: "Black Saffron",
    category: "oil",
    price: 9500,
    size: "12ml",
    description: "Precious saffron threads steeped in dark oud and leather. Bold and mysterious.",
    notes: { top: "Saffron, Pepper", mid: "Leather, Oud", base: "Patchouli, Incense" },
    badge: "Premium",
    stock: 25
  },
  {
    id: 6,
    name: "Jasmine Nights",
    category: "oil",
    price: 6000,
    size: "12ml",
    description: "Heady Egyptian jasmine blooming at dusk over a warm musky base.",
    notes: { top: "Jasmine, Neroli", mid: "Tuberose, Ylang-Ylang", base: "Musk, Cedarwood" },
    badge: null,
    stock: 45
  },
  {
    id: 7,
    name: "Frankincense & Gold",
    category: "oil",
    price: 7800,
    size: "12ml",
    description: "Sacred Omani frankincense crystallized into a warm, resinous oil perfume.",
    notes: { top: "Frankincense, Citrus", mid: "Myrrh, Benzoin", base: "Amber, Vanilla" },
    badge: null,
    stock: 30
  },
  {
    id: 8,
    name: "Velvet Tobacco",
    category: "oil",
    price: 8000,
    size: "12ml",
    description: "Honeyed tobacco swirled with dark rum and leather. Sophisticated and complex.",
    notes: { top: "Rum, Bergamot", mid: "Tobacco, Honey", base: "Leather, Vanilla" },
    badge: "New",
    stock: 20
  },

  // ── MINIATURES ────────────────────────────────────────────────
  {
    id: 9,
    name: "Oud Royale Mini",
    category: "miniature",
    price: 2500,
    size: "3ml",
    description: "Our flagship Oud Royale in a travel-perfect 3ml roller bottle.",
    notes: { top: "Oud, Smoke", mid: "Amber, Sandalwood", base: "Musk, Vetiver" },
    badge: "Travel Size",
    stock: 80
  },
  {
    id: 10,
    name: "Rose Taif Mini",
    category: "miniature",
    price: 2000,
    size: "3ml",
    description: "The full magic of Rose Taif in a tiny, purse-friendly bottle.",
    notes: { top: "Rose Petals", mid: "Jasmine, Geranium", base: "White Musk, Sandalwood" },
    badge: "Travel Size",
    stock: 70
  },
  {
    id: 11,
    name: "Discovery Set A",
    category: "miniature",
    price: 8000,
    size: "5 × 2ml",
    description: "Try five of our bestselling oils: Oud Royale, Rose Taif, Musk Al Tahara, Amber Noir & Black Saffron.",
    notes: { top: "Various", mid: "Various", base: "Various" },
    badge: "Gift Set",
    stock: 30
  },
  {
    id: 12,
    name: "Musk Trio",
    category: "miniature",
    price: 5500,
    size: "3 × 2ml",
    description: "Three musk expressions: White Musk, Black Musk, and Rose Musk — a trilogy of softness.",
    notes: { top: "Musk Variations", mid: "Soft Florals", base: "Sandalwood, Vanilla" },
    badge: "Gift Set",
    stock: 25
  },
  {
    id: 13,
    name: "Amber Noir Mini",
    category: "miniature",
    price: 1800,
    size: "3ml",
    description: "Golden amber and vanilla warmth in a 3ml travel roller.",
    notes: { top: "Bergamot, Cardamom", mid: "Amber, Benzoin", base: "Vanilla, Labdanum" },
    badge: "Travel Size",
    stock: 55
  },
  {
    id: 14,
    name: "Oud & Saffron Mini",
    category: "miniature",
    price: 3000,
    size: "3ml",
    description: "A 3ml sample of our luxurious Black Saffron blend for the bold at heart.",
    notes: { top: "Saffron, Pepper", mid: "Leather, Oud", base: "Patchouli, Incense" },
    badge: "Travel Size",
    stock: 40
  },
  {
    id: 15,
    name: "Bridal Collection",
    category: "miniature",
    price: 12000,
    size: "6 × 2ml",
    description: "Six romantic florals and musks curated for the most special moments.",
    notes: { top: "Rose, Jasmine, Neroli", mid: "Tuberose, Oud Rose", base: "White Musk, Sandalwood" },
    badge: "Limited",
    stock: 15
  },
  {
    id: 16,
    name: "Frankincense Mini",
    category: "miniature",
    price: 2200,
    size: "3ml",
    description: "Sacred Omani frankincense in a convenient 3ml pocket bottle.",
    notes: { top: "Frankincense, Citrus", mid: "Myrrh, Benzoin", base: "Amber, Vanilla" },
    badge: "Travel Size",
    stock: 50
  }
];

module.exports = products;
