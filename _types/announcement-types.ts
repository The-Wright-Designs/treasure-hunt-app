export interface Announcement {
  heading: string;
  body: string;
  createdAt: string;
}

export interface AnnouncementView extends Announcement {
  id: string;
}
