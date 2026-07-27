export interface Hunt {
  ongoing: boolean;
  startsAt: string;
  clues: string[];
  participants: string[];
  completedBy: string[];
  winner: string | null;
  deadline: string;
  closedAt?: string;
  prizeAmount: number;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
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
  locationNote?: string;
}

export interface ActiveHuntView {
  deadline: string;
  prizeAmount: number;
  activeHunters: number;
  clues: string[];
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
}
