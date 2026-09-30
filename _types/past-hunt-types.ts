export interface Hunt {
  ongoing: boolean;
  startsAt: string;
  clues: string[];
  entryCode: string;
  entryType?: "code" | "qr";
  participants: string[];
  completedBy: string[];
  completedDevices?: string[];
  winner: string | null;
  deadline: string;
  closedAt?: string;
  notifiedAt?: string;
  prizeAmount: number;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
  circleLatitude?: number;
  circleLongitude?: number;
  circleRadius?: number;
  locationNote?: string;
}

export interface PastHuntView {
  deadline: string;
  completed: boolean;
  noOfHunters: number;
  winner: boolean;
  locationNote?: string;
}

export interface QueuedHuntView {
  id: string;
  startsAt: string;
  deadline: string;
  prizeAmount: number;
  clueCount: number;
  clues: string[];
  entryCode: string;
  entryType: "code" | "qr";
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
  circleLatitude?: number;
  circleLongitude?: number;
  circleRadius?: number;
  locationNote?: string;
}

export interface ActiveHuntAdminView {
  id: string;
  startsAt: string;
  deadline: string;
  prizeAmount: number;
  clueCount: number;
  clues: string[];
  entryCode: string;
  entryType: "code" | "qr";
  activeHunters: number;
  completedCount: number;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
  circleLatitude?: number;
  circleLongitude?: number;
  circleRadius?: number;
  locationNote?: string;
  closedAt?: string;
  notifiedAt?: string;
}

export interface ClosedHuntAdminView {
  id: string;
  deadline: string;
  closedAt?: string;
  notifiedAt?: string;
  winner: string | null;
  completedCount: number;
}

export interface ActiveHuntView {
  id: string;
  deadline: string;
  prizeAmount: number;
  activeHunters: number;
  joined: boolean;
  entered: boolean;
  entryType: "code" | "qr";
  clues: string[];
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
  circleLatitude?: number;
  circleLongitude?: number;
  circleRadius?: number;
}
