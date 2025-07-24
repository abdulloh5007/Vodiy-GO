

export type User = {
  uid: string;
  email: string | null;
  role: 'passenger' | 'driver' | 'admin';
  name?: string;
  phone?: string;
};

export type Driver = {
  id: string; 
  name: string;
  phone: string;
  passport: string;
  techPassport: string;
  carModel: string;
  carNumber: string;
  carPhotoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
};

export type Ride = {
  id: string; 
  driverId: string; 
  from: string;
  to: string;
  price: number;
  seats: number;
  info: string;
  time?: string; // Optional departure time
  createdAt: any; // Allow server timestamp
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: any; // Timestamp for when the ride was approved
  promoCode?: string; // Optional promocode used
};

export type Order = {
  id: string; 
  rideId: string;
  passengerId: string;
  clientName: string;
  clientPhone: string;
  status: 'new' | 'accepted' | 'rejected';
  createdAt: any; // Allow server timestamp
};

export type PromoCode = {
    id: string;
    code: string;
    expiresAt: any;
    limit: number;
    usageCount: number;
    usedBy: string[]; // Array of driver UIDs who have used this code
    status: 'active' | 'expired' | 'depleted';
    createdAt: any;
    type: 'EXTEND_12H';
};

export type Language = 'en' | 'ru' | 'uz';

export type Translations = {
  [key: string]: any;
};

export type DriverApplicationData = Omit<Driver, 'id' | 'status' | 'carPhotoUrl' | 'phone'> & { carPhotoFile: File | null };
