import type { ComponentType } from "react";

import { tulocalIcons } from "@/components/icons";
import type { IconProps } from "@/components/icons";

export type SocialNetworkKey = "instagramHandle" | "tiktokHandle" | "facebookHandle" | "xHandle";

export type SocialHandles = Record<SocialNetworkKey, string | null>;

export type SocialNetwork = {
  key: SocialNetworkKey;
  name: string;
  placeholder: string;
  profileBaseUrl: string;
  logoClassName: string;
  Logo: ComponentType<IconProps>;
};

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    key: "instagramHandle",
    name: "Instagram",
    placeholder: "tu.tienda",
    profileBaseUrl: "https://instagram.com/",
    logoClassName: "text-network-instagram",
    Logo: tulocalIcons.instagram,
  },
  {
    key: "tiktokHandle",
    name: "TikTok",
    placeholder: "tu.tienda",
    profileBaseUrl: "https://www.tiktok.com/@",
    logoClassName: "text-network-tiktok",
    Logo: tulocalIcons.tiktok,
  },
  {
    key: "facebookHandle",
    name: "Facebook",
    placeholder: "tutienda",
    profileBaseUrl: "https://facebook.com/",
    logoClassName: "text-network-facebook",
    Logo: tulocalIcons.facebook,
  },
  {
    key: "xHandle",
    name: "X",
    placeholder: "tutienda",
    profileBaseUrl: "https://x.com/",
    logoClassName: "text-network-x",
    Logo: tulocalIcons.xLogo,
  },
];

export function buildSocialProfileUrl(network: SocialNetwork, handle: string): string {
  return `${network.profileBaseUrl}${handle}`;
}
