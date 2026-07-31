export type Candidate = {
  documentId: string;
  member?: Member;
  election?: Election;
};

export type StrapiMedia = {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type Event = {
  documentId: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // e.g. 6:00 PM
  location: string;
  description?: string;
  category: "Culture" | "Community" | "Education";
  image?: StrapiMedia | null;
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

export type Member = {
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  user?: User;
  candidate?: Candidate;
};

export type User = {
  documentId: string;
  email: string;
  phoneNumber: string;
  provider?: string;
  password?: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed?: boolean;
  blocked?: boolean;
  member?: Member;
};
