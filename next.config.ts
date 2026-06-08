import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixe la racine du projet (un autre lockfile existe dans le dossier parent).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Embarque le moteur de requêtes Prisma (binaire .node, dans un dossier
  // personnalisé) dans CHAQUE fonction serverless — sinon Vercel ne le copie pas
  // et l'app plante au runtime ("Query Engine not found").
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
