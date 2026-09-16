import type { ComponentType, SVGProps } from "react";

import { FacebookLogo } from "@/components/brand/facebook";
import { InstagramLogo } from "@/components/brand/instagram";
import { TiktokLogo } from "@/components/brand/tiktok";
import { XLogo } from "@/components/brand/x";

export type SocialNetworkKey = "instagramHandle" | "tiktokHandle" | "facebookHandle" | "xHandle";

export type SocialHandles = Record<SocialNetworkKey, string | null>;

export type SocialNetwork = {
  key: SocialNetworkKey;
  name: string;
  placeholder: string;
  profileBaseUrl: string;
  logoClassName: string;
  Logo: ComponentType<SVGProps<SVGSVGElement>>;
};

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    key: "instagramHandle",
    name: "Instagram",
    placeholder: "tu.tienda",
    profileBaseUrl: "https://instagram.com/",
    logoClassName: "text-network-instagram",
    Logo: InstagramLogo,
  },
  {
    key: "tiktokHandle",
    name: "TikTok",
    placeholder: "tu.tienda",
    profileBaseUrl: "https://www.tiktok.com/@",
    logoClassName: "text-network-tiktok",
    Logo: TiktokLogo,
  },
  {
    key: "facebookHandle",
    name: "Facebook",
    placeholder: "tutienda",
    profileBaseUrl: "https://facebook.com/",
    logoClassName: "text-network-facebook",
    Logo: FacebookLogo,
  },
  {
    key: "xHandle",
    name: "X",
    placeholder: "tutienda",
    profileBaseUrl: "https://x.com/",
    logoClassName: "text-network-x",
    Logo: XLogo,
  },
];

export function buildSocialProfileUrl(network: SocialNetwork, handle: string): string {
  return `${network.profileBaseUrl}${handle}`;
}
