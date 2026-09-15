import { Redis } from "ioredis";

import { storageEnvironment } from "@tulocal/environment/storage";

const KEY_PREFIX = "tulocal:";

export const redis = new Redis(storageEnvironment.REDIS_URL, {
  keyPrefix: KEY_PREFIX,
  lazyConnect: true,
});
