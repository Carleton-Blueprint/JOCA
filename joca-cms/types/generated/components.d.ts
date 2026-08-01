import type { Schema, Struct } from '@strapi/strapi';

export interface ElectionCandidate extends Struct.ComponentSchema {
  collectionName: 'components_election_candidates';
  info: {
    description: 'Named candidate for an election ballot';
    displayName: 'Candidate';
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    stableId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 36;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'election.candidate': ElectionCandidate;
    }
  }
}
