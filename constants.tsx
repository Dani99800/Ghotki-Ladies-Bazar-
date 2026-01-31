
import { AppEvent } from './types';

export const COLORS = {
  primary: 'var(--primary-event, #db2777)',
  secondary: 'var(--accent-event, #be185d)',
  accent: 'var(--accent-bg, #fdf2f8)',
  text: '#111827',
  muted: '#6b7280',
};

export const PK_EVENTS: AppEvent[] = [
  {
    id: 'NORMAL',
    name: 'Ghotki Ladies Bazar',
    urduName: 'عام دن',
    primaryColor: '#db2777',
    accentColor: '#be185d',
    emoji: '🛍️',
    bannerText: 'Digitizing Ghotki Legacy'
  },
  {
    id: 'RAMZAN',
    name: 'Ramzan Mubarak',
    urduName: 'رمضان مبارک',
    primaryColor: '#065f46',
    accentColor: '#064e3b',
    emoji: '🌙',
    bannerText: 'Ramzan Kareem: Blessed Deals are here!'
  },
  {
    id: 'EID_FITR',
    name: 'Eid-ul-Fitr Mubarak',
    urduName: 'عید الفطر مبارک',
    primaryColor: '#9333ea',
    accentColor: '#7e22ce',
    emoji: '✨',
    bannerText: 'Celebrate Eid with Premium Collections'
  },
  {
    id: 'EID_ADHA',
    name: 'Eid-ul-Adha Mubarak',
    urduName: 'عید الاضحیٰ مبارک',
    primaryColor: '#b45309',
    accentColor: '#92400e',
    emoji: '🐑',
    bannerText: 'Sunnat-e-Ibrahimi: Special Eid Collection'
  },
  {
    id: 'FRIDAY',
    name: 'Jummah Mubarak',
    urduName: 'جمعہ مبارک',
    primaryColor: '#0369a1',
    accentColor: '#075985',
    emoji: '🕌',
    bannerText: 'Jummah Special: Blessed Friday Deals'
  },
  {
    id: 'INDEPENDENCE',
    name: '14 August Azadi Sale',
    urduName: 'یوم آزادی مبارک',
    primaryColor: '#15803d',
    accentColor: '#166534',
    emoji: '🇵🇰',
    bannerText: 'Happy Independence Day! Azadi Sale is LIVE'
  },
  {
    id: 'MILAAD',
    name: '12 Rabi-ul-Awal',
    urduName: 'جشنِ عید میلاد النبیﷺ',
    primaryColor: '#10b981',
    accentColor: '#059669',
    emoji: '🕌',
    bannerText: 'Blessings for the entire World'
  },
  {
    id: 'ALI_BIRTHDAY',
    name: 'Wiladat Maula Ali (as)',
    urduName: 'ولادتِ مولا علیؑ',
    primaryColor: '#1d4ed8',
    accentColor: '#1e40af',
    emoji: '🦁',
    bannerText: 'Ya Ali Madad! Celebrating the birth of Maula Ali (as)'
  },
  {
    id: 'PAKISTAN_DAY',
    name: '23 March',
    urduName: 'یومِ پاکستان',
    primaryColor: '#14532d',
    accentColor: '#15803d',
    emoji: '🇵🇰',
    bannerText: 'Resolution Day Sale'
  }
];

export const BAZAARS = [
  'Ghotki Ladies Bazar',
  'Sahee Bazar',
  'Main Bazar Ghotki',
  'Resham Gali',
];

export const CATEGORIES = [
  { id: 'women_clothes', name: "Women's Clothes", image_url: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=400' },
  { id: 'men_clothes', name: "Men's Clothes", image_url: 'https://images.unsplash.com/photo-1594932224828-b4b059bdbf6f?auto=format&fit=crop&q=80&w=400' },
  { id: 'men_footwear', name: "Men's Footwear", image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=400' },
  { id: 'women_footwear', name: "Women's Footwear", image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400' },
  { id: 'cosmetics', name: 'Cosmetics', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400' },
];

export const SUBSCRIPTION_PLANS = [
  { id: 'BASIC', price: 1000, label: 'Basic' },
  { id: 'STANDARD', price: 2500, label: 'Standard' },
  { id: 'PREMIUM', price: 5000, label: 'Premium' },
];

export const PLATFORM_FEE_PKR = 1000;
export const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3";
