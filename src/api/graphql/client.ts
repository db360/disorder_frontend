import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const getDefaultGraphqlUrl = () => {
    if (typeof window === "undefined") {
        return "";
    }

    return `${trimTrailingSlash(window.location.origin)}/graphql`;
};

const resolveGraphqlUrl = (value?: string): string => {
    const fallback = getDefaultGraphqlUrl();
    const raw = (value || "").trim();

    if (!raw) {
        return fallback;
    }

    try {
        const baseOrigin =
            typeof window !== "undefined" ? window.location.origin : "https://www.disorderunderground.es";
        const parsed = new URL(raw, baseOrigin);
        const localHosts = ["localhost", "127.0.0.1", "::1"];
        const isTargetLocal = localHosts.includes(parsed.hostname);

        // In development, only use Vite proxy when the configured endpoint is local.
        if (import.meta.env.DEV && isTargetLocal) {
            return "/graphql";
        }

        if (typeof window !== "undefined") {
            const isCurrentHostLocal = localHosts.includes(window.location.hostname);

            // Prevent production pages from trying to call local dev endpoints.
            if (!isCurrentHostLocal && isTargetLocal) {
                console.warn(
                    `[graphql] Endpoint local detectado en produccion (${parsed.toString()}). Usando ${fallback}`,
                );
                return fallback;
            }
        }

        return parsed.toString();
    } catch {
        return fallback;
    }
};

const GRAPHQL_URL = resolveGraphqlUrl(import.meta.env.VITE_WORDPRESS_GRAPHQL_URL);

if(!GRAPHQL_URL) {
    console.error("VITE_WORDPRESS_GRAPHQL_URL is not defined in environment variables.");
}

// CACHÉ
const cache = new InMemoryCache();

const client = new ApolloClient({
    link: new HttpLink({
        uri: GRAPHQL_URL,
    }),
    cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: "cache-and-network",
            nextFetchPolicy: "cache-first",
            errorPolicy: "all",
        },
        query: {
            fetchPolicy: "cache-first",
            errorPolicy: "all",
        }
    }
})

export default client;