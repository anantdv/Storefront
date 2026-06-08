import { getPublicApiClient, simulateLatency } from './api.client';
import { STORE_CONFIG } from '../config/store.config';
import { useConfigStore } from '../store/useConfigStore';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mockData';
import { Product, Category } from '../types/shop.types';

// Helper to extract detailed server-side error messages from Frappe/ERPNext responses
const extractErrorMessage = (err: any, fallback: string): string => {
  if (err.response?.data) {
    if (err.response.data._server_messages) {
      try {
        const msgs = JSON.parse(err.response.data._server_messages);
        const parsed = msgs.map((m: string) => {
          try {
            return JSON.parse(m).message;
          } catch {
            return m;
          }
        });
        if (parsed.length > 0) return parsed.join(' | ');
      } catch (e) {
        console.warn('Failed to parse _server_messages', e);
      }
    }
    if (err.response.data.message) {
      return err.response.data.message;
    }
    if (err.response.data.exception) {
      return err.response.data.exception.split('\n')[0] || err.response.data.exception;
    }
  }
  return err.message || fallback;
};

const mapCurrencyCodeToSymbol = (code: string): string => {
  switch (code?.toUpperCase()) {
    case 'PGK': return 'K';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    case 'AUD': return 'A$';
    default: return code || 'K';
  }
};

