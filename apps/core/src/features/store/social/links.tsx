import { cn } from "cn";

import { SOCIAL_NETWORKS, buildSocialProfileUrl } from "@/features/store/social/networks";
import type { SocialHandles, SocialNetwork } from "@/features/store/social/networks";

type SocialLink = {
  network: SocialNetwork;
  handle: string;
};

type SocialLinksProps = {
  handles: SocialHandles;
};

function collectSocialLinks(handles: SocialHandles): SocialLink[] {
  return SOCIAL_NETWORKS.flatMap((network) => {
    const handle = handles[network.key];

    return handle === null ? [] : [{ network, handle }];
  });
}

export function SocialLinks({ handles }: SocialLinksProps) {
  const links = collectSocialLinks(handles);

  if (links.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
      {links.map(({ network, handle }) => (
        <li key={network.key}>
          <a
            href={buildSocialProfileUrl(network, handle)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <network.Logo className={cn("size-4", network.logoClassName)} aria-hidden="true" />
            {handle}
            <span className="sr-only">en {network.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
