import { useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface MagnetButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  padding?: number;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
}

const MagnetButton: React.FC<MagnetButtonProps> = ({
  children,
  padding = 100,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName = '',
  disabled = false,
  ...buttonProps
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }

    if (disabled) {
      button.style.transform = 'translate3d(0px, 0px, 0)';
      button.style.transition = inactiveTransition;
      isActiveRef.current = false;
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const wrapper = wrapperRef.current;
      const innerButton = buttonRef.current;
      if (!wrapper || !innerButton) {
        return;
      }

      const { left, top, width, height } = wrapper.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const distX = Math.abs(centerX - event.clientX);
      const distY = Math.abs(centerY - event.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        if (!isActiveRef.current) {
          innerButton.style.transition = activeTransition;
          isActiveRef.current = true;
        }
        const offsetX = (event.clientX - centerX) / magnetStrength;
        const offsetY = (event.clientY - centerY) / magnetStrength;
        innerButton.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      } else {
        if (isActiveRef.current) {
          innerButton.style.transition = inactiveTransition;
          isActiveRef.current = false;
        }
        innerButton.style.transform = 'translate3d(0px, 0px, 0)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      const innerButton = buttonRef.current;
      if (innerButton) {
        innerButton.style.transform = 'translate3d(0px, 0px, 0)';
        innerButton.style.transition = inactiveTransition;
      }
      isActiveRef.current = false;
    };
  }, [padding, magnetStrength, activeTransition, inactiveTransition, disabled]);

  return (
    <div ref={wrapperRef} className={`relative inline-block ${wrapperClassName}`}>
      <button
        ref={buttonRef}
        disabled={disabled}
        className={`will-change-transform ${innerClassName}`}
        {...buttonProps}
      >
        {children}
      </button>
    </div>
  );
};

export default MagnetButton;
