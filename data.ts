import { Shop, Product } from './types';

// Baseline mock shops
const BASE_SHOPS: Shop[] = [
  {
    id: 's1',
    owner_id: 'u_owner_zubeda',
    subscription_tier: 'STANDARD',
    name: 'Zubeda Boutique',
    ownerName: 'Zubeda Khan',
    mobile: '03001234567',
    whatsapp: '923001234567',
    bazaar: 'Ghotki Ladies Bazar',
    address: 'Shop 42, Ghotki Ladies Bazar',
    category: 'Fashion & Clothing',
    city: 'Ghotki',
    logo: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800',
    bio: 'Premium traditional wear for the modern woman of Ghotki.',
    status: 'APPROVED',
    registration_paid: true,
    featured: true,
  },
  {
    id: 's_j',
    owner_id: 'u_owner_j',
    subscription_tier: 'BASIC',
    name: 'J. Boutique',
    ownerName: 'Junaid Jamshed',
    mobile: '03112223334',
    whatsapp: '923112223334',
    bazaar: 'Main Bazar Ghotki',
    address: 'Plaza 5, Main Bazar',
    category: 'Fashion & Clothing',
    city: 'Ghotki',
    logo: 'https://images.unsplash.com/photo-1594465911325-1e42f9d37536?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=800',
    bio: 'Soully East - Premium unstitched and ready-to-wear collections.',
    status: 'APPROVED',
    registration_paid: true,
    featured: false,
  },
  {
    id: 's_kapeel',
    owner_id: 'u_owner_kapeel',
    subscription_tier: 'PREMIUM',
    name: 'Kapeel Dass Footwear',
    ownerName: 'Kapeel Dass',
    mobile: '03019876543',
    whatsapp: '923019876543',
    bazaar: 'Resham Gali',
    address: 'Main Gate, Resham Gali, Ghotki',
    category: 'Shoes & Accessories',
    city: 'Ghotki',
    logo: 'https://images.unsplash.com/photo-1594465911325-1e42f9d37536?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    bio: 'Authentic handcrafted Sindhi sandals and mojris.',
    status: 'APPROVED',
    registration_paid: true,
    featured: true,
  }
];

const BASE_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    shopId: 's1', 
    name: 'Pure Silk Shalwar Kameez', 
    description: 'Elegant hand-embroidered pure silk suit.', 
    price: 4500, 
    category: 'Fashion & Clothing', 
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=600'], 
    tags: ['New'], 
    stock: 10,
    location_city: 'Ghotki'
  },
  { 
    id: 'p_j1', 
    shopId: 's_j', 
    name: 'J. Floral Lawn 24', 
    description: 'Premium summer lawn collection with digital prints.', 
    price: 6800, 
    category: 'Fashion & Clothing', 
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Trending'], 
    stock: 40,
    location_city: 'Ghotki'
  },
  { 
    id: 'ps1', 
    shopId: 's_kapeel', 
    name: 'Ghotki Mirror Sandals', 
    description: 'Classic handcrafted sandals with authentic mirror work.', 
    price: 2200, 
    category: 'Shoes & Accessories', 
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600'], 
    tags: ['Best Seller'], 
    stock: 25,
    location_city: 'Ghotki'
  }
];

