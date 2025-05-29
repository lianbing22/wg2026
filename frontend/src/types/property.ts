export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'residential' | 'commercial' | 'industrial';
  units: number;
  status: 'available' | 'occupied' | 'under_maintenance';
  rentAmount: number;
  imageUrl?: string; // Optional image URL for the property
  constructionDate: string; // ISO date string
  areaSqMeters: number; // Square meters
  amenities?: string[]; // List of amenities
  ownerId?: string; // ID of the owner/landlord
  currentTenantId?: string; // ID of the current tenant if occupied
  leaseEndDate?: string; // ISO date string, if applicable
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  status: 'available' | 'occupied' | 'under_maintenance';
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSqMeters: number;
  tenantId?: string;
  leaseEndDate?: string;
}