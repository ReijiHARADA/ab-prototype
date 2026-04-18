import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /**
   * Vercel 上では作業ディレクトリが `ab-prototype` のみなので不要。
   * ローカルでホーム直下など別の lockfile が検出される場合の誤検出を抑える。
   */
  ...(!process.env.VERCEL
    ? {
        turbopack: {
          root: path.join(process.cwd()),
        },
      }
    : {}),
};

export default nextConfig;
