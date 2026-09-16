type LogEvent = {
  event: string;
  productId?: string;
  storeId?: string;
  detail?: string;
};

export function logEvent(logEvent: LogEvent): void {
  console.info(JSON.stringify(logEvent));
}
