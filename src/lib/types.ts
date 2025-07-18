export type Driver = {
  id: number;
  name: string;
  phone: string;
  carModel: string;
  carNumber: string;
  carPhotoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
};

export type Ride = {
  id: number;
  driverId: number;
  from: string;
  to: string;
  price: number;
  info: string;
  createdAt: string;
};

export type Order = {
  id: number;
  rideId: number;
  clientName: string;
  clientPhone: string;
  status: 'new' | 'accepted' | 'rejected';
};

export type Language = 'en' | 'ru' | 'uz';

export type Translations = {
  [key: string]: string;
};
