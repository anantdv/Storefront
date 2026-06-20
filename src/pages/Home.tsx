import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Percent, TrendingUp, Sparkles, Star, ChevronLeft, ChevronRight, Bookmark, Flame, Award, Globe, Wind } from 'lucide-react';
import { ProductSliderSection } from '../components/product/ProductSliderSection';
import { productService } from '../services/product.service';
import { Product, Category } from '../types/shop.types';
import { useConfigStore } from '../store/useConfigStore';
import { getAssetUrl } from '../utils/assets';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currency } = useConfigStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [recentViews, setRecentViews] = useState<Product[]>([]);
  const [pngMadeProducts, setPngMadeProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [activeFlashDeal, setActiveFlashDeal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600 * 4 + 120); // 4h 2m left
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const topCategoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const allProds = await productService.getProducts({ page_size: 100 });
        setAllProducts(allProds);
        setFeaturedProducts(allProds.filter(p => p.isFeatured || p.price > 400));
        setTrendingProducts(allProds.filter(p => p.isTrending || p.rating >= 4));
        setBestSellers(allProds.filter(p => p.isBestSeller || p.price < 300));
        
        // Dynamic list allocations
        setFlashDeals(allProds.slice(0, 4));
        setRecentViews(allProds.slice(4, 12));
        
        // Filter or create PNG Made list
        const pngItems = allProds.filter(p => 
          p.name.toLowerCase().includes('png') || 
          p.brand?.toLowerCase() === 'courts' || 
          p.price > 200
        );
        setPngMadeProducts(pngItems.slice(0, 8));

        const brs = await productService.getBrands();
        setBrands(brs);

        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHomeData();
  }, []);

  // Timer for Flash Deals
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Flash Deals auto-sliding
  useEffect(() => {
    if (flashDeals.length <= 1) return;
    const interval = setInterval(() => {
      setActiveFlashDeal(prev => (prev === flashDeals.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [flashDeals.length]);

  // Categories carousel auto-sliding
  useEffect(() => {
    if (categories.length === 0) return;
    const interval = setInterval(() => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        const nextScroll = scrollLeft + 120 >= scrollWidth - clientWidth ? 0 : scrollLeft + 120;
        categoryScrollRef.current.scrollTo({
          left: nextScroll,
          behavior: 'smooth'
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [categories.length]);

  // Top subnav Category bar auto-sliding
  useEffect(() => {
    if (categories.length === 0) return;
    const interval = setInterval(() => {
      if (topCategoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = topCategoryScrollRef.current;
        const nextScroll = scrollLeft + 150 >= scrollWidth - clientWidth ? 0 : scrollLeft + 150;
        topCategoryScrollRef.current.scrollTo({
          left: nextScroll,
          behavior: 'smooth'
        });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [categories.length]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Rotating Banners state
  const [activeBanner, setActiveBanner] = useState(0);
  const banners = [
    {
      title: "Signal Stack",
      subtitle: "LIVE ERPNEXT CATALOG",
      tagline: "Fast. Distinct. Built for commerce.",
      description: "A bold storefront for live inventory, pricing, and order flows without the usual marketplace look.",
      cta: "Browse the Catalog",
      link: "/catalog",
      bg: "bg-[#0b0d10]",
      img: getAssetUrl('/xiaomi_banner.png'),
      isXiaomi: false
    },
    {
      title: 'Black & Blue Supply Rail',
      subtitle: 'CATEGORIES WITH PUNCH',
      tagline: 'Curated. Sharp. Clear.',
      description: 'Shop categories, track deals, and move between product families through a cleaner navigation system.',
      cta: 'Explore Categories',
      link: '/catalog',
      bg: 'bg-[#10131a]',
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      isXiaomi: false
    },
    {
      title: 'Finance Without Friction',
      subtitle: 'HIRE PURCHASE READY',
      tagline: 'Plan. Pay. Proceed.',
      description: 'Keep the ERPNext commerce backbone and pair it with a stronger, more editorial storefront identity.',
      cta: 'See Finance Options',
      link: '/catalog',
      bg: 'bg-[#0f1d3a]',
      img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      isXiaomi: false
    }
  ];

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setActiveBanner(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(bannerInterval);
  }, [banners.length]);

  const handlePrevBanner = () => {
    setActiveBanner(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setActiveBanner(prev => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const scrollBrands = (direction: 'left' | 'right') => {
    if (brandScrollRef.current) {
      const { scrollLeft, clientWidth } = brandScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      brandScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth } = categoryScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      categoryScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mobile') || lower.includes('tab') || lower.includes('phone')) return '📱';
    if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('appliance')) return '🍳';
    if (lower.includes('home') || lower.includes('appliance')) return '🏠';
    if (lower.includes('computer') || lower.includes('tech') || lower.includes('laptop')) return '💻';
    if (lower.includes('tv') || lower.includes('entertainment') || lower.includes('screen')) return '📺';
    if (lower.includes('air') || lower.includes('condition') || lower.includes('cool')) return '🌬️';
    if (lower.includes('wash') || lower.includes('dry') || lower.includes('laundry')) return '🌀';
    return '📦';
  };

  const getBrandLogo = (brandName: string) => {
    const name = brandName.toLowerCase();
    if (name.includes('xiaomi')) {
      return (
        <div className="h-10 w-10 rounded-xl bg-[#ff6700] text-white flex items-center justify-center font-bold text-sm tracking-tighter mb-2 shadow-xxs">
          mi
        </div>
      );
    }
    if (name.includes('daltron')) {
      return (
        <div className="h-10 w-10 rounded-xl bg-[#0060a9] text-white flex items-center justify-center font-extrabold text-sm mb-2 shadow-xxs">
          D
        </div>
      );
    }
    if (name.includes('kina') || name.includes('bank')) {
      return (
        <div className="h-10 w-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm mb-2 shadow-xxs">
          K
        </div>
      );
    }
    if (name.includes('courts')) {
      return (
        <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs uppercase tracking-tighter mb-2 shadow-xxs">
          CRT
        </div>
      );
    }
    return (
      <div className="h-10 w-10 rounded-xl bg-[#0060a9]/10 text-[#0060a9] flex items-center justify-center font-extrabold text-sm mb-2 border border-[#0060a9]/10 uppercase shadow-xxs">
        {brandName.slice(0, 2)}
      </div>
    );
  };

  const currentFlash = flashDeals[activeFlashDeal];

  return (
    <div className="space-y-6 pb-16">
      
      <div className="market-panel mx-4 overflow-x-auto whitespace-nowrap border-white/10 px-4 py-3.5 shadow-lg sm:mx-6 lg:mx-8" ref={topCategoryScrollRef}>
        <div className="mx-auto flex max-w-7xl items-center justify-start gap-6 px-4 text-xs font-black uppercase tracking-[0.25em] text-white/90 sm:text-sm md:justify-center">
          {categories.map((cat) => {
            const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={cat.id} to={`/catalog?category=${categorySlug}`} className="transition-colors hover:text-[#ffcb2f]">
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Banner Carousel - Height increased by 10% more */}
      <section className="relative group mx-4 overflow-hidden rounded-[2rem] border border-black/10 shadow-[0_24px_60px_rgba(11,13,16,0.14)] sm:mx-6 lg:mx-8">
        <div className={`relative flex min-h-[245px] flex-col items-center justify-between gap-6 p-6 transition-all duration-700 md:flex-row sm:min-h-[310px] ${banners[activeBanner].bg}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,203,47,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(241,29,43,0.15),_transparent_30%)]" />
          
          {/* Text Left side */}
          <div className="relative z-10 flex-1 max-w-xl space-y-4 text-white">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#ffcb2f]">
                <Sparkles className="h-3 w-3" /> {banners[activeBanner].subtitle}
              </span>
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                {banners[activeBanner].title}
              </h1>
              <p className="max-w-lg text-sm font-medium text-white/75 sm:text-base">
                <span className="font-black text-[#ffcb2f]">{banners[activeBanner].tagline} </span>
                {banners[activeBanner].description}
              </p>
            </div>

            <div className="pt-1">
              <Link
                to={banners[activeBanner].link}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f11d2b] to-[#ffcb2f] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#0b0d10] shadow-lg transition-all hover:scale-[1.02]"
              >
                {banners[activeBanner].cta}
              </Link>
            </div>
          </div>

          {/* Image Right side */}
          <div className="relative z-10 h-[185px] w-full overflow-hidden rounded-[1.75rem] border border-white/10 md:max-w-md sm:aspect-square sm:h-[250px]">
            <img 
              src={banners[activeBanner].img} 
              alt={banners[activeBanner].title} 
              className="h-full w-full rounded-[1.75rem] object-cover animate-in fade-in zoom-in-95 duration-500"
            />
          </div>
        </div>

        {/* Carousel controls - Chevron Left & Right */}
        <button
          onClick={handlePrevBanner}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/45 p-2 text-white opacity-0 backdrop-blur-xs transition-all group-hover:opacity-100 hover:bg-black/70 focus:outline-none"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={handleNextBanner}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/45 p-2 text-white opacity-0 backdrop-blur-xs transition-all group-hover:opacity-100 hover:bg-black/70 focus:outline-none"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`h-1.5 rounded-full transition-all ${i === activeBanner ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="market-panel overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_24px_60px_rgba(11,13,16,0.16)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="market-badge rounded-full px-3 py-1 text-[10px] font-black">ERPNext live</span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                Distinct commerce shell
              </span>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  A storefront that feels curated, not cloned.
                </h2>
                <p className="max-w-lg text-sm leading-6 text-white/75 sm:text-base">
                  We kept ERPNext inventory, pricing, and ordering exactly as-is, then rebuilt the presentation with a darker editorial rhythm, sharper card shapes, and a stronger color story.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { label: 'Products', value: allProducts.length },
                    { label: 'Categories', value: categories.length },
                    { label: 'Brands', value: brands.length },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
                      <div className="text-2xl font-black text-[#ffcb2f]">{item.value}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/catalog"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f11d2b] to-[#ffcb2f] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#0b0d10] shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    Browse catalog
                  </Link>
                  <Link
                    to="/hire-purchase"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-colors hover:bg-white/12"
                  >
                    Finance options
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/55">Featured pulse</p>
                      <h3 className="mt-1 text-xl font-black text-white">Live deal timer</h3>
                    </div>
                    <span className="rounded-full bg-[#ffcb2f] px-3 py-1 text-[10px] font-black text-[#0b0d10]">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  {currentFlash && (
                    <div className="mt-4 flex items-center gap-4">
                      <img src={currentFlash.image} alt={currentFlash.name} className="h-24 w-24 rounded-[1.25rem] object-cover shadow-lg" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Current spotlight</p>
                        <h4 className="mt-1 truncate text-base font-black text-white">{currentFlash.name}</h4>
                        <p className="mt-1 text-sm text-white/70">
                          From {currency}
                          {(currentFlash.price * 0.9).toFixed(2)}
                        </p>
                        <Link to={`/product/${currentFlash.id}`} className="mt-3 inline-flex text-[10px] font-black uppercase tracking-[0.25em] text-[#ffcb2f]">
                          View spotlight
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Top rating', value: '4.5+', tone: 'text-[#ffcb2f]' },
                    { label: 'ERPNext sync', value: 'Live', tone: 'text-[#f11d2b]' },
                    { label: 'Responsive', value: 'Yes', tone: 'text-[#1357d9]' },
                    { label: 'Secure login', value: 'Cookie session', tone: 'text-white' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
                      <div className={`text-xl font-black ${item.tone}`}>{item.value}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="market-panel-light rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Featured story</p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">One product, full focus</h3>
                </div>
                <Sparkles className="h-5 w-5 text-[#f11d2b]" />
              </div>
              {featuredProducts[0] && (
                <button
                  onClick={() => navigate(`/product/${featuredProducts[0].id}`)}
                  className="mt-4 flex w-full items-center gap-4 rounded-[1.5rem] border border-black/10 bg-white p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <img src={featuredProducts[0].image} alt={featuredProducts[0].name} className="h-24 w-24 rounded-[1.25rem] object-cover" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1357d9]">Featured product</p>
                    <h4 className="mt-1 line-clamp-2 text-base font-black text-slate-900">{featuredProducts[0].name}</h4>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {currency}
                      {featuredProducts[0].price.toFixed(2)}
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="market-panel-light rounded-[1.75rem] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Fast links</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { label: 'Catalog', to: '/catalog' },
                  { label: 'Store locator', to: '/store-locator' },
                  { label: 'Hire purchase', to: '/hire-purchase' },
                  { label: 'Account', to: '/account' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-black text-slate-800 transition-colors hover:border-[#1357d9]/30 hover:bg-[#1357d9]/8"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_40px_rgba(11,13,16,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black uppercase tracking-[0.25em] text-slate-900">Category mosaic</h3>
              <p className="mt-1 text-sm text-slate-500">Curated entrances instead of a long storefront shelf.</p>
            </div>
            <Link to="/catalog" className="text-xs font-black uppercase tracking-[0.25em] text-[#1357d9]">
              Open all
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.slice(0, 8).map((cat, idx) => {
              const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
              const palette = [
                'from-[#f11d2b] to-[#0b0d10]',
                'from-[#1357d9] to-[#0b0d10]',
                'from-[#ffcb2f] to-[#f11d2b]',
                'from-[#0b0d10] to-[#1357d9]',
              ];
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/catalog?category=${categorySlug}`)}
                  className={`group flex min-h-[150px] flex-col justify-between rounded-[1.5rem] bg-gradient-to-br ${palette[idx % palette.length]} p-4 text-left text-white shadow-lg transition-transform hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl">{cat.icon || '📦'}</span>
                    <ArrowRight className="h-4 w-4 text-white/80 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h4 className="text-base font-black leading-tight">{cat.name}</h4>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Shop now</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 space-y-8">
        <ProductSliderSection
          title="Featured Selection"
          icon={<Sparkles className="h-5 w-5 text-[#f11d2b]" />}
          products={featuredProducts}
        />

        <ProductSliderSection
          title="Best Sellers"
          icon={<TrendingUp className="h-5 w-5 text-[#1357d9]" />}
          products={bestSellers}
        />
      </section>

      {brands.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-black/10 bg-[#0b0d10] p-5 text-white shadow-[0_18px_40px_rgba(11,13,16,0.14)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Brands</h3>
                <p className="mt-1 text-sm text-white/60">A restrained wall of partner names instead of another shopping shelf.</p>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  onClick={() => scrollBrands('left')}
                  className="rounded-full border border-white/10 bg-white/8 p-2 text-white transition-colors hover:bg-white/14"
                  aria-label="Previous brands"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => scrollBrands('right')}
                  className="rounded-full border border-white/10 bg-white/8 p-2 text-white transition-colors hover:bg-white/14"
                  aria-label="Next brands"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div ref={brandScrollRef} className="mt-4 flex flex-wrap gap-3">
              {brands.slice(0, 12).map((brand) => (
                <button
                  key={brand}
                  onClick={() => navigate(`/catalog?search=${encodeURIComponent(brand)}`)}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-bold text-white/85 transition-colors hover:border-[#ffcb2f] hover:text-[#ffcb2f]"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