export const productService = {
  async getCategories(): Promise<Category[]> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) {
      return simulateLatency(MOCK_CATEGORIES);
    }
    
    try {
      const client = getPublicApiClient();
      const response = await client.get('/api/method/erpnext.api.get_categories');
      
      if (!response.data?.message) {
        return [];
      }

      return response.data.message.map((ig: any) => {
        const catName = ig.item_group || ig.name || '';
        return {
          id: catName,
          name: catName,
          icon: '📦',
          description: ig.parent_item_group ? `Parent Category: ${ig.parent_item_group}` : ''
        };
      });
    } catch (err: any) {
      console.error('Failed to fetch Item Groups from server:', err);
      throw new Error(extractErrorMessage(err, 'Failed to fetch categories from ERPNext'));
    }
  },

  async getBrands(): Promise<string[]> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) {
      return simulateLatency(['Tefal', 'Sencor', 'HiFuture', 'Sony', 'Samsung', 'LG']);
    }
    try {
      const client = getPublicApiClient();
      const res = await client.get('/api/method/erpnext.api.get_brands');
      if (res.data?.message && Array.isArray(res.data.message) && res.data.message.length > 0) {
        return res.data.message.map((b: any) => typeof b === 'string' ? b : b.brand || b.name);
      }
    } catch (err) {
      console.warn('Failed to fetch brands from erpnext.api.get_brands:', err);
    }

    try {
      const products = await this.getProducts({ page_size: 100 });
      const brands = Array.from(new Set(products.map(p => p.brand).filter((b): b is string => !!b)));
      if (brands.length > 0) return brands;
    } catch (err) {
      console.warn('Failed to extract Brands from products list:', err);
    }
    return ['Tefal', 'Sencor', 'HiFuture'];
  },

  async get_brands(): Promise<string[]> {
    return this.getBrands();
  },

  async getProducts(filters?: {
    category?: string;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    page_size?: number;
  }): Promise<Product[] & { pagination?: { page: number; page_size: number; total: number; pages: number } }> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) {
      let filtered = [...MOCK_PRODUCTS];
      if (filters?.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.brand?.toLowerCase().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      if (filters?.brand) {
        filtered = filtered.filter(p => p.brand === filters.brand);
      }
      if (filters?.minPrice !== undefined) {
        filtered = filtered.filter(p => p.price >= filters.minPrice!);
      }
      if (filters?.maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice!);
      }
      
      const page = filters?.page || 1;
      const page_size = filters?.page_size || 24;
      const total = filtered.length;
      const pages = Math.ceil(total / page_size);
      const sliced = filtered.slice((page - 1) * page_size, page * page_size);

      const paginated = [...sliced] as any;
      paginated.pagination = { page, page_size, total, pages };
      return simulateLatency(paginated);
    }

    const client = getPublicApiClient();
    try {
      // Map front-end category slug back to exact server Item Group Name
      let serverCategory = filters?.category;
      if (serverCategory) {
        try {
          const categories = await this.getCategories();
          const found = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === serverCategory);
          if (found) {
            serverCategory = found.name;
          }
        } catch (e) {
          console.warn('Failed to translate client category to server item group:', e);
        }
      }

      const response = await client.get('/api/method/erpnext.api.get_products', {
        params: {
          category: serverCategory || undefined,
          brand: filters?.brand || undefined,
          search: filters?.search || undefined,
          page: filters?.page || undefined,
          page_size: filters?.page_size || undefined
        }
      });

      const message = response.data?.message;
      const productsList = message?.products || (Array.isArray(message) ? message : []);

      const mappedProducts = await Promise.all(productsList.map(async (item: any, idx: number) => {
        let itemImage = item.website_image || item.image || '';
        if (itemImage && itemImage.startsWith('/')) {
          const cleanBase = STORE_CONFIG.erpnextUrl.endsWith('/') ? STORE_CONFIG.erpnextUrl.slice(0, -1) : STORE_CONFIG.erpnextUrl;
          itemImage = `${cleanBase}${itemImage}`;
        }
        if (!itemImage) {
          itemImage = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.web_item_name || item.item_name)}`;
        }
        
        // Dynamically infer brand if not provided
        let brandName = item.brand || 'Courts';
        if (!item.brand) {
          const lowerName = (item.web_item_name || item.item_name || '').toLowerCase();
          if (lowerName.includes('tefal')) brandName = 'Tefal';
          else if (lowerName.includes('sencor')) brandName = 'Sencor';
          else if (lowerName.includes('aura') || lowerName.includes('future')) brandName = 'HiFuture';
        }

        // Dynamically infer category if not provided
        let categoryName = item.item_group || 'electronics';
        if (!item.item_group) {
          const lowerName = (item.web_item_name || item.item_name || '').toLowerCase();
          if (lowerName.includes('kettle') || lowerName.includes('toaster') || lowerName.includes('iron')) {
            categoryName = 'Kitchen Appliance';
          } else if (lowerName.includes('vacuum') || lowerName.includes('steamer')) {
            categoryName = 'Home Appliances';
          } else if (lowerName.includes('watch')) {
            categoryName = 'Mobiles & Tabs';
          }
        }

        // Fetch detail to get real price and currency from the prices array
        let resolvedPrice = 0;
        try {
          const detailRes = await client.get('/api/method/erpnext.api.get_product', {
            params: { route: item.route || item.item_code }
          });
          const detail = detailRes.data?.message;
          if (detail && detail.prices && Array.isArray(detail.prices)) {
            const standardSelling = detail.prices.find((p: any) => p.price_list === 'Standard Selling') || detail.prices[0];
            if (standardSelling) {
              resolvedPrice = standardSelling.price_list_rate || 0;
              if (standardSelling.currency) {
                const symbol = mapCurrencyCodeToSymbol(standardSelling.currency);
                const { currency, setCurrency } = useConfigStore.getState();
                if (currency !== symbol) {
                  setCurrency(symbol);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Failed to resolve individual product price for item', item.name, e);
        }

        // Distribute items into featured/bestseller/trending buckets for homepage display
        const isFeatured = idx === 0 || idx === 3 || idx === 6;
        const isBestSeller = idx === 1 || idx === 4 || idx === 7;
        const isTrending = idx === 2 || idx === 5;

        return {
          id: item.route || item.item_code || item.name,
          itemCode: item.item_code,
          name: item.web_item_name || item.item_name,
          brand: brandName,
          category: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: item.web_item_description || item.short_description || item.description || '',
          price: resolvedPrice || item.price || item.price_list_rate || 0,
          image: itemImage,
          gallery: itemImage ? [itemImage] : [],
          rating: 4.5,
          reviewCount: 12,
          stock: item.stock !== undefined ? item.stock : 10,
          specifications: {},
          tags: [],
          isFeatured,
          isBestSeller,
          isTrending
        };
      }));

      const paginated = [...mappedProducts] as any;
      if (message?.pagination) {
        paginated.pagination = {
          page: message.pagination.page,
          page_size: message.pagination.page_size,
          total: message.pagination.total,
          pages: message.pagination.pages
        };
      } else {
        paginated.pagination = {
          page: filters?.page || 1,
          page_size: filters?.page_size || 24,
          total: mappedProducts.length,
          pages: Math.ceil(mappedProducts.length / (filters?.page_size || 24))
        };
      }
      return paginated;
    } catch (err: any) {
      console.error('getProducts failed:', err);
      throw new Error(extractErrorMessage(err, 'Failed to fetch website items from ERPNext'));
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) {
      const product = MOCK_PRODUCTS.find(p => p.id === id) || null;
      return simulateLatency(product);
    }

    const client = getPublicApiClient();
    try {
      const response = await client.get('/api/method/erpnext.api.get_product', {
        params: { route: id }
      });
      
      const item = response.data?.message;
      if (item) {
        let image = item.website_image || item.image || '';
        if (image && image.startsWith('/')) {
          const cleanBase = STORE_CONFIG.erpnextUrl.endsWith('/') ? STORE_CONFIG.erpnextUrl.slice(0, -1) : STORE_CONFIG.erpnextUrl;
          image = `${cleanBase}${image}`;
        }
        if (!image) {
          image = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.item_name)}`;
        }
        
        // Dynamically infer brand if not provided
        let brandName = item.brand || 'Courts';
        if (!item.brand) {
          const lowerName = item.item_name.toLowerCase();
          if (lowerName.includes('tefal')) brandName = 'Tefal';
          else if (lowerName.includes('sencor')) brandName = 'Sencor';
          else if (lowerName.includes('aura') || lowerName.includes('future')) brandName = 'HiFuture';
        }

        // Dynamically infer category if not provided
        let categoryName = item.item_group || 'electronics';
        if (!item.item_group) {
          const lowerName = item.item_name.toLowerCase();
          if (lowerName.includes('kettle') || lowerName.includes('toaster') || lowerName.includes('iron')) {
            categoryName = 'Kitchen Appliance';
          } else if (lowerName.includes('vacuum') || lowerName.includes('steamer')) {
            categoryName = 'Home Appliances';
          } else if (lowerName.includes('watch')) {
            categoryName = 'Mobiles & Tabs';
          }
        }

        let resolvedPrice = 0;
        if (item.prices && Array.isArray(item.prices)) {
          const standardSelling = item.prices.find((p: any) => p.price_list === 'Standard Selling') || item.prices[0];
          if (standardSelling) {
            resolvedPrice = standardSelling.price_list_rate || 0;
            if (standardSelling.currency) {
              const symbol = mapCurrencyCodeToSymbol(standardSelling.currency);
              const { currency, setCurrency } = useConfigStore.getState();
              if (currency !== symbol) {
                setCurrency(symbol);
              }
            }
          }
        }

        return {
          id: item.route || item.item_code || id,
          itemCode: item.item_code,
          name: item.item_name,
          brand: brandName,
          category: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: item.web_item_description || item.short_description || item.description || '',
          price: resolvedPrice || item.price || item.price_list_rate || 0,
          image: image,
          gallery: image ? [image] : [],
          rating: 4.5,
          reviewCount: 12,
          stock: item.stock !== undefined ? item.stock : 10,
          specifications: item.specifications || {},
          tags: []
        };
      }
    } catch (err) {
      console.warn('get_product API failed, falling back to get_products list search:', err);
    }

    // Fallback: search in products list
    try {
      const allProducts = await this.getProducts();
      const matched = allProducts.find(p => p.id === id || p.itemCode === id || p.name === id);
      if (matched) {
        return matched;
      }
    } catch (e) {
      console.error('Fallback list search failed:', e);
    }

    return null;
  },

  async addProductReview(params: {
    itemCode: string;
    rating: number;
    review: string;
    reviewerName: string;
    reviewerEmail: string;
  }): Promise<boolean> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) return true;

    const client = getPublicApiClient();
    try {
      // 1. Try custom Product Review resource insertion
      await client.post('/api/resource/Product Review', {
        website_item: params.itemCode,
        rating: params.rating,
        review: params.review,
        reviewer_name: params.reviewerName,
        reviewer_email: params.reviewerEmail
      });
      return true;
    } catch (e) {
      console.warn('Failed to save to Product Review doctype, trying standard Comment system:', e);
      try {
        // 2. Fallback: standard Comment Doctype insertion
        await client.post('/api/resource/Comment', {
          comment_type: 'Comment',
          comment_email: params.reviewerEmail,
          comment_by: params.reviewerName,
          content: `[Rating: ${params.rating}/5] ${params.review}`,
          reference_doctype: 'Website Item',
          reference_name: params.itemCode
        });
        return true;
      } catch (err) {
        console.error('Failed to sync review/rating with ERPNext:', err);
        return false;
      }
    }
  },

  async getProductReviews(itemCode: string): Promise<{
    reviewerName: string;
    reviewerEmail: string;
    rating: number;
    review: string;
    date: string;
  }[]> {
    const useMock = STORE_CONFIG.useMock;
    if (useMock) {
      return [
        { reviewerName: 'Maea K.', reviewerEmail: 'maea@example.com', rating: 5, review: 'Fantastic quality and extremely fast delivery. Highly recommend this for home setups.', date: 'May 12, 2026' },
        { reviewerName: 'Andrew L.', reviewerEmail: 'andrew@example.com', rating: 4, review: 'Very robust build and performance. Satisfied with the purchase.', date: 'April 20, 2026' }
      ];
    }

    const client = getPublicApiClient();
    try {
      // 1. Try fetching from custom Product Review doctype
      const res = await client.get('/api/resource/Product Review', {
        params: {
          filters: JSON.stringify([['website_item', '=', itemCode]]),
          fields: JSON.stringify(['reviewer_name', 'reviewer_email', 'rating', 'review', 'creation'])
        }
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map((r: any) => ({
          reviewerName: r.reviewer_name || 'Anonymous',
          reviewerEmail: r.reviewer_email || '',
          rating: r.rating || 5,
          review: r.review || '',
          date: new Date(r.creation).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch from custom Product Review doctype, trying standard Comment system:', e);
    }

    try {
      // 2. Fallback: fetch from standard Comment system
      const res = await client.get('/api/resource/Comment', {
        params: {
          filters: JSON.stringify([
            ['reference_doctype', '=', 'Website Item'],
            ['reference_name', '=', itemCode],
            ['comment_type', '=', 'Comment']
          ]),
          fields: JSON.stringify(['comment_by', 'comment_email', 'content', 'creation']),
          limit_page_length: 50
        }
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map((c: any) => {
          let rating = 5;
          let content = c.content || '';
          const match = content.match(/\[Rating:\s*(\d+)\/5\]/);
          if (match) {
            rating = parseInt(match[1]) || 5;
            content = content.replace(/\[Rating:\s*\d+\/5\]\s*/, '');
          }
          return {
            reviewerName: c.comment_by || 'Anonymous',
            reviewerEmail: c.comment_email || '',
            rating,
            review: content,
            date: new Date(c.creation).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch product reviews from ERPNext:', err);
    }

    return [];
  },

  async getSearchSuggestions(query: string): Promise<{ productSuggestions: string[]; categorySuggestions: string[] }> {
    const products = await this.getProducts({ search: query });
    const productSuggestions = products.map(p => p.name).slice(0, 5);
    
    const categories = await this.getCategories();
    const categorySuggestions = categories
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .map(c => c.name)
      .slice(0, 3);

    return { productSuggestions, categorySuggestions };
  }
};
