export type User = {
  uid: string;
  email: string | null;
  role: 'driver' | 'admin';
};

export type Driver = {
  id: string; 
  name: string;
  phone: string;
  carModel: string;
  carNumber: string;
  carPhotoUrl: string;
  status: 'pending' | 'verified' | 'rejected' | 'unsubmitted';
};

export type Ride = {
  id: string; 
  driverId: string; 
  from: string;
  to: string;
  price: number;
  info: string;
  time?: string; // Optional departure time
  createdAt: any; // Allow server timestamp
};

export type Order = {
  id: string; 
  rideId: string;
  clientName: string;
  clientPhone: string;
  status: 'new' | 'accepted' | 'rejected';
};

export type Language = 'en' | 'ru' | 'uz';

export type Translations = {
  [key: string]: any;
};
