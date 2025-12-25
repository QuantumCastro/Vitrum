import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: { target: "../backend/openapi.json" },
    output: {
      target: "src/api/generated",
      client: "react-query",
      // @ts-expect-error - orval admite queryOptions en salida aunque no esté tipado en las defs
      queryOptions: { staleTime: 10000 },
      override: {
        mutator: { path: "src/api/http-client.ts", name: "customInstance" },
      },
    },
  },
});
