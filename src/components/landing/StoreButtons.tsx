import { Apple } from "lucide-react";

const APP_STORE_URL = "https://apps.apple.com/us/app/drawback-chat/id6760538640";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=chat.drawback.flutter";

const PlayStoreIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.28 1.28 0 0 1-.428-.965V2.78c0-.375.157-.71.427-.965zM14.852 13.06l2.906 1.674-2.56 2.56-3.467-3.467 3.121-.767zm2.906-4.794L14.852 9.94l-3.121-.767 3.467-3.467 2.56 2.56zM5.024.658l8.06 8.06-1.767 1.767L4.07.342A1.5 1.5 0 0 1 5.024.658zm0 22.684a1.5 1.5 0 0 1-.955-.316l7.248-7.143 1.767 1.767-8.06 8.06z"/>
  </svg>
);

export const StoreButtons = ({ size = "default" }: { size?: "default" | "small" }) => {
  const isSmall = size === "small";
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity font-body ${isSmall ? "px-4 py-2" : "px-6 py-3"}`}
      >
        <Apple className={isSmall ? "w-5 h-5" : "w-7 h-7"} />
        <div className="text-left">
          <div className={`${isSmall ? "text-[9px]" : "text-[10px]"} leading-none opacity-80`}>Download on the</div>
          <div className={`${isSmall ? "text-sm" : "text-base"} font-semibold leading-tight`}>App Store</div>
        </div>
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity font-body ${isSmall ? "px-4 py-2" : "px-6 py-3"}`}
      >
        <PlayStoreIcon />
        <div className="text-left">
          <div className={`${isSmall ? "text-[9px]" : "text-[10px]"} leading-none opacity-80`}>Get it on</div>
          <div className={`${isSmall ? "text-sm" : "text-base"} font-semibold leading-tight`}>Google Play</div>
        </div>
      </a>
    </div>
  );
};

export const StoreButtonsInverted = () => (
  <div className="flex flex-col sm:flex-row items-center gap-3">
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-xl bg-card text-foreground hover:scale-105 transition-transform font-body px-6 py-3 shadow-card"
    >
      <Apple className="w-7 h-7" />
      <div className="text-left">
        <div className="text-[10px] leading-none text-muted-foreground">Download on the</div>
        <div className="text-base font-semibold leading-tight">App Store</div>
      </div>
    </a>
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-xl bg-card text-foreground hover:scale-105 transition-transform font-body px-6 py-3 shadow-card"
    >
      <PlayStoreIcon />
      <div className="text-left">
        <div className="text-[10px] leading-none text-muted-foreground">Get it on</div>
        <div className="text-base font-semibold leading-tight">Google Play</div>
      </div>
    </a>
  </div>
);
