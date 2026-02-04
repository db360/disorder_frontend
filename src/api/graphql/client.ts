import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";


const GRAPHQL_URL = import.meta.env.VITE_WORDPRESS_GRAPHQL_URL;

if(!GRAPHQL_URL) {
    console.error("VITE_WORDPRESS_GRAPHQL_URL is not defined in environment variables.");
}

// CACHÉ

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                posts: {
                    keyArgs: false,
                    merge(existing = [], incoming){
                        return [...existing, ...incoming];
                    }
                }
            }
        }
    }
})

const client = new ApolloClient({
    link: new HttpLink({
        uri: GRAPHQL_URL,
    }),
    cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        }
    }
})

export default client;