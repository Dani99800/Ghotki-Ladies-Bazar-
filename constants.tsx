
import { AppEvent } from './types';

export const COLORS = {
  // These now point to CSS variables defined in App.tsx
  primary: 'var(--primary-event, #db2777)',
  secondary: 'var(--accent-event, #be185d)',
  accent: 'var(--accent-bg, #fdf2f8)',
  text: '#111827',
  muted: '#6b7280',
};

export const PK_EVENTS: AppEvent[] = [
  {
    id: 'NORMAL',
    name: 'Normal Mode',
    urduName: 'عام دن',
    primaryColor: '#db2777', // Pink
    accentColor: '#be185d',
    emoji: '🛍️',
    bannerText: 'Welcome to Ghotki Ladies Bazar'
  },
  {
    id: 'RAMZAN',
    name: 'Ramzan Mubarak',
    urduName: 'رمضان مبارک',
    primaryColor: '#065f46', // Emerald Green
    accentColor: '#b45309', // Amber Gold
    emoji: '🌙',
    bannerText: 'Ramzan Kareem: Blessed Deals are here!'
  },
  {
    id: 'EID_FITR',
    name: 'Eid-ul-Fitr',
    urduName: 'عید الفطر',
    primaryColor: '#be185d', // Radiant Pink
    accentColor: '#854d0e', // Gold
    emoji: '✨',
    bannerText: 'Eid Mubarak! Shop the Festive Collection'
  },
  {
    id: 'EID_ADHA',
    name: 'Eid-ul-Adha',
    urduName: 'عید الاضحیٰ',
    primaryColor: '#1e40af', // Deep Blue
    accentColor: '#15803d', // Green
    emoji: '🐑',
    bannerText: 'Eid-ul-Adha Mubarak! Traditional wear for you'
  },
  {
    id: 'INDEPENDENCE',
    name: '14 August',
    urduName: 'یوم آزادی',
    primaryColor: '#14532d', // Pakistan Green
    accentColor: '#ffffff', // White
    emoji: '🇵🇰',
    bannerText: 'Happy Independence Day! Azadi Sale is LIVE'
  },
  {
    id: 'MILAAD',
    name: '12 Rabi-ul-Awal',
    urduName: 'جشنِ عید میلاد النبیﷺ',
    primaryColor: '#15803d', // Green
    accentColor: '#fef3c7', // Cream
    emoji: '🕌',
    bannerText: '12 Rabi-ul-Awal Mubarak! Celebrating Mercy'
  },
  {
    id: 'ALI_BIRTHDAY',
    name: 'Hazrat Ali Birthday',
    urduName: 'ولادتِ مولا علیؑ',
    primaryColor: '#1e3a8a', // Royal Blue
    accentColor: '#ca8a04', // Yellow Gold
    emoji: '🦁',
    bannerText: 'Ya Ali Madad! Celebrating the birth of Maula Ali (as)'
  },
  {
    id: 'PAKISTAN_DAY',
    name: '23 March',
    urduName: 'یومِ پاکستان',
    primaryColor: '#166534', // Green
    accentColor: '#f8fafc', // Slate
    emoji: '🇵🇰',
    bannerText: 'Happy Pakistan Day! Resolution for Growth'
  }
];

export const BAZAARS = [
  'Ghotki Ladies Bazar',
  'Sahee Bazar',
  'Main Bazar Ghotki',
  'Resham Gali',
];

export const CATEGORIES = [
  { 
    id: 'women_clothes', 
    name: "Women's Clothes", 
    image: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'men_clothes', 
    name: "Men's Clothes", 
    image: 'https://images.unsplash.com/photo-1594932224828-b4b059bdbf6f?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'men_footwear', 
    name: "Men's Footwear", 
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'women_footwear', 
    name: "Women's Footwear", 
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'cosmetics', 
    name: 'Cosmetics', 
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' 
  },
];

export const SUBSCRIPTION_PLANS = [
  { id: 'BASIC', price: 1000, label: 'Basic' },
  { id: 'STANDARD', price: 2500, label: 'Standard' },
  { id: 'PREMIUM', price: 5000, label: 'Premium' },
];

export const PLATFORM_FEE_PKR = 1000;

export const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3";
