export interface Hunt {
  ongoing: boolean;
  startsAt: string;
  clues: string[];
  participants: string[];
  completedBy: string[];
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
}

export interface QueuedHuntView {
  id: string;
  startsAt: string;
  deadline: string;
  prizeAmount: number;
  clueCount: number;
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
  deadline: string;
  prizeAmount: number;
  activeHunters: number;
  clues: string[];
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
  circleLatitude?: number;
  circleLongitude?: number;
  circleRadius?: number;
}
