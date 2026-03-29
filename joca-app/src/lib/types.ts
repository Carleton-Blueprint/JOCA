export type Candidate = {
  documentId: string;
  member?: Member;
  voteCount: number;
  election?: Election;
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

export type Member = {
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  user?: User;
  candidate?: Candidate;
};

export type User = {
  documentId: string;
  email: string;
  phoneNumber?: string;
  provider?: string;
  password?: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed?: boolean;
  blocked?: boolean;
  //   role: Role; // TODO: We don't have a content type for this yet but I'd guess "Authenticated" | "Public"?
  member?: Member;
};
