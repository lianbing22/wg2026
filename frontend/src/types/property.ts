/**
 * 定义物业、单元、租户和员工相关的类型
 */

/** 物业接口 */
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

/** 单元接口 */
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

/** 租户接口 */
export interface Tenant {
  id: string;
  name: string;
  contact: string;
  unitId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
  paymentHistory: string[];
}

/** 员工接口 */
export interface Staff {
  id: string;
  name: string;
  role: 'manager' | 'maintenance' | 'security' | 'cleaner';
  contact: string;
  hireDate: string;
  salary: number;
  performanceReviews: string[];
}