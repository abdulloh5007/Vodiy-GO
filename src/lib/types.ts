

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
  
  passportFrontUrl: string;
  selfieUrl: string;
  
  carModel: string;
  carNumber: string;

  carPhotoFrontUrl: string;
  carPhotoBackUrl: string;
  carPhotoLeftUrl: string;
  carPhotoRightUrl: string;

  techPassportFrontUrl: string;
  techPassportBackUrl: string;
  
  status: 'pending' | 'verified' | 'rejected' | 'blocked';
  rating: number;
  reviewCount: number;
  rejectionCount: number;
  rideRejectionCount: number;
  rejectionReason?: string;
};

export type Ride = {
  id: string; 
  driverId: string; 
  from: string;
  to: string;
  price: number;
  seats: number;
  availableSeats: number;
  info: string;
  time?: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: any;
  promoCode?: string;
  rejectionReason?: string;
};

export type Order = {
  id: string; 
  rideId: string;
  passengerId: string;
  clientName: string;
  clientPhone: string;
  status: 'new' | 'accepted' | 'rejected';
  createdAt: any;
};

export type Message = {
    id: string;
    type: 'REGISTRATION_PENDING' | 'REGISTRATION_APPROVED' | 'REGISTRATION_REJECTED' | 'REGISTRATION_BLOCKED' | 'REGISTRATION_UNBLOCKED' | 'RIDE_CREATED' | 'RIDE_APPROVED' | 'RIDE_REJECTED' | 'RIDE_BLOCKED';
    titleKey: string;
    bodyKey: string;
    bodyParams?: Record<string, string>;
    createdAt: any;
    isRead: boolean;
}

export type PromoCode = {
    id: string;
    code: string;
    expiresAt: any;
    limit: number;
    usageCount: number;
    usedBy: string[];
    status: 'active' | 'expired' | 'depleted';
    createdAt: any;
    type: 'EXTEND_12H';
};

export type Language = 'en' | 'ru' | 'uz';

export type Translations = {
  [key: string]: any;
};

export type DriverApplicationData = {
    name: string;
    carModel: string;
    carNumber: string;
    
    passportFrontFile: File;
    selfieFile: File;
    
    carPhotoFrontFile: File;
    carPhotoBackFile: File;
    carPhotoLeftFile: File;
    carPhotoRightFile: File;
    
    techPassportFrontFile: File;
    techPassportBackFile: File;
}
