import { useCallback, useRef } from 'react';

export function useInfiniteScroll(
  onIntersect: () => void,
  hasMore: boolean | undefined,
  isFetching: boolean
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const targetRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetching) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onIntersect();
          }
        },
        {
          rootMargin: '200px', // Trigger slightly before reaching the very bottom
        }
      );

      observerRef.current.observe(node);
    },
    [isFetching, hasMore, onIntersect]
  );

  return targetRef;
}
