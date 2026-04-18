import type { Gender } from "@/types/experiment";

/** 商品詳細ヒーロー用（`public/social-proof/`）。ユニクロ商品イメージのプロト用。 */
export const PRODUCT_HERO_IMAGE_PATHS = [
  "/social-proof/1.png",
  "/social-proof/2.png",
  "/social-proof/3.png",
] as const;

/**
 * 1: 商品単体、2: 男性モデル、3: 女性モデル。
 * 男性 → 1 の次は 2（1,2,3）、女性 → 1 の次は 3（1,3,2）。
 */
export function getProductHeroImagePaths(
  gender: Gender | null | undefined
): readonly string[] {
  const [p1, p2, p3] = PRODUCT_HERO_IMAGE_PATHS;
  if (gender === "female") return [p1, p3, p2];
  if (gender === "male") return [p1, p2, p3];
  return [p1, p2, p3];
}
