
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
};

export type Order = {
  id: string; 
  rideId: string;
  passengerId: string;
  clientName: string;
  clientPhone: string;
  status: 'new' | 'accepted' | 'rejected';
};

export type Language = 'en' | 'ru' | 'uz';

export type Translations = {
  [key: string]: any;
};

export type DriverApplicationData = Omit<Driver, 'id' | 'status' | 'carPhotoUrl' | 'name'> & { carPhotoFile: File | null };