// GENERATE 5 SUKKUR SHOPS PER CATEGORY + 5 PRODUCTS PER SHOP
const SUKKUR_CATEGORIES_DATA = [
  {
    category: 'Cars & Vehicles',
    bazaars: ['Bandar Road Sukkur', 'Military Road Sukkur', 'Minara Road Sukkur', 'Shahi Bazar Sukkur', 'Station Road Sukkur'],
    shops: [
      { name: 'Sukkur Motors & Auto Trade', owner: 'Tariq Mahar', bio: 'Best deals on imported and local cars in Sukkur.' },
      { name: 'Mehran Auto Traders Sukkur', owner: 'Sajjad Soomro', bio: 'New and used motorbikes and commercial trucks.' },
      { name: 'Royal Indus Car Showroom', owner: 'Farhan Sheikh', bio: 'Verified luxury & family sedans in Bandar Road.' },
      { name: 'Sukkur Bike Palace', owner: 'Nadir Ali', bio: 'Honda & Yamaha genuine motorbikes and spare parts.' },
      { name: 'Sindh Auto Parts & Tyres', owner: 'Ghulam Rasool', bio: 'Original auto spare parts, tyres and car audio.' }
    ],
    products: [
      { name: 'Toyota Corolla GLi 2021 Mint', price: 3850000, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600', sub: 'Cars' },
      { name: 'Honda Civic X 1.8 i-VTEC', price: 4600000, img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=600', sub: 'Cars' },
      { name: 'Honda CD 70 2024 Model', price: 158000, img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600', sub: 'Motorcycles' },
      { name: 'Suzuki Alto VXR Automatic', price: 2750000, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600', sub: 'Cars' },
      { name: 'Tubeless Alloy Wheel Set 15"', price: 45000, img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600', sub: 'Tyres' }
    ]
  },
  {
    category: 'Mobiles & Electronics',
    bazaars: ['Minara Road Sukkur', 'Clock Tower Sukkur', 'Shahi Bazar Sukkur', 'Station Road Sukkur', 'Bagh Hayat Ali Shah Sukkur'],
    shops: [
      { name: 'Sukkur Mobile Zone', owner: 'Kamran Memon', bio: 'Authorized smartphones, iPhones and accessories.' },
      { name: 'Sindh Electronics & Appliances', owner: 'Zahid Hussain', bio: 'Refrigerators, ACs, LED TVs and Home Theatre.' },
      { name: 'Apple & Android Care Sukkur', owner: 'Shahzaib Kalhoro', bio: 'Latest iPhones, Samsung Galaxy & Tablet deals.' },
      { name: 'Minara Telecom & Laptops', owner: 'Asadullah Shah', bio: 'Laptops, computers and smartphone repairs.' },
      { name: 'Indus Digital World', owner: 'Bilal Ahmed', bio: 'Smart watches, airpods and high quality gadget station.' }
    ],
    products: [
      { name: 'iPhone 15 Pro Max 256GB PTA Approved', price: 465000, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600', sub: 'New Mobile Phones' },
      { name: 'Samsung Galaxy S24 Ultra 5G', price: 395000, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600', sub: 'New Mobile Phones' },
      { name: 'Inverex 1.5 Ton Inverter AC', price: 145000, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600', sub: 'Air Conditioners' },
      { name: 'HP Victus Gaming Laptop i7 13th Gen', price: 235000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600', sub: 'Laptops' },
      { name: 'Dawlance 55" 4K Smart Android LED TV', price: 115000, img: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=600', sub: 'TVs' }
    ]
  },
  {
    category: 'Fashion & Clothing',
    bazaars: ['Shahi Bazar Sukkur', 'Frere Road Sukkur', 'Gharibabad Sukkur', 'Minara Road Sukkur', 'Clock Tower Sukkur'],
    shops: [
      { name: 'Al-Madina Fabrics Sukkur', owner: 'Maqbool Abro', bio: 'Branded lawn suits, bridal wear and designer silks.' },
      { name: 'Sukkur Silk & Embroidery House', owner: 'Sanaullah Mirani', bio: 'Pure Sindhi ralli, hand embroidered suits & dupattas.' },
      { name: 'Royal Men Collection Sukkur', owner: 'Imran Ali', bio: 'Gentlemen waistcoats, sherwanis and cotton suits.' },
      { name: 'Khatoon Boutique Sukkur', owner: 'Nasreen Channa', bio: 'Latest party dresses, abayas, hijabs and formal suits.' },
      { name: 'Shahi Bazar Garments', owner: 'Waseem Kazi', bio: 'Unstitched ladies cloth and ready-to-wear dresses.' }
    ],
    products: [
      { name: 'Hand Embroidered Sindhi Ralli Suit', price: 5500, img: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=600', sub: 'Ladies Clothing' },
      { name: 'Designer Lawn 3-Piece Unstitched', price: 4200, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=600', sub: 'Suits' },
      { name: 'Men Premium Wash & Wear Cotton Kurta', price: 3200, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600', sub: 'Men Clothing' },
      { name: 'Bridal Velvet Heavy Suit', price: 18500, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600', sub: 'Wedding Dresses' },
      { name: 'Silk Abaya with Embroidered Hijab', price: 4800, img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=600', sub: 'Abayas' }
    ]
  },
  {
    category: 'Shoes & Accessories',
    bazaars: ['Shahi Bazar Sukkur', 'Minara Road Sukkur', 'Station Road Sukkur', 'Clock Tower Sukkur', 'Frere Road Sukkur'],
    shops: [
      { name: 'Sukkur Footwear & Chappal House', owner: 'Khalid Bhatti', bio: 'Handcrafted traditional Sindhi Kheri and Khussa.' },
      { name: 'Step-In Shoes Sukkur', owner: 'Shoaib Baloch', bio: 'Branded sports shoes, sneakers and formal oxfords.' },
      { name: 'Chaman Ladies Shoes & Bags', owner: 'Farzana Parveen', bio: 'Bridal heels, pumps, leather handbags and purses.' },
      { name: 'Royal Leather & Accessories', owner: 'Javed Solangi', bio: 'Genuine leather wallets, belts and travel bags.' },
      { name: 'Classic Khussa Palace Sukkur', owner: 'Kashif Indhar', bio: 'Hand-made tilla and mirror work khussas.' }
    ],
    products: [
      { name: 'Handmade Sindhi Tilla Khussa', price: 2800, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600', sub: 'Ladies Shoes' },
      { name: 'Leather Peshawari Chappal Black', price: 3500, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600', sub: 'Men Shoes' },
      { name: 'Men Genuine Leather Belt & Wallet Set', price: 2200, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600', sub: 'Wallets' },
      { name: 'Sports Joggers Ultra Lightweight', price: 3900, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', sub: 'Sports Shoes' },
      { name: 'Bridal Handbag with Pearl Strap', price: 3100, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600', sub: 'Bags' }
    ]
  },
  {
    category: 'Jewelry & Beauty',
    bazaars: ['Saraf Bazar Sukkur', 'Shahi Bazar Sukkur', 'Frere Road Sukkur', 'Minara Road Sukkur', 'Clock Tower Sukkur'],
    shops: [
      { name: 'Sukkur Saraf Jewellers', owner: 'Seth Kishor Kumar', bio: '22K Gold jewelry, Kundan, Polki & silver rings.' },
      { name: 'Al-Raza Beauty & Cosmetics', owner: 'Rehana Syed', bio: 'Imported makeup, skincare and original perfumes.' },
      { name: 'Mehran Jewelry House', owner: 'Danish Junejo', bio: 'Bridal artificial sets, chokers and bangles.' },
      { name: 'Fragrance World Sukkur', owner: 'Hamza Al-Ghamdi', bio: 'Attar, Oudh and international branded perfumes.' },
      { name: 'Kundan & Zircon Palace', owner: 'Anil Kumar', bio: 'Exquisite party jewelry and bridal accessories.' }
    ],
    products: [
      { name: 'Bridal Kundan Necklace Set 22K Design', price: 12500, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=600', sub: 'Artificial Jewelry' },
      { name: 'Royal Oudh & Amber Perfume 100ml', price: 4500, img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', sub: 'Perfumes' },
      { name: 'Gold Plated Traditional Jhumkas', price: 2400, img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600', sub: 'Gold Jewelry' },
      { name: 'Huda Beauty Palette & Lipstick Kit', price: 3800, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600', sub: 'Makeup' },
      { name: 'Organic Glow Skincare Facial Set', price: 2900, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600', sub: 'Skincare' }
    ]
  },
  {
    category: 'Property & Real Estate',
    bazaars: ['Bagh Hayat Ali Shah Sukkur', 'Military Road Sukkur', 'Airport Road Sukkur', 'Bandar Road Sukkur', 'Queens Road Sukkur'],
    shops: [
      { name: 'Sukkur Estate & Builders', owner: 'Chaudhry Rashid', bio: 'Houses, plots and commercial property buy & sell.' },
      { name: 'Indus Real Estate Consultants', owner: 'Tariq Hussain Shah', bio: 'Shops for rent & agricultural land near Sukkur Barrage.' },
      { name: 'Mehran Property Network', owner: 'Sikandar Mangnejo', bio: 'Residential bungalows and modern apartment projects.' },
      { name: 'Bandar Road Commercial Hub', owner: 'Manzoor Jatoi', bio: 'Prime commercial plots & showroom locations in Sukkur.' },
      { name: 'Greenfields Agricultural Land Agency', owner: 'Ali Nawaz Buriro', bio: 'Agricultural farmland and tube-well land deals.' }
    ],
    products: [
      { name: '120 Sq Yd Modern House for Sale - Sukkur', price: 14500000, img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600', sub: 'Houses for Sale' },
      { name: 'Commercial Shop for Rent - Minara Road', price: 45000, img: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&q=80&w=600', sub: 'Shops for Rent' },
      { name: '5 Marla Residential Plot in Sukkur Township', price: 3800000, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600', sub: 'Plots' },
      { name: '10 Acres Fertile Agricultural Land', price: 22000000, img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600', sub: 'Agricultural Land' },
      { name: 'Luxury 3-Bed Apartment Near Airport Road', price: 9200000, img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600', sub: 'Houses for Sale' }
    ]
  },
  {
    category: 'Furniture & Home',
    bazaars: ['Station Road Sukkur', 'Shahi Bazar Sukkur', 'Military Road Sukkur', 'Minara Road Sukkur', 'Bandar Road Sukkur'],
    shops: [
      { name: 'Sukkur Woodcraft & Furniture', owner: 'Ustad Habibullah', bio: 'Solid Sheesham wood bridal sets, beds & wardrobes.' },
      { name: 'Royal Comfort Sofa & Bedding', owner: 'Mukhtiar Panhwar', bio: 'Modern L-shape sofas, dining sets & mattresses.' },
      { name: 'Indus Home Decor & Lighting', owner: 'Zia-ur-Rehman', bio: 'Chandeliers, wall clocks, rugs & curtains.' },
      { name: 'Chinioti Furniture Showroom Sukkur', owner: 'Mian Zubair', bio: 'Carved wooden beds, royal chairs & tables.' },
      { name: 'Smart Office & Home Furniture', owner: 'Noman Siddiqui', bio: 'Office chairs, study desks and metal cupboards.' }
    ],
    products: [
      { name: 'Pure Sheesham Wood King Bridal Bed Set', price: 125000, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600', sub: 'Beds' },
      { name: 'Luxury 7-Seater Fabric Sofa Set', price: 85000, img: 'https://images.unsplash.com/photo-1550581190-9c1c08221252?auto=format&fit=crop&q=80&w=600', sub: 'Sofas' },
      { name: '6-Chair Dining Table Sheesham Finish', price: 65000, img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=600', sub: 'Tables' },
      { name: 'Modern 3-Door Wooden Cupboard', price: 42000, img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600', sub: 'Cupboards' },
      { name: 'Crystal Chandelier for Drawing Room', price: 18500, img: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600', sub: 'Home Decoration' }
    ]
  },
  {
    category: 'Agriculture & Livestock',
    bazaars: ['Cattle Market Sukkur', 'Gharibabad Sukkur', 'Shahi Bazar Sukkur', 'Station Road Sukkur', 'Bagh Hayat Ali Shah Sukkur'],
    shops: [
      { name: 'Sukkur Livestock Farm & Dairy', owner: 'Haji Gul Hasan', bio: 'Sahiwal cows, Nili-Ravi buffaloes and Kamori goats.' },
      { name: 'Indus Solar & Agri Pumps Sukkur', owner: 'Engineer Riaz', bio: 'Solar tubewells, water pumps & agricultural systems.' },
      { name: 'Sindh Fertilizer & Seed Store', owner: 'Allah Bux Pitafi', bio: 'High quality wheat, cotton seeds & fertilizers.' },
      { name: 'Sukkur Tractor & Implement Mart', owner: 'Khadim Hussain', bio: 'Millat & Fiat tractor implements, harrows & cultivators.' },
      { name: 'Mahananda Organic Farm & Feed', owner: 'Ghulam Mustafa', bio: 'Dairy cattle feed, mineral mixtures & farming supplies.' }
    ],
    products: [
      { name: 'Pure Sahiwal Heavy Breed Cow (15L Milk)', price: 320000, img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600', sub: 'Cows' },
      { name: 'Kamori Goat Pair - Eid Specimen', price: 145000, img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=600', sub: 'Goats' },
      { name: '10HP Solar Water Pump System for Tubewell', price: 480000, img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=600', sub: 'Solar Systems' },
      { name: 'Nili Ravi Dairy Buffalo High Milk Yield', price: 380000, img: 'https://images.unsplash.com/photo-1570042707223-2895f540702c?auto=format&fit=crop&q=80&w=600', sub: 'Buffaloes' },
      { name: 'Wheat Certified Seeds (50kg Bag)', price: 6500, img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600', sub: 'Seeds' }
    ]
  },
  {
    category: 'General Products',
    bazaars: ['Shahi Bazar Sukkur', 'Minara Road Sukkur', 'Frere Road Sukkur', 'Clock Tower Sukkur', 'Station Road Sukkur'],
    shops: [
      { name: 'Sukkur Mart & Grocery Store', owner: 'Waqas Malik', bio: 'Imported groceries, spices, rice and dry fruits.' },
      { name: 'Gift Corner & Toy Land Sukkur', owner: 'Aamir Shehzad', bio: 'Kids toys, school bags, stationery & custom gift sets.' },
      { name: 'Indus Kitchen & Houseware', owner: 'Rashid Khan', bio: 'Non-stick cookware, crockeries and kitchen utensils.' },
      { name: 'Sports City Sukkur', owner: 'Adnan Akram', bio: 'Cricket bats, footballs, badminton rackets & fitness gear.' },
      { name: 'Super Discount Grocery Sukkur', owner: 'Nadeem Ahmed', bio: 'Wholesale prices on daily household items.' }
    ],
    products: [
      { name: 'Royal Kernel Basmati Rice 10kg Premium', price: 3800, img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600', sub: 'Grocery' },
      { name: 'Non-Stick Cookware Set 12 Pieces', price: 11500, img: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600', sub: 'Kitchen Items' },
      { name: 'CA English Willow Cricket Bat Grade 1', price: 16500, img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600', sub: 'Sports Items' },
      { name: 'Rechargeable Electric Toy Car for Kids', price: 28500, img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600', sub: 'Toys' },
      { name: 'Executive Pen & Journal Gift Box Set', price: 2400, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', sub: 'Gifts' }
    ]
  },
  {
    category: 'Jobs & Services',
    bazaars: ['Minara Road Sukkur', 'Military Road Sukkur', 'Station Road Sukkur', 'Bandar Road Sukkur', 'Queens Road Sukkur'],
    shops: [
      { name: 'Sukkur Event & Wedding Planners', owner: 'Sameer Abbasi', bio: 'Catering, stage decoration & sound setup for events.' },
      { name: 'Master Electrical & Solar Services', owner: 'Ustad Mukhtar', bio: 'Certified home electrician, AC repair & solar installer.' },
      { name: 'Sindh Car Rental & Transport Sukkur', owner: 'Zulfiqar Ali', bio: 'Coaster, Prado, Corolla car hire with driver.' },
      { name: 'Sukkur Media & Studio Photography', owner: 'Faizan Ahmed', bio: 'Wedding video reels, drone cinematography & portraits.' },
      { name: 'Expert Tailoring & Alteration Studio', owner: 'Master Shamsuddin', bio: 'Gentlemen suit tailoring & urgent alterations.' }
    ],
    products: [
      { name: 'Complete Wedding Hall Decoration Package', price: 85000, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600', sub: 'Event Services' },
      { name: 'Full HD Wedding Cinematic Video & Drone', price: 65000, img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=600', sub: 'Photographers' },
      { name: 'Toyota Prado Rental with Driver (Per Day)', price: 18000, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600', sub: 'Car Rental' },
      { name: 'Solar Panel Installation & Maintenance Service', price: 15000, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600', sub: 'Electricians' },
      { name: 'Master Bespoke 3-Piece Suit Stitching Service', price: 7500, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600', sub: 'Tailors' }
    ]
  }
];

// GENERATE 5 SHOPS PER CATEGORY AND 5 PRODUCTS PER SHOP FOR SUKKUR
const GENERATED_SUKKUR_SHOPS: Shop[] = [];
const GENERATED_SUKKUR_PRODUCTS: Product[] = [];

SUKKUR_CATEGORIES_DATA.forEach((catGroup, catIdx) => {
  catGroup.shops.forEach((shopItem, shopIdx) => {
    const shopId = `sukkur_s_${catIdx + 1}_${shopIdx + 1}`;
    const bazaar = catGroup.bazaars[shopIdx % catGroup.bazaars.length];
    
    // Create Shop
    GENERATED_SUKKUR_SHOPS.push({
      id: shopId,
      owner_id: `u_sukkur_${catIdx + 1}_${shopIdx + 1}`,
      name: shopItem.name,
      ownerName: shopItem.owner,
      mobile: `0300${1000000 + catIdx * 10000 + shopIdx * 1111}`,
      whatsapp: `92300${1000000 + catIdx * 10000 + shopIdx * 1111}`,
      bazaar: bazaar,
      address: `${bazaar}, Shop #${shopIdx * 10 + 12}, Sukkur`,
      category: catGroup.category,
      city: 'Sukkur',
      logo: catGroup.products[shopIdx % catGroup.products.length].img,
      banner: catGroup.products[(shopIdx + 1) % catGroup.products.length].img,
      bio: shopItem.bio,
      status: 'APPROVED',
      registration_paid: true,
      featured: shopIdx === 0,
      is_top_seller: shopIdx < 2,
      subscription_tier: shopIdx === 0 ? 'PREMIUM' : 'STANDARD',
      sort_priority: 10 + (shopIdx === 0 ? 5 : 0)
    });

    // Create 5 Products for this Shop
    catGroup.products.forEach((prodItem, prodIdx) => {
      GENERATED_SUKKUR_PRODUCTS.push({
        id: `sukkur_p_${catIdx + 1}_${shopIdx + 1}_${prodIdx + 1}`,
        shopId: shopId,
        name: `${prodItem.name} ${prodIdx > 0 ? `#${prodIdx + 1}` : ''}`,
        description: `High quality item from ${shopItem.name} in Sukkur. Verified condition and competitive pricing.`,
        price: Math.round(prodItem.price * (1 + (prodIdx * 0.08 - 0.1))),
        category: catGroup.category,
        subcategory: prodItem.sub,
        images: [prodItem.img],
        tags: prodIdx === 0 ? ['Best Seller'] : prodIdx === 1 ? ['Trending'] : ['New'],
        stock: 15 + prodIdx * 5,
        location_city: 'Sukkur',
        status: 'APPROVED',
        is_new_arrival: true,
        sort_priority: 5 + prodIdx
      });
    });
  });
});

export const MOCK_SHOPS: Shop[] = [...BASE_SHOPS, ...GENERATED_SUKKUR_SHOPS];
export const MOCK_PRODUCTS: Product[] = [...BASE_PRODUCTS, ...GENERATED_SUKKUR_PRODUCTS];
