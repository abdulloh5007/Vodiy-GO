export type Driver = {
  id: string; // Changed to string for Firestore document IDs
  name: string;
  phone: string;
  carModel: string;
  carNumber: string;
  carPhotoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
};

export type Ride = {
  id: string; // Changed to string for Firestore document IDs
  driverId: string; // Can be string if it refers to driver doc ID
  from: string;
  to: string;
  price: number;
  info: string;
  createdAt: string;
};

export type Order = {
  id: string; // Changed to string for Firestore document IDs
  rideId: string;
  clientName: string;
  clientPhone: string;
  status: 'new' | 'accepted' | 'rejected';
};

export type Language = 'en' | 'ru' | 'uz';

export type Translations = {
  [key: string]: string;
};
