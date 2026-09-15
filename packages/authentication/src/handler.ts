import { authentication } from "@tulocal/authentication/server";

export function handleAuthenticationRequest(request: Request): Promise<Response> {
  return authentication.handler(request);
}
