import Image from "next/image";

type ThumbnailProps = {
  url: string;
  isScanning: boolean;
};

export function Thumbnail({ url, isScanning }: ThumbnailProps) {
  return (
    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
      <Image src={url} alt="" fill priority sizes="96px" className="object-cover" />
      {isScanning ? (
        <span className="absolute inset-x-0 h-0.5 bg-brand motion-safe:animate-scan" />
      ) : null}
    </div>
  );
}
