export interface User {
  id: string;
  email: string;
  role: 'student' | 'organization' | 'admin';
  full_name?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'internship' | 'party' | 'self-development';
  orgName?: string;
  organization_name?: string; // Legacy/Duplicate support
  organization_id: string;
  deadline?: string;
  skills?: string[];
  available_spots?: number;
  price?: number;
  banner_image?: string;
  promo_video?: string;
  participants?: any;
  location?: string;
  tags?: string[];
  agenda?: string;
  faq?: string;
  reviews?: string;
  cta_url?: string;
  created_at?: string;
  status?: 'active' | 'expired' | 'archived';
}

export interface Organization {
  id: string;
  name: string;
  // other fields
}

export interface OrganizationListResponse {
  organizations: Organization[];
}
