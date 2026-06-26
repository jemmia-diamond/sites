import { ImageTab, IMAGE_TAB_LABELS } from "../context/TryOnContext";
import { cn } from "@/lib/utils";

export const RING_MEDIA_TABS = (Object.values(ImageTab) as ImageTab[]).map((id) => ({
  id,
  label: IMAGE_TAB_LABELS[id],
}));

interface MediaTabBarProps {
  activeTab: ImageTab;
  onTabChange: (tabId: ImageTab) => void;
}

export function MediaTabBar({ activeTab, onTabChange }: MediaTabBarProps) {
  return (
    <div className="flex border-b border-primary-100 mt-4">
      {RING_MEDIA_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 text-center pb-2 text-xs font-medium border-b-2 transition-all duration-200 cursor-pointer",
              isActive
                ? "text-secondary-800 border-secondary-800 font-semibold"
                : "text-slate-500 border-transparent hover:text-slate-700",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
