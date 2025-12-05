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
      isPublic
      location
      title
      category
      time
    }
  }
`;
