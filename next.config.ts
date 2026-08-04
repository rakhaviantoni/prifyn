import type { NextConfig } from "next";

const appHostname = process.env.PRIFYN_APP_HOSTNAME ?? "app.prifyn.rakhaviantoni.com";
const appHostPattern = appHostname.replaceAll(".", "\\.");
const appHost = [{ type: "host" as const, value: appHostPattern }];
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
        ...workspaceRoutes.map((route) => ({
          source: `/${route}/:path*`,
          has: appHost,
          destination: `/app/${route}/:path*`,
        })),
      ],
    };
  },
};

export default nextConfig;
