import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { DEFAULT_LANGUAGE } from "./src/shared/i18n/config";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: `/${DEFAULT_LANGUAGE}`,
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
