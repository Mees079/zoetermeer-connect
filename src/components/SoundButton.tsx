import { Button } from './ui/button';
import { soundEffects } from '@/utils/soundEffects';
import { ComponentProps, forwardRef } from 'react';

interface SoundButtonProps extends ComponentProps<typeof Button> {
  soundType?: 'click' | 'success';
}

export const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ onClick, onMouseEnter, soundType = 'click', ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundType === 'click') {
        soundEffects.playClick();
      } else if (soundType === 'success') {
        soundEffects.playSuccess();
      }
      onClick?.(e);
    };

    const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
      soundEffects.playHover();
      onMouseEnter?.(e);
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleHover}
        {...props}
      />
    );
  }
);

SoundButton.displayName = 'SoundButton';
