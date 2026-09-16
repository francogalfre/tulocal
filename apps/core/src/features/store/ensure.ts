import { database } from "@tulocal/database/client";
import { stores } from "@tulocal/database/schema/stores";
import type { AuthenticatedUser } from "@tulocal/authentication/server";

import {
  DEFAULT_AGENT_COLOR,
  DEFAULT_AGENT_MASCOT,
  DEFAULT_AGENT_NAME,
  DEFAULT_STORE_COLOR,
} from "@/features/store/defaults";
import { findStoreByOwner } from "@/features/store/find";
import { deriveHandle } from "@/features/store/handle";
import type { Store } from "@/features/store/find";
import { logEvent } from "@/lib/logger";

const MAX_HANDLE_ATTEMPTS = 20;

const FALLBACK_STORE_NAME = "Mi tienda";

function deriveStoreName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0];

  if (firstName === undefined || firstName.length === 0) {
    return FALLBACK_STORE_NAME;
  }

  return firstName;
}

function buildHandleCandidate(baseHandle: string, attempt: number): string {
  if (attempt === 1) {
    return baseHandle;
  }

  return `${baseHandle}-${attempt}`;
}

async function insertStoreWithHandle(
  user: AuthenticatedUser,
  handle: string,
): Promise<Store | null> {
  const [created] = await database
    .insert(stores)
    .values({
      ownerId: user.id,
      name: deriveStoreName(user.name),
      handle,
      color: DEFAULT_STORE_COLOR,
      agentName: DEFAULT_AGENT_NAME,
      agentMascot: DEFAULT_AGENT_MASCOT,
      agentColor: DEFAULT_AGENT_COLOR,
    })
    .onConflictDoNothing()
    .returning();

  return created ?? null;
}

export async function ensureStore(user: AuthenticatedUser): Promise<Store> {
  const existing = await findStoreByOwner(user.id);

  if (existing !== null) {
    return existing;
  }

  const baseHandle = deriveHandle(deriveStoreName(user.name));

  for (let attempt = 1; attempt <= MAX_HANDLE_ATTEMPTS; attempt += 1) {
    const handle = buildHandleCandidate(baseHandle, attempt);
    const created = await insertStoreWithHandle(user, handle);

    if (created !== null) {
      logEvent({ event: "store.created", storeId: created.id });
      return created;
    }

    const createdConcurrently = await findStoreByOwner(user.id);

    if (createdConcurrently !== null) {
      return createdConcurrently;
    }
  }

  throw new Error(`Could not allocate a free handle for ${baseHandle}`);
}
