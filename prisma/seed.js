const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Swift Cart database...");

  // 1. Create Default Admin
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { passwordHash: adminPasswordHash },
    create: {
      username: "admin",
      email: "admin@swiftcart.com",
      name: "Swift Cart Admin",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Admin created:", admin.username);

  // 2. Create Default Store Settings
  const defaultSettings = [
    { key: "store_name", value: "Swift Cart" },
    { key: "store_tagline", value: "Shop Smarter. Shop Faster." },
    { key: "contact_phone", value: "+8801925613994" },
    { key: "contact_email", value: "support@swiftcart.com" },
    { key: "store_address", value: "Chawkbazar, Chittagong, Bangladesh" },
    { key: "currency_symbol", value: "৳" },
    { key: "currency_code", value: "BDT" },
    { key: "delivery_inside_dhaka", value: "60" },
    { key: "delivery_outside_dhaka", value: "120" },
    { key: "free_delivery_threshold", value: "2500" },
    { key: "order_notice", value: "Fast delivery from Chawkbazar, Chittagong across all 64 districts. Cash on Delivery available." },
  ];

  for (const s of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("Store settings configured.");

  // 3. Create Categories
  const categoriesData = [
    {
      name: "Gadgets & Smart Devices",
      slug: "gadgets",
      description: "Next-gen smart wearables, wireless audio, and personal tech essentials.",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
      icon: "Watch",
      orderIndex: 1,
    },
    {
      name: "Electronics & Audio",
      slug: "electronics",
      description: "High-fidelity headphones, sound systems, and premium computer peripherals.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      icon: "Headphones",
      orderIndex: 2,
    },
    {
      name: "Fashion & Lifestyle",
      slug: "fashion",
      description: "Modern minimalist apparel, waterproof backpacks, and luxury streetwear.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      icon: "Shirt",
      orderIndex: 3,
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description: "Aesthetic workspace lighting, ergonomic accessories, and smart home tools.",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      icon: "Home",
      orderIndex: 4,
    },
    {
      name: "Beauty & Grooming",
      slug: "beauty-grooming",
      description: "Premium self-care, electric trimmers, and daily skincare routines.",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
      icon: "Sparkles",
      orderIndex: 5,
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "RFID leather wallets, polarized sunglasses, and durable phone cases.",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
      icon: "Glasses",
      orderIndex: 6,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log("Categories seeded:", Object.keys(categoryMap).length);

  // 4. Create Products
  const productsData = [
    {
      name: "Swift Sound Pro Wireless ANC Headphones",
      slug: "swift-sound-pro-wireless-anc-headphones",
      sku: "ELEC-HD-001",
      categoryId: categoryMap["electronics"],
      regularPrice: 4500,
      salePrice: 3850,
      stock: 45,
      isFeatured: true,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Experience supreme acoustic clarity with active noise cancellation, ultra-plush memory foam ear cushions, and 40-hour non-stop battery life. Designed for audiophiles, remote workers, and daily commuters who demand uncompromising wireless audio.",
      specifications: JSON.stringify({
        "Bluetooth Version": "5.3 with AAC/aptX",
        "Battery Life": "40 Hours (ANC on)",
        "Charging Port": "USB Type-C Fast Charge",
        "Driver Size": "40mm Neodymium Dynamic",
        Warranty: "1 Year Official Brand Warranty",
        "Box Contents": "Headphones, 3.5mm Aux Cable, Type-C Cable, Travel Pouch",
      }),
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "AuraFit Ultra Smart Watch (AMOLED 1.96-inch)",
      slug: "aurafit-ultra-smart-watch",
      sku: "GAD-SW-002",
      categoryId: categoryMap["gadgets"],
      regularPrice: 3200,
      salePrice: 2650,
      stock: 28,
      isFeatured: true,
      isNewArrival: true,
      status: "ACTIVE",
      description:
        "Elevate your fitness tracking with the AuraFit Ultra. Boasts a crystal-clear 1.96\" AMOLED display with Always-On support, Bluetooth calling, 24/7 heart-rate and SpO2 tracking, and 100+ sports modes wrapped in a sleek titanium-alloy frame.",
      specifications: JSON.stringify({
        Display: "1.96-inch AMOLED Curved (410x502)",
        "Water Resistance": "IP68 Water & Dust Resistant",
        Sensors: "Heart Rate, SpO2, Sleep, Pedometer",
        Compatibility: "Android 6.0+ & iOS 11.0+",
        Battery: "Up to 10 Days typical use",
        Warranty: "6 Months Replacement Warranty",
      }),
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "MagCharge 20000mAh 65W Fast Power Bank",
      slug: "magcharge-20000mah-65w-powerbank",
      sku: "GAD-PB-003",
      categoryId: categoryMap["gadgets"],
      regularPrice: 2800,
      salePrice: 2290,
      stock: 60,
      isFeatured: false,
      isNewArrival: true,
      status: "ACTIVE",
      description:
        "Charge your laptop, tablet, and smartphone concurrently at blazing speeds. Features Power Delivery 3.0, Quick Charge 4+, dual USB-C output, and an intuitive LED digital percentage display.",
      specifications: JSON.stringify({
        Capacity: "20,000mAh / 74Wh Li-Polymer",
        "Max Output": "65W via Type-C PD",
        Ports: "2x USB-C PD, 1x USB-A QC3.0",
        Protection: "Over-voltage, Short-circuit, Temperature Control",
        Weight: "385g",
      }),
      images: [
        "https://images.unsplash.com/photo-1609592424364-5bf230a1bfdc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Apex Mechanical Keyboard RGB (Hot-swappable)",
      slug: "apex-mechanical-keyboard-rgb",
      sku: "ELEC-KB-004",
      categoryId: categoryMap["electronics"],
      regularPrice: 4200,
      salePrice: 3499,
      stock: 15,
      isFeatured: true,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Designed for programmers, creators, and gamers. Premium aluminum top plate, factory-lubed linear red switches, PBT double-shot keycaps, south-facing per-key RGB backlighting, and triple-mode connectivity (2.4Ghz, BT 5.0, Type-C).",
      specifications: JSON.stringify({
        Layout: "75% Compact (82 Keys)",
        "Switch Type": "Gateron Pro Red (Hot-swap 3/5-pin)",
        Connectivity: "Tri-mode (Bluetooth / 2.4GHz / Type-C)",
        Keycaps: "PBT Dye-sub Cherry Profile",
        Battery: "4000mAh Rechargeable",
      }),
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "ErgoGlow Smart Desk Lamp with Wireless Charger",
      slug: "ergoglow-smart-desk-lamp",
      sku: "HOME-LP-005",
      categoryId: categoryMap["home-living"],
      regularPrice: 2200,
      salePrice: 1750,
      stock: 35,
      isFeatured: false,
      isNewArrival: true,
      status: "ACTIVE",
      description:
        "Illuminate your workstation with eye-caring, flicker-free LED light. 5 color temperatures, step-less touch dimming, flexible dual-axis hinge, and an integrated 15W Qi wireless charging pad at the base.",
      specifications: JSON.stringify({
        Power: "12W LED + 15W Qi Wireless Base",
        "Color Temp": "2700K - 6500K Stepless",
        CRI: "Ra > 95 (True Color Rendering)",
        Timer: "45-min Auto Shutoff Mode",
      }),
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Swift Minimalist Water-Resistant Everyday Backpack (22L)",
      slug: "swift-minimalist-everyday-backpack",
      sku: "FASH-BP-006",
      categoryId: categoryMap["fashion"],
      regularPrice: 2500,
      salePrice: 1990,
      stock: 40,
      isFeatured: true,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Engineered for urban everyday carry. Crafted from 900D water-repellent Oxford fabric with a dedicated padded 16\" MacBook sleeve, hidden anti-theft passport pocket, luggage strap, and ergonomic breathable shoulder pads.",
      specifications: JSON.stringify({
        Capacity: "22 Liters",
        "Laptop Compartment": "Fits up to 16-inch laptops",
        Material: "900D Oxford Polyester + YKK Zippers",
        Dimensions: "45 x 30 x 15 cm",
        Weight: "750g",
      }),
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Nordic Minimalist Ceramic Aroma Diffuser & Humidifier",
      slug: "nordic-ceramic-aroma-diffuser",
      sku: "HOME-DF-007",
      categoryId: categoryMap["home-living"],
      regularPrice: 1800,
      salePrice: 1450,
      stock: 22,
      isFeatured: false,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Transform your living space into a serene sanctuary. Ultrasonic technology quietly disperses essential oils and cool soothing mist with soft ambient warm LED lighting. Handcrafted ceramic matte finish.",
      specifications: JSON.stringify({
        "Tank Capacity": "300ml",
        Coverage: "Up to 300 sq. ft.",
        "Runtime": "8-10 Hours Continuous",
        "Auto-off": "Waterless Safety Shutoff",
      }),
      images: [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "BarberPro Precision Cordless Beard & Hair Trimmer",
      slug: "barberpro-precision-cordless-trimmer",
      sku: "BEAUTY-TR-008",
      categoryId: categoryMap["beauty-grooming"],
      regularPrice: 2100,
      salePrice: 1650,
      stock: 3, // Low stock indicator test
      isFeatured: false,
      isNewArrival: true,
      status: "ACTIVE",
      description:
        "Self-sharpening titanium ceramic blades give crisp lines and even fades without skin irritation. IPX7 waterproof for easy rinsing under tap, digital battery percentage screen, and 120 minutes cordless runtime.",
      specifications: JSON.stringify({
        Blades: "Titanium Ceramic T-Blade",
        Battery: "1200mAh Lithium-ion (120 Mins Run)",
        "Guide Combs": "1.5mm, 2mm, 3mm, 4mm included",
        Waterproof: "IPX7 Fully Washable",
      }),
      images: [
        "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Nomad Carbon Fiber RFID-Blocking Slim Wallet",
      slug: "nomad-carbon-fiber-rfid-wallet",
      sku: "ACC-WL-009",
      categoryId: categoryMap["accessories"],
      regularPrice: 1350,
      salePrice: 990,
      stock: 50,
      isFeatured: true,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Ditch your bulky bi-fold. Hold up to 12 credit cards and folded cash with integrated matte black spring money clip. Aerospace-grade 3K carbon fiber shields your sensitive cards from wireless RFID theft.",
      specifications: JSON.stringify({
        Material: "Genuine 3K Carbon Fiber + Elastic Band",
        Capacity: "1 to 12 Cards + Cash",
        Protection: "Military Grade RFID Blocking (13.56MHz)",
        Weight: "48 grams",
      }),
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "PulsePods True Wireless Earbuds with Dual Mic ENC",
      slug: "pulsepods-true-wireless-earbuds",
      sku: "ELEC-EB-010",
      categoryId: categoryMap["electronics"],
      regularPrice: 2200,
      salePrice: 1790,
      stock: 35,
      isFeatured: true,
      isNewArrival: true,
      status: "ACTIVE",
      description:
        "Punchy bass with 13mm dynamic drivers and crystal clear calls powered by dual-mic Environmental Noise Cancellation (ENC). Ultra-low 45ms latency gaming mode and sweat-proof IPX5 build.",
      specifications: JSON.stringify({
        Driver: "13mm Titanium Composite Diaphragm",
        Latency: "45ms Low Latency Game Mode",
        Playtime: "7h Earbuds + 28h Case",
        "Bluetooth": "v5.3 Instant Pair",
      }),
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Polarized Aviator Sunglasses (UV400 Protection)",
      slug: "polarized-aviator-sunglasses-uv400",
      sku: "ACC-SG-011",
      categoryId: categoryMap["accessories"],
      regularPrice: 1200,
      salePrice: 850,
      stock: 25,
      isFeatured: false,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Timeless tear-drop aviator design with TAC polarized lenses that eliminate glare and block 100% harmful UVA/UVB rays. Ultra-light alloy frame with silicone nose pads for all-day comfort.",
      specifications: JSON.stringify({
        Lenses: "TAC Polarized Tri-Acetate Cellulose",
        UV: "UV400 Category 3 Protection",
        Frame: "Corrosion Resistant Lightweight Alloy",
        Includes: "Hard Protective Case & Microfiber Cloth",
      }),
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Ultra-Fast 100W GaN Dual USB-C Wall Charger",
      slug: "ultra-fast-100w-gan-dual-charger",
      sku: "GAD-CH-012",
      categoryId: categoryMap["gadgets"],
      regularPrice: 2400,
      salePrice: 1850,
      stock: 0, // OUT OF STOCK TEST PRODUCT
      isFeatured: false,
      isNewArrival: false,
      status: "ACTIVE",
      description:
        "Powered by Gallium Nitride (GaN III) semiconductor tech. Compact form factor 45% smaller than original chargers, with intelligent power allocation between two Type-C and one USB-A ports.",
      specifications: JSON.stringify({
        Technology: "GaN III Semiconductor",
        Total: "100W Max Output",
        Ports: "2x USB-C (100W/65W) + 1x USB-A (30W)",
        Compatibility: "MacBook Pro, iPhone, Samsung, iPad",
      }),
      images: [
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ];

  for (const prod of productsData) {
    const { images, ...data } = prod;
    const createdProduct = await prisma.product.upsert({
      where: { sku: data.sku },
      update: data,
      create: data,
    });

    // Delete existing images and re-add
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: images[i],
          isPrimary: i === 0,
          orderIndex: i,
        },
      });
    }
  }
  console.log("Products seeded:", productsData.length);

  // 5. Customer & Order data starts clean for real business operations

  // 6. Create Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      description: "10% Discount for New Shoppers across Bangladesh",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscountAmount: 500,
      isActive: true,
      usageLimit: 1000,
    },
    update: { isActive: true },
  });

  await prisma.coupon.upsert({
    where: { code: "SWIFT100" },
    create: {
      code: "SWIFT100",
      description: "Flat ৳100 Off on orders above ৳1,500",
      discountType: "FIXED",
      discountValue: 100,
      minOrderAmount: 1500,
      isActive: true,
      usageLimit: 500,
    },
    update: { isActive: true },
  });
  console.log("Coupons seeded: WELCOME10, SWIFT100");

  // 7. Create Hero Banners
  const existingBanners = await prisma.banner.count();
  if (existingBanners === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: "Next-Gen Sound & Audio Gear",
          subtitle: "Experience unmatched clarity with our authentic active noise cancelling collection.",
          badge: "LIMITED TIME OFFER",
          buttonText: "Explore Audio",
          buttonLink: "/category/electronics",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
          section: "HERO",
          orderIndex: 1,
          isActive: true,
        },
        {
          title: "Smart Living. Connected World.",
          subtitle: "Smartwatches, fitness trackers, and wearables with 1-Year Official Replacement Warranty.",
          badge: "NEW ARRIVALS 2026",
          buttonText: "Shop Wearables",
          buttonLink: "/category/gadgets",
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
          section: "HERO",
          orderIndex: 2,
          isActive: true,
        },
      ],
    });
    console.log("Hero banners seeded.");
  }

  // 8. Create Shipping Zones
  const existingZones = await prisma.shippingZone.count();
  if (existingZones === 0) {
    await prisma.shippingZone.createMany({
      data: [
        {
          name: "Inside Dhaka City",
          fee: 60,
          estimatedDelivery: "24 - 48 Hours",
          isActive: true,
          isDefault: true,
        },
        {
          name: "Outside Dhaka / Nationwide",
          fee: 120,
          estimatedDelivery: "2 - 4 Business Days",
          isActive: true,
          isDefault: false,
        },
      ],
    });
    console.log("Shipping zones seeded.");
  }

  console.log("Swift Cart database seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
