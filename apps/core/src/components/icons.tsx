import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  Camera01Icon,
  Cancel01Icon,
  ChartColumnIcon,
  CheckIcon,
  CheckmarkCircle01Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleQuestionMarkIcon,
  Copy01Icon,
  Delete02Icon,
  Facebook01Icon,
  ImageAdd01Icon,
  InstagramIcon,
  Loading03Icon,
  LockIcon,
  MapPinIcon,
  Message01Icon,
  NewTwitterIcon,
  PencilIcon,
  PlusSignIcon,
  SentIcon,
  Settings01Icon,
  Share08Icon,
  ShuffleIcon,
  SlidersHorizontalIcon,
  StarIcon,
  Store01Icon,
  TiktokIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import type { ComponentProps, ReactElement } from "react";

export type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon" | "altIcon" | "showAlt">;

function defineIcon(icon: IconSvgElement): (props: IconProps) => ReactElement {
  return function TulocalIcon(props: IconProps): ReactElement {
    return <HugeiconsIcon icon={icon} {...props} />;
  };
}

export const tulocalIcons = {
  arrowLeft: defineIcon(ArrowLeft01Icon),
  arrowUpRight: defineIcon(ArrowUpRight01Icon),
  camera: defineIcon(Camera01Icon),
  chart: defineIcon(ChartColumnIcon),
  check: defineIcon(CheckIcon),
  checkCircle: defineIcon(CheckmarkCircle01Icon),
  chevronDown: defineIcon(ChevronDownIcon),
  chevronLeft: defineIcon(ChevronLeftIcon),
  chevronRight: defineIcon(ChevronRightIcon),
  chevronUp: defineIcon(ChevronUpIcon),
  close: defineIcon(Cancel01Icon),
  copy: defineIcon(Copy01Icon),
  facebook: defineIcon(Facebook01Icon),
  imageAdd: defineIcon(ImageAdd01Icon),
  instagram: defineIcon(InstagramIcon),
  lock: defineIcon(LockIcon),
  mapPin: defineIcon(MapPinIcon),
  message: defineIcon(Message01Icon),
  pencil: defineIcon(PencilIcon),
  plus: defineIcon(PlusSignIcon),
  questionMark: defineIcon(CircleQuestionMarkIcon),
  send: defineIcon(SentIcon),
  settings: defineIcon(Settings01Icon),
  share: defineIcon(Share08Icon),
  shuffle: defineIcon(ShuffleIcon),
  sliders: defineIcon(SlidersHorizontalIcon),
  spinner: defineIcon(Loading03Icon),
  star: defineIcon(StarIcon),
  store: defineIcon(Store01Icon),
  tiktok: defineIcon(TiktokIcon),
  trash: defineIcon(Delete02Icon),
  whatsapp: defineIcon(WhatsappIcon),
  xLogo: defineIcon(NewTwitterIcon),
};
