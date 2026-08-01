export type Candidate = {
  name: string;
};

export type Event = {
  documentId: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // e.g. 6:00 PM
  location: string;
  description?: string;
  category: "Culture" | "Community" | "Education";
};

export type Election = {
  documentId: string;
  title: string;
  location?: string;
  description?: string;
  category: "Executive" | "Committee" | "Referendum";
  votingDateStart: string; // ISO date (YYYY-MM-DD)
  votingDateEnd: string; // ISO date (YYYY-MM-DD)
  candidates?: Candidate[];
};
