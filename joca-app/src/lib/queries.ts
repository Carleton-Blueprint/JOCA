import { gql } from "@apollo/client";

export const GET_EVENTS = gql`
  query {
    events {
      documentId
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
