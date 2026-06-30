export interface Hunt {
  ongoing: boolean;
  participants: string[];
  completedBy: string[];
  winner: string | null;
  deadline: string;
  prizeAmount: number;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
}

export interface PastHuntView {
  deadline: string;
  completed: boolean;
  noOfHunters: number;
  winner: boolean;
}

export interface ActiveHuntView {
  deadline: string;
  prizeAmount: number;
  activeHunters: number;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
}
