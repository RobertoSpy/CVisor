export type Mentor = {
  name: string;
  role: string; // ex: "Mentor", "Speaker"
  profileUrl: string;
  avatarUrl: string;
};

export type Opportunity = {
  id: number;
  title: string;
  deadline: string;
  type: string;
  skills: string[];
  available_spots: number;
  price: number;
  banner_image?: string;
  promo_video?: string;
  gallery?: string[];
  participants?: any;
  location: string;
  tags?: string[];
  agenda?: string;
  faq?: string;
  reviews?: string;
  description: string;
  cta_url: string;
};