import { webEnvironment } from "@tulocal/environment/web";

export const appOrigin =
  webEnvironment.NEXT_PUBLIC_APP_URL ?? webEnvironment.NEXT_PUBLIC_SERVER_URL;
