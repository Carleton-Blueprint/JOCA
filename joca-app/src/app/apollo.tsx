"use client";

import { useRef } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

function makeClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri:
        process.env.NODE_ENV !== "development"
          ? process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL!
          : "http://localhost:1337/graphql",
    }),
    cache: new InMemoryCache(),
  });
}

export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientRef = useRef<ApolloClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = makeClient();
  }
  return <ApolloProvider client={clientRef.current}>{children}</ApolloProvider>;
}
