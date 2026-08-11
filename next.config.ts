import type { NextConfig } from "next";

const appHostname = process.env.PRIFYN_APP_HOSTNAME ?? "app.prifyn.rakhaviantoni.com";
const creatorHostname = process.env.PRIFYN_CREATOR_HOSTNAME ?? "creator.prifyn.rakhaviantoni.com";
const appHostPattern = appHostname.replaceAll(".", "\\.");
const creatorHostPattern = creatorHostname.replaceAll(".", "\\.");
const appHost = [{ type: "host" as const, value: appHostPattern }];
const creatorHost = [{ type: "host" as const, value: creatorHostPattern }];
const workspaceRoutes = [
  "ads-window",
  "campaigns",
  "copilot",
  "creators",
  "kol-window",
  "reports",
  "settings",
  "talent-pipeline",
];
const creatorRoutes = ["onboarding", "profile", "opportunities", "applications", "campaigns", "payments", "performance"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/app",
        has: appHost,
        destination: "/",
        permanent: false,
      },
      {
        source: "/app/:path*",
        has: appHost,
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/creator",
        has: creatorHost,
        destination: "/",
        permanent: false,
      },
      {
        source: "/creator/:path*",
        has: creatorHost,
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: appHost,
          destination: "/app",
        },
        {
          source: "/",
          has: creatorHost,
          destination: "/creator",
        },
        ...workspaceRoutes.map((route) => ({
          source: `/${route}/:path*`,
          has: appHost,
          destination: `/app/${route}/:path*`,
        })),
        ...creatorRoutes.map((route) => ({
          source: `/${route}/:path*`,
          has: creatorHost,
          destination: `/creator/${route}/:path*`,
        })),
      ],
    };
  },
};

export default nextConfig;
