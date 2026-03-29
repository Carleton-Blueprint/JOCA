import { gql } from "@apollo/client";

//Apollo Queries
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

//Strapi Queries
export const CREATE_MEMBER = `
  mutation CreateMember($data: MemberInput!) {
    createMember(data: $data) {
      documentId
      firstName
      lastName
      email
      phoneNumber
    }
  }
`;

export const GET_CANDIDATE = `
  query GetCandidate($documentId: ID!) {
    candidate(documentId: $documentId) { voteCount }
  }`;

export const UPDATE_CANDIDATE = `
  mutation UpdateCandidate($documentId: ID!, $data: CandidateInput!) {
    updateCandidate(documentId: $documentId, data: $data) { voteCount }
  }`;
