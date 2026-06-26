import { useState, useEffect, useRef } from "react";
import { jewelryService } from "../../../../services/jewelryService";
import { ProductModel } from "../../../../types";

export const ALL_RING_TYPES = [
  "Nhẫn Nữ",
  "Nhẫn Nam",
  "Nhẫn Nữ Nguyên Chiếc",
  "Nhẫn Nam Nguyên Chiếc",
];

interface UseTryOnCatalogProps {
  step: number;
  isOpen: boolean;
}

export function useTryOnCatalog({ step, isOpen }: UseTryOnCatalogProps) {
  const [rings, setRings] = useState<ProductModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(ALL_RING_TYPES);
  const [isLoadingRings, setIsLoadingRings] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const mobileSentinelRef = useRef<HTMLDivElement>(null);
  const desktopSentinelRef = useRef<HTMLDivElement>(null);
  const lastFetchedRef = useRef<{ query: string; types: string[]; page: number } | null>(null);
  const prevStepRef = useRef<number>(step);

  // Debounce search query state
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Reset catalog state when not active
  useEffect(() => {
    if (step !== 3 || !isOpen) {
      setPage(1);
      setHasNextPage(true);
      setRings([]);
      setSearchQuery("");
      setSelectedTypes(ALL_RING_TYPES);
      lastFetchedRef.current = null;
    }
  }, [step, isOpen]);

  // Reset pagination when debounced search query or selected types changes
  useEffect(() => {
    setPage(1);
    setHasNextPage(true);
    setRings([]);
    lastFetchedRef.current = null;
  }, [debouncedSearchQuery, selectedTypes]);

  // Load rings for Step 3
  useEffect(() => {
    if (step !== 3 || !isOpen) {
      prevStepRef.current = step;
      return;
    }

    const returnedToStep3 = prevStepRef.current !== 3;
    prevStepRef.current = step;

    if (returnedToStep3) {
      lastFetchedRef.current = null;
      setPage(1);
      setHasNextPage(true);
      setRings([]);
      if (page !== 1 || rings.length !== 0) {
        return;
      }
    }

    if (page !== 1 && lastFetchedRef.current === null) {
      return;
    }

    // If we have already successfully fetched this page, query, and types, do not fetch again
    if (
      lastFetchedRef.current &&
      lastFetchedRef.current.query === debouncedSearchQuery &&
      JSON.stringify(lastFetchedRef.current.types) === JSON.stringify(selectedTypes) &&
      lastFetchedRef.current.page === page
    ) {
      return;
    }

    let isMounted = true;
    const fetchRings = async () => {
      if (page === 1) {
        setIsLoadingRings(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const res = await jewelryService.getJewelries({
          page: page,
          searchQuery: debouncedSearchQuery || undefined,
          types: selectedTypes,
          stockStatus: "IN_STOCK",
          missingMedia: false,
          limit: isMobile ? 21 : 20,
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
          lastFetchedRef.current = { query: debouncedSearchQuery, types: selectedTypes, page };
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

    fetchRings();

    return () => {
      isMounted = false;
    };
  }, [step, debouncedSearchQuery, selectedTypes, page, isOpen]);

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
    selectedTypes,
    setSelectedTypes,
    isLoadingRings,
    isLoadingMore,
    mobileSentinelRef,
    desktopSentinelRef,
  };
}
