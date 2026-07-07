import type {
  Sport,
  Venue,
  Court,
  PricingRule,
  Area,
  VenueOwner,
} from "./types/domain";

// ── Areas ──
export const mockAreas: Area[] = [
  {
    id: "area-jaksel-1",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Kebayoran Baru",
    village: "Selong",
    slug: "jaksel-kebayoran-selong",
    label: "DKI Jakarta > Jakarta Selatan > Kebayoran Baru > Selong",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "area-jaksel-2",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Pancoran",
    village: "Duren Tiga",
    slug: "jaksel-pancoran-duren-tiga",
    label: "DKI Jakarta > Jakarta Selatan > Pancoran > Duren Tiga",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "area-jakpus-1",
    province: "DKI Jakarta",
    city: "Jakarta Pusat",
    district: "Menteng",
    village: "Menteng",
    slug: "jakpus-menteng-menteng",
    label: "DKI Jakarta > Jakarta Pusat > Menteng > Menteng",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "area-bdg-1",
    province: "Jawa Barat",
    city: "Bandung",
    district: "Coblong",
    village: "Dago",
    slug: "bandung-coblong-dago",
    label: "Jawa Barat > Bandung > Coblong > Dago",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "area-bdg-2",
    province: "Jawa Barat",
    city: "Bandung",
    district: "Sukajadi",
    village: "Pasteur",
    slug: "bandung-sukajadi-pasteur",
    label: "Jawa Barat > Bandung > Sukajadi > Pasteur",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "area-bdg-kota",
    province: "Jawa Barat",
    city: "Bandung",
    district: "Kota Bandung",
    village: "Bandung",
    slug: "bandung-kota",
    label: "Jawa Barat > Bandung > Kota Bandung > Bandung",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "area-surabaya-1",
    province: "Jawa Timur",
    city: "Surabaya",
    district: "Gubeng",
    village: "Airlangga",
    slug: "surabaya-gubeng-airlangga",
    label: "Jawa Timur > Surabaya > Gubeng > Airlangga",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

// ── Venue Owners ──
export const mockVenueOwners: VenueOwner[] = [
  {
    id: "owner-1",
    adminId: "admin-1",
    businessName: "Arena Sports Group",
    picName: "Budi Santoso",
    phone: "081234567890",
    email: "budi@arena.com",
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "owner-2",
    adminId: "admin-2",
    businessName: "Greenfield Sports",
    picName: "Sari Dewi",
    phone: "081298765432",
    email: "sari@greenfield.com",
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "owner-3",
    adminId: "owner-3",
    businessName: "Dago Sports Center",
    picName: "Andi Pratama",
    phone: "081355667788",
    email: "andi@dagosports.com",
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "owner-4",
    adminId: "owner-4",
    businessName: "Surabaya Arena Mandiri",
    picName: "Rina Kusuma",
    phone: "081477889900",
    email: "rina@surabayaarena.com",
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

// ── Sports ──
export const mockSports: Sport[] = [
  { id: "sport-futsal", name: "Futsal", slug: "futsal", isActive: true },
  { id: "sport-minisoccer", name: "Minisoccer", slug: "minisoccer", isActive: true },
  { id: "sport-badminton", name: "Badminton", slug: "badminton", isActive: true },
  { id: "sport-padel", name: "Padel", slug: "padel", isActive: true },
  { id: "sport-tenis", name: "Tenis", slug: "tenis", isActive: true },
  { id: "sport-basket", name: "Basket", slug: "basket", isActive: true },
];

// ── Venues (distributed across ALL areas) ──
export const mockVenues: Venue[] = [
  // ── area-jaksel-1: Kebayoran Baru, Selong ──
  {
    id: "venue-selong-futsal",
    name: "Selong Futsal Arena",
    slug: "selong-futsal-arena",
    address: "Jl. Kramat Raya No. 22, Kebayoran Baru, Jakarta Selatan",
    mapsUrl: "https://maps.google.com",
    phone: "081211112222",
    openTime: "06:00",
    closeTime: "23:00",
    isActive: true,
    ownerId: "owner-1",
    areaId: "area-jaksel-1",
    approvalStatus: "active",
  },

  // ── area-jaksel-2: Pancoran, Duren Tiga ──
  {
    id: "venue-arena1",
    name: "Arena Sport Center",
    slug: "arena-sport-center",
    address: "Jl. Sudirman No. 123, Pancoran, Jakarta Selatan",
    mapsUrl: "https://maps.google.com",
    phone: "081234567890",
    openTime: "06:00",
    closeTime: "23:00",
    isActive: true,
    ownerId: "owner-1",
    areaId: "area-jaksel-2",
    approvalStatus: "active",
  },

  // ── area-jakpus-1: Menteng ──
  {
    id: "venue-greenfield",
    name: "Greenfield Arena",
    slug: "greenfield-arena",
    address: "Jl. Gatot Subroto No. 45, Menteng, Jakarta Pusat",
    mapsUrl: "https://maps.google.com",
    phone: "081298765432",
    openTime: "07:00",
    closeTime: "22:00",
    isActive: true,
    ownerId: "owner-2",
    areaId: "area-jakpus-1",
    approvalStatus: "active",
  },

  // ── area-bdg-1: Coblong, Dago ──
  {
    id: "venue-dago-sport",
    name: "Dago Sports Complex",
    slug: "dago-sports-complex",
    address: "Jl. Ir. H. Djuanda No. 88, Dago, Coblong, Bandung",
    mapsUrl: "https://maps.google.com",
    phone: "022-2501234",
    openTime: "06:00",
    closeTime: "23:00",
    isActive: true,
    ownerId: "owner-3",
    areaId: "area-bdg-1",
    approvalStatus: "active",
  },

  // ── area-bdg-2: Sukajadi, Pasteur ──
  {
    id: "venue-pasteur-arena",
    name: "Pasteur Sports Arena",
    slug: "pasteur-sports-arena",
    address: "Jl. Pasteur No. 55, Sukajadi, Bandung",
    mapsUrl: "https://maps.google.com",
    phone: "022-2034567",
    openTime: "07:00",
    closeTime: "22:00",
    isActive: true,
    ownerId: "owner-3",
    areaId: "area-bdg-2",
    approvalStatus: "active",
  },

  // ── area-bdg-kota: Kota Bandung ──
  {
    id: "venue-bdg",
    name: "Lapangan Bandung Sport",
    slug: "bandung-sport",
    address: "Jl. Merdeka No. 10, Kota Bandung",
    mapsUrl: "https://maps.google.com",
    phone: "022-1234567",
    openTime: "06:00",
    closeTime: "23:00",
    isActive: true,
    ownerId: "owner-1",
    areaId: "area-bdg-kota",
    approvalStatus: "active",
  },

  // ── area-surabaya-1: Gubeng, Airlangga ──
  {
    id: "venue-surabaya-arena",
    name: "Airlangga Sport Center",
    slug: "airlangga-sport-center",
    address: "Jl. Airlangga No. 30, Gubeng, Surabaya",
    mapsUrl: "https://maps.google.com",
    phone: "031-5012345",
    openTime: "06:00",
    closeTime: "23:00",
    isActive: true,
    ownerId: "owner-4",
    areaId: "area-surabaya-1",
    approvalStatus: "active",
  },
];

// ── Courts (distributed across all venues) ──
export const mockCourts: Court[] = [
  // ══════════════════════════════════════════
  // venue-selong-futsal (area-jaksel-1)
  // ══════════════════════════════════════════
  {
    id: "court-selong-f1",
    venueId: "venue-selong-futsal",
    sportId: "sport-futsal",
    name: "Futsal Court A",
    slug: "futsal-court-a",
    surfaceType: "Sintetis",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 140000,
    isActive: true,
  },
  {
    id: "court-selong-f2",
    venueId: "venue-selong-futsal",
    sportId: "sport-futsal",
    name: "Futsal Court B",
    slug: "futsal-court-b",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 120000,
    isActive: true,
  },
  {
    id: "court-selong-b1",
    venueId: "venue-selong-futsal",
    sportId: "sport-badminton",
    name: "Badminton 1",
    slug: "badminton-1",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 80000,
    isActive: true,
  },

  // ══════════════════════════════════════════
  // venue-arena1 (area-jaksel-2)
  // ══════════════════════════════════════════
  {
    id: "court-f1",
    venueId: "venue-arena1",
    sportId: "sport-futsal",
    name: "Futsal A",
    slug: "futsal-a",
    surfaceType: "Sintetis",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 150000,
    isActive: true,
  },
  {
    id: "court-f2",
    venueId: "venue-arena1",
    sportId: "sport-futsal",
    name: "Futsal B",
    slug: "futsal-b",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 120000,
    isActive: true,
  },
  {
    id: "court-ms1",
    venueId: "venue-arena1",
    sportId: "sport-minisoccer",
    name: "Minisoccer 1",
    slug: "minisoccer-1",
    surfaceType: "Sintetis",
    indoorType: "outdoor",
    capacity: 14,
    basePrice: 200000,
    isActive: true,
  },
  {
    id: "court-b1",
    venueId: "venue-arena1",
    sportId: "sport-badminton",
    name: "Badminton Court 1",
    slug: "badminton-court-1",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 80000,
    isActive: true,
  },
  {
    id: "court-b2",
    venueId: "venue-arena1",
    sportId: "sport-badminton",
    name: "Badminton Court 2",
    slug: "badminton-court-2",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 80000,
    isActive: true,
  },

  // ══════════════════════════════════════════
  // venue-greenfield (area-jakpus-1)
  // ══════════════════════════════════════════
  {
    id: "court-p1",
    venueId: "venue-greenfield",
    sportId: "sport-padel",
    name: "Padel Court 1",
    slug: "padel-court-1",
    surfaceType: "Artificial Grass",
    indoorType: "outdoor",
    capacity: 4,
    basePrice: 150000,
    isActive: true,
  },
  {
    id: "court-p2",
    venueId: "venue-greenfield",
    sportId: "sport-padel",
    name: "Padel Court 2",
    slug: "padel-court-2",
    surfaceType: "Artificial Grass",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 180000,
    isActive: true,
  },
  {
    id: "court-t1",
    venueId: "venue-greenfield",
    sportId: "sport-tenis",
    name: "Tenis Court 1",
    slug: "tenis-court-1",
    surfaceType: "Hard Court",
    indoorType: "outdoor",
    capacity: 4,
    basePrice: 100000,
    isActive: true,
  },
  {
    id: "court-bsk1",
    venueId: "venue-greenfield",
    sportId: "sport-basket",
    name: "Basket Court 1",
    slug: "basket-court-1",
    surfaceType: "Hard Court",
    indoorType: "outdoor",
    capacity: 10,
    basePrice: 100000,
    isActive: true,
  },
  {
    id: "court-greenfield-f1",
    venueId: "venue-greenfield",
    sportId: "sport-futsal",
    name: "Futsal VIP",
    slug: "futsal-vip",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 170000,
    isActive: true,
  },

  // ══════════════════════════════════════════
  // venue-dago-sport (area-bdg-1)
  // ══════════════════════════════════════════
  {
    id: "court-dago-f1",
    venueId: "venue-dago-sport",
    sportId: "sport-futsal",
    name: "Futsal Dago A",
    slug: "futsal-dago-a",
    surfaceType: "Sintetis",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 130000,
    isActive: true,
  },
  {
    id: "court-dago-f2",
    venueId: "venue-dago-sport",
    sportId: "sport-futsal",
    name: "Futsal Dago B",
    slug: "futsal-dago-b",
    surfaceType: "Rumput Sintetis Premium",
    indoorType: "outdoor",
    capacity: 10,
    basePrice: 110000,
    isActive: true,
  },
  {
    id: "court-dago-ms1",
    venueId: "venue-dago-sport",
    sportId: "sport-minisoccer",
    name: "Minisoccer Dago",
    slug: "minisoccer-dago",
    surfaceType: "Sintetis",
    indoorType: "outdoor",
    capacity: 14,
    basePrice: 180000,
    isActive: true,
  },
  {
    id: "court-dago-b1",
    venueId: "venue-dago-sport",
    sportId: "sport-badminton",
    name: "Badminton Dago 1",
    slug: "badminton-dago-1",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 70000,
    isActive: true,
  },
  {
    id: "court-dago-b2",
    venueId: "venue-dago-sport",
    sportId: "sport-badminton",
    name: "Badminton Dago 2",
    slug: "badminton-dago-2",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 70000,
    isActive: true,
  },
  {
    id: "court-dago-basket1",
    venueId: "venue-dago-sport",
    sportId: "sport-basket",
    name: "Basket Dago",
    slug: "basket-dago",
    surfaceType: "Parquet",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 120000,
    isActive: true,
  },

  // ══════════════════════════════════════════
  // venue-pasteur-arena (area-bdg-2)
  // ══════════════════════════════════════════
  {
    id: "court-pasteur-f1",
    venueId: "venue-pasteur-arena",
    sportId: "sport-futsal",
    name: "Futsal Pasteur",
    slug: "futsal-pasteur",
    surfaceType: "Sintetis",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 120000,
    isActive: true,
  },
  {
    id: "court-pasteur-p1",
    venueId: "venue-pasteur-arena",
    sportId: "sport-padel",
    name: "Padel Pasteur",
    slug: "padel-pasteur",
    surfaceType: "Artificial Grass",
    indoorType: "outdoor",
    capacity: 4,
    basePrice: 130000,
    isActive: true,
  },
  {
    id: "court-pasteur-b1",
    venueId: "venue-pasteur-arena",
    sportId: "sport-badminton",
    name: "Badminton Pasteur 1",
    slug: "badminton-pasteur-1",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 65000,
    isActive: true,
  },
  {
    id: "court-pasteur-b2",
    venueId: "venue-pasteur-arena",
    sportId: "sport-badminton",
    name: "Badminton Pasteur 2",
    slug: "badminton-pasteur-2",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 65000,
    isActive: true,
  },

  // ══════════════════════════════════════════
  // venue-bdg (area-bdg-kota)
  // ══════════════════════════════════════════
  {
    id: "court-bdg-f1",
    venueId: "venue-bdg",
    sportId: "sport-futsal",
    name: "Futsal A",
    slug: "futsal-a-bdg",
    surfaceType: "Sintetis",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 130000,
    isActive: true,
  },
  {
    id: "court-bdg-b1",
    venueId: "venue-bdg",
    sportId: "sport-badminton",
    name: "Badminton 1",
    slug: "badminton-1-bdg",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 70000,
    isActive: true,
  },
  {
    id: "court-bdg-ms1",
    venueId: "venue-bdg",
    sportId: "sport-minisoccer",
    name: "Minisoccer Kota",
    slug: "minisoccer-kota",
    surfaceType: "Sintetis",
    indoorType: "outdoor",
    capacity: 14,
    basePrice: 170000,
    isActive: true,
  },

  // ══════════════════════════════════════════
  // venue-surabaya-arena (area-surabaya-1)
  // ══════════════════════════════════════════
  {
    id: "court-sby-f1",
    venueId: "venue-surabaya-arena",
    sportId: "sport-futsal",
    name: "Futsal Airlangga A",
    slug: "futsal-airlangga-a",
    surfaceType: "Sintetis",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 130000,
    isActive: true,
  },
  {
    id: "court-sby-f2",
    venueId: "venue-surabaya-arena",
    sportId: "sport-futsal",
    name: "Futsal Airlangga B",
    slug: "futsal-airlangga-b",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 10,
    basePrice: 110000,
    isActive: true,
  },
  {
    id: "court-sby-b1",
    venueId: "venue-surabaya-arena",
    sportId: "sport-badminton",
    name: "Badminton Airlangga 1",
    slug: "badminton-airlangga-1",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 75000,
    isActive: true,
  },
  {
    id: "court-sby-b2",
    venueId: "venue-surabaya-arena",
    sportId: "sport-badminton",
    name: "Badminton Airlangga 2",
    slug: "badminton-airlangga-2",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 75000,
    isActive: true,
  },
  {
    id: "court-sby-ms1",
    venueId: "venue-surabaya-arena",
    sportId: "sport-minisoccer",
    name: "Minisoccer Airlangga",
    slug: "minisoccer-airlangga",
    surfaceType: "Sintetis",
    indoorType: "outdoor",
    capacity: 14,
    basePrice: 180000,
    isActive: true,
  },
  {
    id: "court-sby-basket1",
    venueId: "venue-surabaya-arena",
    sportId: "sport-basket",
    name: "Basket Airlangga",
    slug: "basket-airlangga",
    surfaceType: "Hard Court",
    indoorType: "outdoor",
    capacity: 10,
    basePrice: 100000,
    isActive: true,
  },
];

// ── Pricing Rules ──
export const mockPricingRules: PricingRule[] = [
  // court-f1 (Futsal A at Arena Sport Center)
  {
    id: "pr-f1-weekday",
    courtId: "court-f1",
    dayType: "weekday",
    startTime: "06:00",
    endTime: "17:00",
    pricePerHour: 120000,
    priority: 1,
    isActive: true,
  },
  {
    id: "pr-f1-peak",
    courtId: "court-f1",
    dayType: "weekday",
    startTime: "17:00",
    endTime: "23:00",
    pricePerHour: 150000,
    priority: 2,
    isActive: true,
  },
  {
    id: "pr-f1-weekend",
    courtId: "court-f1",
    dayType: "weekend",
    startTime: "06:00",
    endTime: "23:00",
    pricePerHour: 180000,
    priority: 3,
    isActive: true,
  },
  // court-f2 (Futsal B at Arena Sport Center)
  {
    id: "pr-f2-weekday",
    courtId: "court-f2",
    dayType: "weekday",
    startTime: "06:00",
    endTime: "17:00",
    pricePerHour: 100000,
    priority: 1,
    isActive: true,
  },
  {
    id: "pr-f2-peak",
    courtId: "court-f2",
    dayType: "weekday",
    startTime: "17:00",
    endTime: "23:00",
    pricePerHour: 120000,
    priority: 2,
    isActive: true,
  },
  {
    id: "pr-f2-weekend",
    courtId: "court-f2",
    dayType: "weekend",
    startTime: "06:00",
    endTime: "23:00",
    pricePerHour: 150000,
    priority: 3,
    isActive: true,
  },
  // court-selong-f1 (Selong Futsal Arena)
  {
    id: "pr-selong-f1-weekday",
    courtId: "court-selong-f1",
    dayType: "weekday",
    startTime: "06:00",
    endTime: "17:00",
    pricePerHour: 110000,
    priority: 1,
    isActive: true,
  },
  {
    id: "pr-selong-f1-peak",
    courtId: "court-selong-f1",
    dayType: "weekday",
    startTime: "17:00",
    endTime: "23:00",
    pricePerHour: 140000,
    priority: 2,
    isActive: true,
  },
  {
    id: "pr-selong-f1-weekend",
    courtId: "court-selong-f1",
    dayType: "weekend",
    startTime: "06:00",
    endTime: "23:00",
    pricePerHour: 170000,
    priority: 3,
    isActive: true,
  },
  // court-dago-f1 (Dago Sports Complex)
  {
    id: "pr-dago-f1-weekday",
    courtId: "court-dago-f1",
    dayType: "weekday",
    startTime: "06:00",
    endTime: "17:00",
    pricePerHour: 100000,
    priority: 1,
    isActive: true,
  },
  {
    id: "pr-dago-f1-peak",
    courtId: "court-dago-f1",
    dayType: "weekday",
    startTime: "17:00",
    endTime: "23:00",
    pricePerHour: 130000,
    priority: 2,
    isActive: true,
  },
  {
    id: "pr-dago-f1-weekend",
    courtId: "court-dago-f1",
    dayType: "weekend",
    startTime: "06:00",
    endTime: "23:00",
    pricePerHour: 160000,
    priority: 3,
    isActive: true,
  },
  // court-sby-f1 (Airlangga Sport Center)
  {
    id: "pr-sby-f1-weekday",
    courtId: "court-sby-f1",
    dayType: "weekday",
    startTime: "06:00",
    endTime: "17:00",
    pricePerHour: 100000,
    priority: 1,
    isActive: true,
  },
  {
    id: "pr-sby-f1-peak",
    courtId: "court-sby-f1",
    dayType: "weekday",
    startTime: "17:00",
    endTime: "23:00",
    pricePerHour: 130000,
    priority: 2,
    isActive: true,
  },
  {
    id: "pr-sby-f1-weekend",
    courtId: "court-sby-f1",
    dayType: "weekend",
    startTime: "06:00",
    endTime: "23:00",
    pricePerHour: 160000,
    priority: 3,
    isActive: true,
  },
  // court-p1 (Padel at Greenfield)
  {
    id: "pr-p1-weekday",
    courtId: "court-p1",
    dayType: "weekday",
    startTime: "07:00",
    endTime: "17:00",
    pricePerHour: 120000,
    priority: 1,
    isActive: true,
  },
  {
    id: "pr-p1-peak",
    courtId: "court-p1",
    dayType: "weekday",
    startTime: "17:00",
    endTime: "22:00",
    pricePerHour: 150000,
    priority: 2,
    isActive: true,
  },
  {
    id: "pr-p1-weekend",
    courtId: "court-p1",
    dayType: "weekend",
    startTime: "07:00",
    endTime: "22:00",
    pricePerHour: 180000,
    priority: 3,
    isActive: true,
  },
];

// ── Helper Functions ──

// Helper: get courts by sport and optionally venue
export function getCourtsBySport(
  sportId: string,
  venueId?: string
): Court[] {
  return mockCourts.filter(
    (c) =>
      c.sportId === sportId &&
      c.isActive &&
      (!venueId || c.venueId === venueId)
  );
}

// Helper: get venues that have courts for a given sport
export function getVenuesBySport(
  sportId: string,
  areaId?: string
): Venue[] {
  const venueIds = new Set(
    mockCourts
      .filter((c) => c.sportId === sportId && c.isActive)
      .map((c) => c.venueId)
  );
  return mockVenues.filter(
    (v) =>
      venueIds.has(v.id) &&
      v.isActive &&
      v.approvalStatus === "active" &&
      (!areaId || v.areaId === areaId)
  );
}

// Helper: get sport by slug
export function getSportBySlug(slug: string): Sport | undefined {
  return mockSports.find((s) => s.slug === slug && s.isActive);
}

// Helper: get venue by slug
export function getVenueBySlug(slug: string): Venue | undefined {
  return mockVenues.find((v) => v.slug === slug && v.isActive);
}

// Helper: get court by ID
export function getCourtById(id: string): Court | undefined {
  return mockCourts.find((c) => c.id === id && c.isActive);
}

// Helper: get court by slug within a venue
export function getCourtBySlug(
  venueSlug: string,
  courtSlug: string
): Court | undefined {
  const venue = getVenueBySlug(venueSlug);
  if (!venue) return undefined;
  return mockCourts.find(
    (c) => c.slug === courtSlug && c.venueId === venue.id && c.isActive
  );
}

// Helper: get pricing for a court
export function getPricingForCourt(courtId: string): PricingRule[] {
  return mockPricingRules.filter((p) => p.courtId === courtId && p.isActive);
}

// Helper: format price to IDR
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}