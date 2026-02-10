import type { CodegenConfig } from "@graphql-codegen/cli";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.development" });
loadEnv({ path: ".env.local" });

const schemaUrl = process.env.VITE_WORDPRESS_GRAPHQL_URL;
const wpUser = process.env.WP_GRAPHQL_USER;
const wpAppPassword = process.env.WP_GRAPHQL_APP_PASSWORD;

if (!schemaUrl) {
  throw new Error("VITE_WORDPRESS_GRAPHQL_URL is not defined in environment variables.");
}

const authHeader =
  wpUser && wpAppPassword
    ? `Basic ${Buffer.from(`${wpUser}:${wpAppPassword}`).toString("base64")}`
    : undefined;

const config: CodegenConfig = {
  schema: [
    {
      [schemaUrl]: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    },
  ],
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "src/api/graphql/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;
