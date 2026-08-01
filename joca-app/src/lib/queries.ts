// Strapi GraphQL queries
export const GET_EVENTS = `
  query GetEvents {
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

export const GET_ELECTIONS = `
  query GetElections {
    elections {
      documentId
      title
      location
      description
      category
      votingDateStart
      votingDateEnd
      candidates {
        name
      }
    }
  }
`;

export const GET_ELECTION = `
  query GetElection($documentId: ID!) {
    election(documentId: $documentId) {
      documentId
      votingDateStart
      votingDateEnd
      candidates {
        name
      }
    }
  }
`;
