import { Product, Category, UserProfile } from '../types/shop.types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: '⚡' },
  { id: 'mobile-phones', name: 'Mobile Phones', icon: '📱' },
  { id: 'computers', name: 'Computers', icon: '💻' },
  { id: 'home-appliances', name: 'Home Appliances', icon: '🏠' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'groceries', name: 'Groceries', icon: '🍎' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'books', name: 'Books', icon: '📚' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'SKU-ELE-001',
    name: 'AcousticMax Noise Cancelling Headphones',
    brand: 'SonicWave',
    category: 'electronics',
    description: 'Experience pure sound with SonicWave AcousticMax headphones. Featuring hybrid active noise cancellation, smart ambient sound mode, and up to 40 hours of battery life.',
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    reviewCount: 154,
    stock: 25,
    specifications: {
      'Type': 'Over-Ear',
      'Connectivity': 'Bluetooth 5.2, 3.5mm Jack',
      'Battery Life': 'Up to 40 hours (ANC Off)',
      'Charging Port': 'USB-C',
      'Weight': '250g'
    },
    tags: ['wireless', 'anc', 'premium', 'audio'],
    isFeatured: true
  },
  {
    id: 'SKU-MOB-001',
    name: 'Vortex Phone X Pro',
    brand: 'Vortex',
    category: 'mobile-phones',
    description: 'The ultimate flagship smartphone with dynamic AMOLED 120Hz display, triple-lens 108MP main camera system, and ultra-fast 5G connectivity.',
    price: 899.99,
    originalPrice: 999.99,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.6,
    reviewCount: 382,
    stock: 15,
    specifications: {
      'Display': '6.7 inch AMOLED, 120Hz',
      'Processor': 'Octa-Core Octane 9',
      'RAM': '12GB',
      'Storage': '256GB UFS 3.1',
      'Rear Camera': '108MP + 12MP + 12MP',
      'Battery': '4500mAh with 65W Fast Charge'
    },
    tags: ['flagship', '5g', 'high-performance'],
    isBestSeller: true
  },
  {
    id: 'SKU-COM-001',
    name: 'Zenith Pro 14 Laptop',
    brand: 'Zenith',
    category: 'computers',
    description: 'Power your workflow with the Zenith Pro 14. Lightweight aluminum chassis containing high-powered processor, crisp Retina-level display, and efficient battery optimization.',
    price: 1299.99,
    originalPrice: 1499.99,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.9,
    reviewCount: 92,
    stock: 8,
    specifications: {
      'CPU': 'Intel Core i7 12th Gen',
      'RAM': '16GB DDR5',
      'Storage': '512GB NVMe SSD',
      'OS': 'Windows 11 Home',
      'Graphics': 'Intel Iris Xe',
      'Weight': '1.3 kg'
    },
    tags: ['work', 'creator', 'portable'],
    isFeatured: true
  },
  {
    id: 'SKU-HOM-001',
    name: 'SmartBrew Automatic Espresso Machine',
    brand: 'BaristaCorp',
    category: 'home-appliances',
    description: 'Bring the cafe experience to your home. Features precise PID temperature control, integrated grinder, and steam wand for perfect microfoam milk texturing.',
    price: 499.99,
    originalPrice: 599.99,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.7,
    reviewCount: 110,
    stock: 12,
    specifications: {
      'Pressure': '15 Bar Italian Pump',
      'Water Tank': '2.0 Liters',
      'Grinder': 'Conical Burr (30 settings)',
      'Housing': 'Stainless Steel',
      'Power': '1600W'
    },
    tags: ['coffee', 'kitchen', 'premium'],
    isTrending: true
  },
  {
    id: 'SKU-FAS-001',
    name: 'Urban Canvas Comfort Hoodie',
    brand: 'Canvas',
    category: 'fashion',
    description: 'Crafted from high-grade organic cotton fleece, our comfort hoodie offers a relaxed fit and premium warmth for everyday wear.',
    price: 45.00,
    originalPrice: 60.00,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.4,
    reviewCount: 423,
    stock: 80,
    specifications: {
      'Material': '85% Organic Cotton, 15% Polyester',
      'Fit': 'Relaxed Fit',
      'Care': 'Machine wash cold, tumble dry low',
      'Weight': '350 GSM'
    },
    tags: ['clothing', 'unisex', 'casual'],
    isTrending: true
  },
  {
    id: 'SKU-GRO-001',
    name: 'Organic Premium Arabica Coffee Beans',
    brand: 'EarthlyEat',
    category: 'groceries',
    description: 'Whole bean organic medium roast coffee sourced ethically from smallholder cooperatives in Central America.',
    price: 14.99,
    originalPrice: 17.99,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    reviewCount: 950,
    stock: 120,
    specifications: {
      'Roast': 'Medium Roast',
      'Weight': '1 lb (454g)',
      'Certifications': 'USDA Organic, Fair Trade'
    },
    tags: ['beverages', 'organic', 'vegan'],
    isBestSeller: true
  },
  {
    id: 'SKU-SPO-001',
    name: 'Nomad Carbon Fiber Hiking Poles',
    brand: 'NomadOutdoor',
    category: 'sports',
    description: 'Extremely strong, lightweight hiking poles made with 100% carbon fiber shafts, natural cork handles, and quick-lock extension clamps.',
    price: 79.99,
    originalPrice: 89.99,
    discount: 11,
    image: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.5,
    reviewCount: 88,
    stock: 32,
    specifications: {
      'Material': '100% Carbon Fiber',
      'Grip': 'Natural Cork with EVA Extensions',
      'Length': '62cm - 135cm',
      'Weight': '210g per pole'
    },
    tags: ['hiking', 'camping', 'gear'],
    isFeatured: false
  },
  {
    id: 'SKU-AUT-001',
    name: 'Smart OBD2 Car Diagnostic Scanner',
    brand: 'AutoLink',
    category: 'automotive',
    description: 'Diagnose your car\'s check engine light instantly via Bluetooth. View real-time sensor readouts, reset codes, and track fuel efficiency directly on your smartphone.',
    price: 34.99,
    originalPrice: 49.99,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.3,
    reviewCount: 167,
    stock: 45,
    specifications: {
      'Protocol': 'OBD2 / EOBD',
      'Connectivity': 'Bluetooth 4.0 / Android & iOS',
      'App Integration': 'AutoLink app (Free)',
      'Dimensions': '48mm x 25mm x 32mm'
    },
    tags: ['tools', 'diagnostics', 'smart-gadget'],
    isTrending: false
  },
  {
    id: 'SKU-BOK-001',
    name: 'The Art of Enterprise Systems',
    brand: 'TechPress',
    category: 'books',
    description: 'An in-depth guide to modern business processes, databases, and ERP system designs. Recommended reading for software architects and operations managers.',
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.9,
    reviewCount: 34,
    stock: 50,
    specifications: {
      'Author': 'Dr. Robert Carter',
      'Publisher': 'TechPress Professional',
      'Format': 'Hardcover',
      'Pages': '412',
      'Language': 'English'
    },
    tags: ['education', 'business', 'tech'],
    isFeatured: false
  }
];

export const MOCK_USER: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 019-2834',
  loyaltyPoints: 340,
  addresses: [
    {
      id: 'addr_01',
      name: 'Home',
      recipientName: 'John Doe',
      phone: '+1 (555) 019-2834',
      street: '123 Pine St, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
      isDefault: true
    },
    {
      id: 'addr_02',
      name: 'Office',
      recipientName: 'John Doe c/o TechCorp',
      phone: '+1 (555) 019-4455',
      street: '500 108th Ave NE',
      city: 'Bellevue',
      state: 'WA',
      zipCode: '98004',
      country: 'USA',
      isDefault: false
    }
  ]
};

export const MOCK_COUPONS: Record<string, { discountPercent: number; minSpend: number }> = {
  'WELCOME10': { discountPercent: 10, minSpend: 0 },
  'ERPRETAIL20': { discountPercent: 20, minSpend: 100 },
  'SUPERDEAL30': { discountPercent: 30, minSpend: 200 }
};

export const MOCK_WAREHOUSES = [
  { name: 'Main Store - Seattle', qty: 15 },
  { name: 'Tech Store - Bellevue', qty: 10 },
  { name: 'Central Distribution - Portland', qty: 50 }
];
