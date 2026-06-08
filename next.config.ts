import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixe la racine du projet (un autre lockfile existe dans le dossier parent).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
