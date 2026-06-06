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
      title: "Xiaomi 14 Ultra",
      subtitle: "CO-ENGINEERED WITH LEICA",
      tagline: "Far. Better.",
      description: "Segment's only Leica 5x Periscope Zoom lens. Professional-grade quad camera setup.",
      cta: "Pre-book Now",
      link: "/catalog?search=xiaomi",
      bg: "bg-[#0b0312]",
      img: getAssetUrl('/xiaomi_banner.png'),
      isXiaomi: true
    },
    {
      title: 'Your ICT Solutions Partner',
      subtitle: 'Daltron Network & ISP Services',
      tagline: 'Connect. Grow.',
      description: 'Meet your business ICT needs with faster, custom-tailored internet and hardware setups built for your budget.',
      cta: 'Shop Tech & Hardware',
      link: '/catalog?category=mobiles-&-tabs',
      bg: 'bg-[#1a0f0f]',
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      isXiaomi: false
    },
    {
      title: 'Digital Banking Partnerships',
      subtitle: 'Kina Bank Corporate Online',
      tagline: 'Simple. Secure.',
      description: 'Power your business with PNG\'s first digital bank. Simple, secure, and fast commercial banking integration.',
      cta: 'Explore Platform',
      link: '/catalog',
      bg: 'bg-[#0b1b33]',
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
      
      <div className="mx-4 sm:mx-6 lg:mx-8 bg-white border-b border-slate-100 py-3.5 overflow-x-auto whitespace-nowrap scrollbar-none shadow-xxs rounded-2xl" ref={topCategoryScrollRef}>
        <div className="max-w-7xl mx-auto px-4 flex justify-start md:justify-center items-center gap-6 text-xs sm:text-sm font-black text-slate-700 tracking-wide uppercase">
          {categories.map((cat) => {
            const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={cat.id} to={`/catalog?category=${categorySlug}`} className="hover:text-indigo-650 transition-colors">
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Banner Carousel - Height increased by 10% more */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-sm group">
        <div className={`relative flex flex-col md:flex-row items-center justify-between min-h-[245px] sm:min-h-[310px] ${banners[activeBanner].bg} p-6 sm:p-8 gap-6 transition-all duration-700`}>
          
          {/* Text Left side */}
          <div className="flex-1 space-y-4 max-w-xl z-10 text-white">
            {banners[activeBanner].isXiaomi ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight font-sans">xiaomi</span>
                  <span className="text-sm sm:text-base font-light text-slate-350 border border-slate-600 px-2 py-0.5 rounded-md">14 Ultra</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-slate-400">
                  <span>CO-ENGINEERED WITH</span>
                  <span className="bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full">Leica</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight mt-1">
                  <span className="text-rose-500 font-serif font-light">{banners[activeBanner].tagline} </span>
                  {banners[activeBanner].description}
                </h1>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-550/20 border border-indigo-400/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300">
                  <Sparkles className="h-3 w-3" /> {banners[activeBanner].subtitle}
                </span>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-none">
                  {banners[activeBanner].title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {banners[activeBanner].description}
                </p>
              </div>
            )}

            <div className="pt-1">
              <Link
                to={banners[activeBanner].link}
                className="inline-flex items-center justify-center rounded-xl bg-white text-slate-955 px-5 py-2.5 text-[10px] font-black shadow-lg hover:bg-slate-100 transition-all hover:scale-102 uppercase tracking-wider"
              >
                {banners[activeBanner].cta}
              </Link>
            </div>
          </div>

          {/* Image Right side */}
          <div className="flex-1 w-full md:max-w-md aspect-video sm:aspect-square overflow-hidden rounded-2xl relative h-[185px] sm:h-[250px]">
            <img 
              src={banners[activeBanner].img} 
              alt={banners[activeBanner].title} 
              className="h-full w-full object-cover animate-in fade-in zoom-in-95 duration-500 rounded-2xl"
            />
          </div>
        </div>

        {/* Carousel controls - Chevron Left & Right */}
        <button
          onClick={handlePrevBanner}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all focus:outline-none z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={handleNextBanner}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all focus:outline-none z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`h-1.5 rounded-full transition-all ${i === activeBanner ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* Grid below Hero Banner: Flash Deals + Bank Cards */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          
          {/* Flash Deals Card (placed next to bank offers) */}
          {currentFlash && (
            <div className="lg:col-span-1 rounded-3xl border border-rose-100 bg-rose-50/25 p-5 flex flex-col justify-between shadow-3xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <Percent className="h-4 w-4 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Flash Deal of the Day</span>
                  </div>
                  <span className="rounded-lg bg-slate-900 px-2 py-1 font-mono text-[10px] font-bold text-white tracking-widest">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <img src={currentFlash.image} alt={currentFlash.name} className="h-16 w-16 object-cover rounded-xl shrink-0 bg-white border border-slate-100" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-850 truncate">{currentFlash.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-black text-slate-900">{currency}{(currentFlash.price * 0.9).toFixed(2)}</span>
                      <span className="text-[10px] font-semibold text-slate-400 line-through">{currency}{currentFlash.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/product/${currentFlash.id}`}
                className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-2 transition-colors uppercase tracking-wider"
              >
                Grab Deal
              </Link>
            </div>
          )}

          {/* Bank Cards Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: OneCard */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-3xs">
              <div className="bg-slate-900 text-white text-[10px] font-black tracking-tighter px-2 py-1.5 rounded-lg shrink-0">one</div>
              <div className="min-w-0">
                <p className="text-xxs text-slate-800 font-extrabold leading-snug">Get Upto Rs. 20,000 Instant Discount on OneCard Credit EMI</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">*T&C apply</p>
              </div>
            </div>
            {/* Card 2: Yes Bank */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-3xs">
              <div className="text-indigo-650 text-xxs font-black shrink-0 flex items-center gap-0.5">✓ <span className="tracking-tighter">YES BANK</span></div>
              <div className="min-w-0">
                <p className="text-xxs text-slate-800 font-extrabold leading-snug">Get 5% Instant Discount Upto Rs 2500 on YES Bank Credit Card EMI</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">*T&C apply</p>
              </div>
            </div>
            {/* Card 3: BOB Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-3xs">
              <div className="text-orange-600 text-xxs font-black shrink-0 tracking-tighter">BOBCARD</div>
              <div className="min-w-0">
                <p className="text-xxs text-slate-800 font-extrabold leading-snug">Get 10% Instant Discount upto Rs.3,000 on BOB Card EMI</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">*T&C apply</p>
              </div>
            </div>
            {/* Card 4: DBS */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-3xs">
              <div className="bg-red-600 text-white text-[9px] font-black px-1.5 py-1 rounded shrink-0">DBS</div>
              <div className="min-w-0">
                <p className="text-xxs text-slate-800 font-extrabold leading-snug">Get 10% Instant Discount upto Rs.3000 on DBS Bank Credit Card EMI/Non EMI</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">*T&C apply</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category icon grid (merged with Summer Store layout and dynamic) */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs">
          
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Shop by Category</h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollCategories('left')}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-colors shadow-xxs focus:outline-none"
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCategories('right')}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-colors shadow-xxs focus:outline-none"
                aria-label="Next categories"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none" ref={categoryScrollRef}>
            
            {/* Summer Store Logo */}
            <div className="flex flex-col items-center justify-center text-center p-2.5 group cursor-pointer shrink-0 snap-start" onClick={() => navigate('/catalog?search=summer')}>
              <div className="flex flex-col items-center relative">
                <span className="text-[14px] font-light text-rose-500 italic leading-none relative font-serif">
                  summer
                  <span className="absolute -top-3 -right-2 text-[9px]">☀️</span>
                </span>
                <span className="text-2xl font-black tracking-tighter text-red-650 leading-none mt-1">STORE</span>
              </div>
            </div>

            {/* Dynamic Categories Icons */}
            {categories.map((cat) => {
              const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/catalog?category=${categorySlug}`)}
                  className="flex flex-col items-center justify-center text-center p-2 group cursor-pointer hover:scale-105 transition-transform shrink-0 snap-start min-w-[100px]"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-indigo-50 transition-colors">
                    {getIcon(cat.name)}
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-750 mt-2 truncate max-w-[110px]">{cat.name}</span>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Product Carousels */}
      <section className="w-full px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Featured finds */}
        <ProductSliderSection
          title="Best Featured Finds"
          icon={<Sparkles className="h-5 w-5 text-indigo-500" />}
          products={featuredProducts}
        />

        {/* Best selling */}
        <ProductSliderSection
          title="Best Selling"
          icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
          products={bestSellers}
        />

        {/* Most Picked Items */}
        <ProductSliderSection
          title="Most Picked Items"
          icon={<Flame className="h-5 w-5 text-rose-500" />}
          products={trendingProducts}
        />

        {/* Related Items View */}
        <ProductSliderSection
          title="Related Items You've Viewed"
          icon={<Bookmark className="h-5 w-5 text-emerald-500" />}
          products={recentViews}
        />

        {/* PNG Made Items */}
        <ProductSliderSection
          title="PNG Made"
          icon={<Globe className="h-5 w-5 text-amber-500" />}
          products={pngMadeProducts}
        />

        {/* Sliding Top Brands */}
        {brands.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-500" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Top Brands</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollBrands('left')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-colors shadow-xxs focus:outline-none"
                  aria-label="Previous brands"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => scrollBrands('right')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-colors shadow-xxs focus:outline-none"
                  aria-label="Next brands"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div
              ref={brandScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin"
            >
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => navigate(`/catalog?search=${encodeURIComponent(brand)}`)}
                  className="flex min-w-[140px] sm:min-w-[180px] snap-start flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-55 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-150 hover:bg-white hover:shadow-md hover:shadow-indigo-100/50 group focus:outline-none"
                >
                  {getBrandLogo(brand)}
                  <span className="text-sm sm:text-base font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {brand}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Explore items
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </section>

    </div>
  );
};
