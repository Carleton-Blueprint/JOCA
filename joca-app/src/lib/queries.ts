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
      image {
        url
        alternativeText
        width
        height
      }
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
        documentId
        member {
          firstName
          lastName
        }
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
        documentId
      }
    }
  }
`;

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

export const GET_MEMBER_BY_EMAIL = `
  query GetMemberByEmail($email: String!, $status: PublicationStatus) {
    members(filters: { email: { eq: $email } }, status: $status) {
      documentId
      firstName
      lastName
      email
      phoneNumber
    }
  }
`;

export const GET_MEMBER_BY_EMAIL_NO_STATUS = `
  query GetMemberByEmail($email: String!) {
    members(filters: { email: { eq: $email } }) {
      documentId
      firstName
      lastName
      email
      phoneNumber
    }
  }
`;

export const DELETE_MEMBER = `
  mutation DeleteMember($documentId: ID!) {
    deleteMember(documentId: $documentId) {
      documentId
    }
  }
`;
