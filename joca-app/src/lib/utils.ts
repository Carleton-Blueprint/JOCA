import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { gql } from "@apollo/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GET_EVENTS = gql`
  query {
    events {
      date
      description
      location
      title
      category
      time
    }
  }
`;

export const GET_ELECTIONS = gql`
  query {
    elections {
      documentId
      title
      location
      description
      category
      votingDateStart
      votingDateEnd
      candidates {
        documentId
        voteCount
        member {
          firstName
          lastName
        }
      }
    }
  }
`;

export const VOTE_FOR_CANDIDATE = gql`
  mutation UpdateCandidate($documentId: ID!, $data: CandidateInput!) {
    updateCandidate(documentId: $documentId, data: $data) {
      documentId
      voteCount
    }
  }
`;

export const formatTime = (timeStr: string) => {
  if (!timeStr) return "N/A";

  const [h, m] = timeStr.split(":");
  let hour = Number(h);

  const suffix = hour < 12 ? " a.m" : " p.m";

  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${m} ${suffix}`;
};
