import type { NextConfig } from "next";

function splitHosts(value: string | undefined, fallback: string[]) {
  const hosts = (value ?? "")
    .split(",")
    .map(host => host.trim())
    .filter(Boolean);
  return Array.from(new Set([...hosts, ...fallback]));
}

function hostMatcher(hosts: string[]) {
  return hosts.map(host => host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
}

const appHostnames = splitHosts(process.env.PRIFYN_APP_HOSTNAME, [
  "app.prifyn.my.id",
  "app.prifyn.rakhaviantoni.com",
]);
const creatorHostnames = splitHosts(process.env.PRIFYN_CREATOR_HOSTNAME, [
  "creator.prifyn.my.id",
  "creator.prifyn.rakhaviantoni.com",
]);
const appHost = [{ type: "host" as const, value: hostMatcher(appHostnames) }];
const creatorHost = [{ type: "host" as const, value: hostMatcher(creatorHostnames) }];
const workspaceRoutes = [
  "ads-window",
  "campaigns",
  "copilot",
  "creators",
  "kol-window",
  "leads",
  "reports",
  "settings",
  "talent-pipeline",
];
const creatorRoutes = ["onboarding", "profile", "opportunities", "applications", "campaigns", "payments", "performance"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [...appHost, { type: "query", key: "code" }, { type: "query", key: "state" }],
        destination: "/api/auth/callback/google",
        permanent: false,
      },
      {
        source: "/",
        has: [...creatorHost, { type: "query", key: "code" }, { type: "query", key: "state" }],
        destination: "/api/auth/callback/google",
        permanent: false,
      },
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
