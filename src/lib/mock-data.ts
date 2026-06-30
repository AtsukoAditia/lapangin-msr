import type { Sport, Venue, Court, PricingRule, Area, VenueOwner } from "./types/domain";

export const mockAreas: Area[] = [
  { id: "area-jaksel-1", province: "DKI Jakarta", city: "Jakarta Selatan", district: "Kebayoran Baru", village: "Selong", slug: "jaksel-kebayoran-selong", label: "DKI Jakarta > Jakarta Selatan > Kebayoran Baru > Selong", isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "area-jaksel-2", province: "DKI Jakarta", city: "Jakarta Selatan", district: "Pancoran", village: "Duren Tiga", slug: "jaksel-pancoran-duren-tiga", label: "DKI Jakarta > Jakarta Selatan > Pancoran > Duren Tiga", isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "area-jakpus-1", province: "DKI Jakarta", city: "Jakarta Pusat", district: "Menteng", village: "Menteng", slug: "jakpus-menteng-menteng", label: "DKI Jakarta > Jakarta Pusat > Menteng > Menteng", isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "area-bdg-1", province: "Jawa Barat", city: "Bandung", district: "Coblong", village: "Dago", slug: "bandung-coblong-dago", label: "Jawa Barat > Bandung > Coblong > Dago", isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "area-bdg-2", province: "Jawa Barat", city: "Bandung", district: "Sukajadi", village: "Pasteur", slug: "bandung-sukajadi-pasteur", label: "Jawa Barat > Bandung > Sukajadi > Pasteur", isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "area-surabaya-1", province: "Jawa Timur", city: "Surabaya", district: "Gubeng", village: "Airlangga", slug: "surabaya-gubeng-airlangga", label: "Jawa Timur > Surabaya > Gubeng > Airlangga", isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
];

export const mockVenueOwners: VenueOwner[] = [
  { id: "owner-1", adminId: "admin-1", businessName: "Arena Sports Group", picName: "Budi Santoso", phone: "081234567890", email: "budi@arena.com", status: "active", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "owner-2", adminId: "admin-2", businessName: "Greenfield Sports", picName: "Sari Dewi", phone: "081298765432", email: "sari@greenfield.com", status: "active", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
];

export const mockSports: Sport[] = [
  { id: "sport-futsal", name: "Futsal", slug: "futsal", isActive: true },
  { id: "sport-minisoccer", name: "Minisoccer", slug: "minisoccer", isActive: true },
  { id: "sport-badminton", name: "Badminton", slug: "badminton", isActive: true },
  { id: "sport-padel", name: "Padel", slug: "padel", isActive: true },
  { id: "sport-tenis", name: "Tenis", slug: "tenis", isActive: true },
  { id: "sport-basket", name: "Basket", slug: "basket", isActive: true },
];

export const mockVenues: Venue[] = [
  {
    id: "venue-arena1",
    name: "Arena Sport Center",
    slug: "arena-sport-center",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    mapsUrl: "https://maps.google.com",
    phone: "081234567890",
    openTime: "06:00",
    closeTime: "23:00",
    isActive: true,
    ownerId: "owner-1",
    areaId: "area-jaksel-2",
    approvalStatus: "active",
  },
  {
    id: "venue-greenfield",
    name: "Greenfield Arena",
    slug: "greenfield-arena",
    address: "Jl. Gatot Subroto No. 45, Jakarta Pusat",
    mapsUrl: "https://maps.google.com",
    phone: "081298765432",
    openTime: "07:00",
    closeTime: "22:00",
    isActive: true,
    ownerId: "owner-2",
    areaId: "area-jakpus-1",
    approvalStatus: "active",
  },
];

export const mockCourts: Court[] = [
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
    slug: "badminton-1",
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
    slug: "badminton-2",
    surfaceType: "Vinyl",
    indoorType: "indoor",
    capacity: 4,
    basePrice: 80000,
    isActive: true,
  },
  {
    id: "court-p1",
    venueId: "venue-greenfield",
    sportId: "sport-padel",
    name: "Padel Court 1",
    slug: "padel-1",
    surfaceType: "Artificial Grass",
    indoorType: "outdoor",
    capacity: 4,
    basePrice: 150000,
    isActive: true,
  },
  {
    id: "court-t1",
    venueId: "venue-greenfield",
    sportId: "sport-tenis",
    name: "Tenis Court 1",
    slug: "tenis-1",
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
    slug: "basket-1",
    surfaceType: "Hard Court",
    indoorType: "outdoor",
    capacity: 10,
    basePrice: 100000,
    isActive: true,
  },
];

export const mockPricingRules: PricingRule[] = [
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
];

// Helper: get courts by sport and optionally venue
export function getCourtsBySport(
  sportId: string,
  venueId?: string
): Court[] {
  return mockCourts.filter(
    (c) => c.sportId === sportId && c.isActive && (!venueId || c.venueId === venueId)
  );
}

// Helper: get venues that have courts for a given sport, optionally filtered by area
export function getVenuesBySport(sportId: string, areaId?: string): Venue[] {
  const venueIds = new Set(
    mockCourts.filter((c) => c.sportId === sportId && c.isActive).map((c) => c.venueId)
  );
  return mockVenues.filter((v) => venueIds.has(v.id) && v.isActive && v.approvalStatus === "active" && (!areaId || v.areaId === areaId));
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
export function getCourtBySlug(venueSlug: string, courtSlug: string): Court | undefined {
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