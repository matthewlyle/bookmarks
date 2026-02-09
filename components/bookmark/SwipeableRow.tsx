"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { Trash2, Pencil, BookCheck, Bookmark as BookmarkIcon } from "lucide-react";
import { SWIPE, SPRING_SNAPPY, SPRING_BOUNCY } from "@/lib/constants";

export interface SwipeableRowHandle {
  closeSwipe: () => void;
}

interface SwipeableRowProps {
  onDelete: () => void;
  onEdit: () => void;
  onToggleRead: () => void;
  isRead: boolean;
  children: React.ReactNode;
}

const SwipeableRow = forwardRef<SwipeableRowHandle, SwipeableRowProps>(
  function SwipeableRow({ onDelete, onEdit, onToggleRead, isRead, children }, ref) {
    const x = useMotionValue(0);
    const dragStartX = useRef(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [leftButtonsRevealed, setLeftButtonsRevealed] = useState(false);
    const [rightButtonsRevealed, setRightButtonsRevealed] = useState(false);

    const buttonsOpacity = useTransform(x, [-SWIPE.BUTTONS_WIDTH, 0], [1, 0]);
    const buttonsScale = useTransform(x, [-SWIPE.BUTTONS_WIDTH, -20, 0], [1, 0.8, 0.8]);
    const rightButtonsOpacity = useTransform(x, [0, SWIPE.RIGHT_BUTTONS_WIDTH], [0, 1]);
    const rightButtonsScale = useTransform(
      x,
      [0, 20, SWIPE.RIGHT_BUTTONS_WIDTH],
      [0.8, 0.8, 1]
    );

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

    const handleLinkClick = useCallback(
      (e: React.MouseEvent) => {
        if (Math.abs(x.get()) > 10) {
          e.preventDefault();
          closeSwipe();
        }
      },
      [x, closeSwipe]
    );

    useImperativeHandle(ref, () => ({ closeSwipe }), [closeSwipe]);

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
              SWIPE.RIGHT_BUTTONS_WIDTH + (pos - SWIPE.RIGHT_BUTTONS_WIDTH) * 0.3;
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

    return (
      <>
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex w-[72px] pr-3"
          style={{
            opacity: rightButtonsOpacity,
            scale: rightButtonsScale,
            pointerEvents: leftButtonsRevealed ? "auto" : "none",
          }}
          aria-hidden={!leftButtonsRevealed}
        >
          <motion.button
            type="button"
            aria-label={isRead ? "Mark as unread" : "Mark as read"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className="group flex-1 flex items-center justify-center bg-muted text-foreground transition-colors duration-200 ease hover:bg-accent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeSwipe();
              onToggleRead();
            }}
          >
            {isRead ? (
              <BookmarkIcon className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
            ) : (
              <BookCheck className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
            )}
          </motion.button>
        </motion.div>

        <motion.div
          className="absolute right-0 top-0 bottom-0 flex"
          style={{
            width: SWIPE.BUTTONS_WIDTH,
            opacity: buttonsOpacity,
            scale: buttonsScale,
            pointerEvents: rightButtonsRevealed ? "auto" : "none",
          }}
          aria-hidden={!rightButtonsRevealed}
        >
          <motion.button
            type="button"
            aria-label="Edit bookmark"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className="group flex-1 flex items-center justify-center bg-muted text-foreground transition-colors duration-200 ease hover:bg-accent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeSwipe();
              onEdit();
            }}
          >
            <Pencil className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
          </motion.button>
          <motion.button
            type="button"
            aria-label="Delete bookmark"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className="group flex-1 flex items-center justify-center bg-destructive text-white transition-[color,background-color,filter] duration-200 ease hover:brightness-90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
          </motion.button>
        </motion.div>

        <div {...bind()} style={{ touchAction: "pan-y" }} onClick={handleLinkClick}>
          <motion.div
            style={{ x }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            animate={{ opacity: isDeleting ? 0.5 : 1 }}
            transition={SPRING_BOUNCY}
          >
            {children}
          </motion.div>
        </div>
      </>
    );
  }
);

export default SwipeableRow;
