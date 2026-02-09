"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMotionValue, useTransform, animate } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { SWIPE, SPRING_SNAPPY } from "@/lib/constants";

interface UseSwipeGestureOptions {
  onDelete: () => void;
}

export function useSwipeGesture({ onDelete }: UseSwipeGestureOptions) {
  const x = useMotionValue(0);
  const dragStartX = useRef(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [leftButtonsRevealed, setLeftButtonsRevealed] = useState(false);
  const [rightButtonsRevealed, setRightButtonsRevealed] = useState(false);

  const buttonsOpacity = useTransform(x, [-SWIPE.BUTTONS_WIDTH, 0], [1, 0]);
  const buttonsScale = useTransform(x, [-SWIPE.BUTTONS_WIDTH, -20, 0], [1, 0.8, 0.8]);
  const rightButtonsOpacity = useTransform(x, [0, SWIPE.RIGHT_BUTTONS_WIDTH], [0, 1]);
  const rightButtonsScale = useTransform(x, [0, 20, SWIPE.RIGHT_BUTTONS_WIDTH], [0.8, 0.8, 1]);

  const DELETE_THRESHOLD = -SWIPE.BUTTONS_WIDTH * SWIPE.DELETE_MULTIPLIER;

  useEffect(() => {
    const unsub = x.on("change", (v) => {
      setLeftButtonsRevealed(v > SWIPE.THRESHOLD);
      setRightButtonsRevealed(v < -SWIPE.THRESHOLD);
    });
    return () => unsub();
  }, [x]);

  const closeSwipe = useCallback(() => {
    animate(x, 0, SPRING_SNAPPY);
  }, [x]);

  const bind = useDrag(
    ({ down, first, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (first) {
        dragStartX.current = x.get();
      }
      const pos = dragStartX.current + mx;

      if (down) {
        let resistedX = pos;
        if (pos < 0) {
          const resistance = pos < -SWIPE.BUTTONS_WIDTH ? 0.3 : 1;
          resistedX =
            pos < -SWIPE.BUTTONS_WIDTH
              ? -SWIPE.BUTTONS_WIDTH + (pos + SWIPE.BUTTONS_WIDTH) * resistance
              : pos;
        } else if (pos > SWIPE.RIGHT_BUTTONS_WIDTH) {
          resistedX =
            SWIPE.RIGHT_BUTTONS_WIDTH +
            (pos - SWIPE.RIGHT_BUTTONS_WIDTH) * 0.3;
        }
        x.set(resistedX);

        if (pos < 0) {
          const wouldDelete = pos < DELETE_THRESHOLD;
          if (wouldDelete !== isDeleting) {
            setIsDeleting(wouldDelete);
          }
        } else {
          setIsDeleting(false);
        }
      } else {
        const shouldDelete =
          pos < DELETE_THRESHOLD ||
          (vx > 0.5 && dx < 0 && pos < -SWIPE.BUTTONS_WIDTH);
        const shouldRevealLeft = pos < -SWIPE.THRESHOLD && !shouldDelete;
        const shouldRevealRight = pos > SWIPE.THRESHOLD;

        setIsDeleting(false);

        if (shouldDelete) {
          animate(x, -window.innerWidth, {
            type: "spring",
            stiffness: 300,
            damping: 30,
          });
          onDelete();
        } else if (shouldRevealLeft) {
          animate(x, -SWIPE.BUTTONS_WIDTH, SPRING_SNAPPY);
        } else if (shouldRevealRight) {
          animate(x, SWIPE.RIGHT_BUTTONS_WIDTH, SPRING_SNAPPY);
        } else {
          animate(x, 0, SPRING_SNAPPY);
        }
      }
    },
    {
      axis: "lock",
      from: () => [x.get(), 0],
      filterTaps: true,
      rubberband: false,
      preventDefault: true,
      pointer: { touch: true },
    }
  );

  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      if (Math.abs(x.get()) > 10) {
        e.preventDefault();
        closeSwipe();
      }
    },
    [x, closeSwipe]
  );

  return {
    x,
    isDeleting,
    leftButtonsRevealed,
    rightButtonsRevealed,
    buttonsOpacity,
    buttonsScale,
    rightButtonsOpacity,
    rightButtonsScale,
    closeSwipe,
    bind,
    handleLinkClick,
  };
}
