import { useEffect } from 'react';

interface UseKeyboardProps {
  onLeftArrow: () => void;
  onRightArrow: () => void;
  enabled: boolean;
}

export const useKeyboard = ({ onLeftArrow, onRightArrow, enabled }: UseKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        onLeftArrow();
      } else if (event.key === "ArrowRight") {
        onRightArrow();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onLeftArrow, onRightArrow, enabled]);
}; 