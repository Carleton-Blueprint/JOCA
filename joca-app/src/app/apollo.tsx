"use client";

// import { apolloClient } from "@/app/apollo_client";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost:1337/graphql" }),
    cache: new InMemoryCache(),
});

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}