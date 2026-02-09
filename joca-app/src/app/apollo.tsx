"use client";

// import { apolloClient } from "@/app/apollo_client";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

const apolloClient = new ApolloClient({
    //Once in production, change to the production URL
    //Should be in .env
    link: new HttpLink({ uri: process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL || "http://localhost:1337/graphql" }),
    cache: new InMemoryCache(),
});

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}