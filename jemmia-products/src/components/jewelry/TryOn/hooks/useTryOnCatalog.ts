import { useState, useEffect, useRef } from "react";
import { jewelryService } from "../../../../services/jewelryService";
import { ProductModel } from "../../../../types";

interface UseTryOnCatalogProps {
  step: number;
  isOpen: boolean;
}

export function useTryOnCatalog({ step, isOpen }: UseTryOnCatalogProps) {
  const [rings, setRings] = useState<ProductModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingRings, setIsLoadingRings] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const mobileSentinelRef = useRef<HTMLDivElement>(null);
  const desktopSentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination when search query changes
  useEffect(() => {
    setPage(1);
    setHasNextPage(true);
    setRings([]);
  }, [searchQuery]);

  // Load rings for Step 3
  useEffect(() => {
    if (step !== 3 || !isOpen) return;

    let isMounted = true;
    const fetchRings = async () => {
      if (page === 1) {
        setIsLoadingRings(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await jewelryService.getJewelries({
          page: page,
          searchQuery: searchQuery || undefined,
          type: "Nhẫn Nữ",
          stockStatus: "IN_STOCK",
        });

        if (isMounted) {
          const newRings = res.data || [];
          if (page === 1) {
            setRings(newRings);
          } else {
            setRings((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const filteredNewRings = newRings.filter(
                (r) => !existingIds.has(r.id),
              );
              return [...prev, ...filteredNewRings];
            });
          }
          setHasNextPage(res.meta ? res.meta.hasNext : newRings.length > 0);
        }
      } catch (e) {
        console.error("Failed to load rings:", e);
      } finally {
        if (isMounted) {
          setIsLoadingRings(false);
          setIsLoadingMore(false);
        }
      }
    };

    // Debounce search query changes
    const timer = setTimeout(fetchRings, searchQuery && page === 1 ? 400 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [step, searchQuery, page, isOpen]);

  // Infinite scroll intersection observers
  useEffect(() => {
    if (
      step !== 3 ||
      !isOpen ||
      !hasNextPage ||
      isLoadingRings ||
      isLoadingMore
    )
      return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPage((prev) => prev + 1);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    const mobileEl = mobileSentinelRef.current;
    const desktopEl = desktopSentinelRef.current;

    if (mobileEl) observer.observe(mobileEl);
    if (desktopEl) observer.observe(desktopEl);

    return () => {
      if (mobileEl) observer.unobserve(mobileEl);
      if (desktopEl) observer.unobserve(desktopEl);
    };
  }, [step, isOpen, hasNextPage, isLoadingRings, isLoadingMore]);

  return {
    rings,
    searchQuery,
    setSearchQuery,
    isLoadingRings,
    isLoadingMore,
    mobileSentinelRef,
    desktopSentinelRef,
  };
}
