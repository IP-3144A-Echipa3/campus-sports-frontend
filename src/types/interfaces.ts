export type FacilityStatus = "available" | "busy" | "maintenance";
export type BookingStatus = "confirmed" | "waiting";

export interface Facility {
  id: string;
  name: string;
  category: string;
  location: string;
  capacity: number;
  status: FacilityStatus;
  available: number;
  total: number;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  location: string;
  date: string;
  time: string;
  status: BookingStatus;
}

export interface BookingSlot {
  time: string;
  status: "available" | "busy" | "waiting";
}

export interface AppShellProps {
  active: "facilities" | "bookings" | "notifications";
  studentLabel?: string;
  onNavigate: (path: string) => void;
  onSignOut?: () => void;
}

export interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<void> | void;
  onSignUp: (email: string, password: string) => Promise<void> | void;
  onForgotPassword?: () => void;
}