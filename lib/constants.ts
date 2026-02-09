// Shared spring animation configs
export const SPRING_SNAPPY = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

export const SPRING_SMOOTH = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const SPRING_BOUNCY = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

// Swipe action constants
export const SWIPE = {
  ACTION_BUTTON_WIDTH: 72,
  BUTTONS_WIDTH: 144, // 72 * 2
  RIGHT_BUTTONS_WIDTH: 72, // Read/Unread button on left
  THRESHOLD: 60,
  DELETE_MULTIPLIER: 1.5,
} as const;

// Timing constants
export const UNDO_DELAY_MS = 3000;
export const FETCH_TIMEOUT_MS = 5000;
