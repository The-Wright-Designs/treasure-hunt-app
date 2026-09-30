export type ConsentStatus = "pending" | "granted" | "self";

export interface ParentDetails {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export const RELATIONSHIPS = ["Mother", "Father", "Legal guardian"];
