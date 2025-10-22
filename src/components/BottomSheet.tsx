import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, type JSX, type PropsWithChildren } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface BottomSheetProps {
  snapPoints?: number[];
  defaultSnap?: number;
  maxHeight?: number;
  onClose?: () => void;
  renderBackdrop?: (props: BackdropProps) => JSX.Element
}

interface BackdropProps {
  opacity: any; // animated value from react-spring
  onClick: () => void;
}

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  snapTo: (index: number) => void;
}

const BottomSheet = forwardRef<BottomSheetRef, PropsWithChildren<BottomSheetProps>>(({
  children,
  snapPoints = [0.3, 0.6, 0.9],
  defaultSnap = 0.6,
  maxHeight = 0.95,
  onClose,
  renderBackdrop
}, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentSnapIndex, setCurrentSnapIndex] = useState<number>(
    snapPoints.indexOf(defaultSnap)
  );

  // Expose open/close methods via ref
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => handleClose(),
    snapTo: (index: number) => {
      if (index >= 0 && index < snapPoints.length) {
        const targetHeight = getSnapHeight(snapPoints[index]);
        api.start({
          y: viewportHeight - targetHeight,
          config: config.stiff
        });
        setCurrentSnapIndex(index);
      }
    }
  }));

  const handleClose = () => {
    api.start({
      y: viewportHeight,
      config: config.stiff
    });
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 300);
  };

  // Calculate actual heights based on snap points
  const getSnapHeight = (snapPercent: number): number => {
    const maxAllowedHeight = viewportHeight * maxHeight;
    const snapHeight = viewportHeight * snapPercent;
    const constrainedHeight = Math.min(
      Math.min(snapHeight, maxAllowedHeight),
      contentHeight || snapHeight
    );
    return constrainedHeight;
  };

  // Spring animation for sheet position
  const [{ y }, api] = useSpring(() => ({
    y: viewportHeight,
    config: config.stiff
  }));

  // Update viewport height on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure content height
  useEffect(() => {
    if (contentRef.current && isOpen) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContentHeight(entry.contentRect.height + 80);
        }
      });
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, [isOpen, children]);

  // Open/close animation
  useEffect(() => {
    if (isOpen) {
      const targetHeight = getSnapHeight(snapPoints[currentSnapIndex]);
      api.start({
        y: viewportHeight - targetHeight,
        immediate: false
      });
    } else {
      api.start({
        y: viewportHeight,
        immediate: false
      });
      setCurrentSnapIndex(snapPoints.indexOf(defaultSnap));
    }
  }, [isOpen, viewportHeight, contentHeight]);

  // Find nearest snap point
  const findNearestSnap = (currentY: number, velocity: number): number => {
    const currentHeight = viewportHeight - currentY;
    const snapHeights = snapPoints.map(getSnapHeight);

    if (velocity > 0.5 && currentHeight < snapHeights[0]) {
      return -1;
    }

    let nearestIndex = 0;
    let minDiff = Math.abs(currentHeight - snapHeights[0]);

    snapHeights.forEach((height, index) => {
      const diff = Math.abs(currentHeight - height);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIndex = index;
      }
    });

    if (velocity > 0.5 && nearestIndex > 0) {
      nearestIndex--;
    } else if (velocity < -0.5 && nearestIndex < snapHeights.length - 1) {
      nearestIndex++;
    }

    return nearestIndex;
  };

  // Drag gesture handler
  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy], cancel }) => {
      const targetY = (viewportHeight - getSnapHeight(snapPoints[currentSnapIndex])) + my;
      const minY = viewportHeight - getSnapHeight(snapPoints[snapPoints.length - 1]);

      if (targetY < minY) {
        cancel();
      }

      if (last) {
        const snapIndex = findNearestSnap(targetY, vy * dy);

        if (snapIndex === -1) {
          handleClose();
        } else {
          const targetHeight = getSnapHeight(snapPoints[snapIndex]);
          api.start({
            y: viewportHeight - targetHeight,
            config: config.stiff
          });
          setCurrentSnapIndex(snapIndex);
        }
      } else {
        api.start({
          y: targetY,
          immediate: true
        });
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: viewportHeight - getSnapHeight(maxHeight) },
      rubberband: true
    }
  );

  if (!isOpen && y.get() >= viewportHeight) return null;

  const backdropOpacity = y.to([viewportHeight, 0], [0, 0.5]);

  const defaultBackdrop = (
    <animated.div
      className="fixed inset-0 bg-black z-40"
      style={{
        opacity: backdropOpacity,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
      onClick={handleClose}
    />
  );

  const backdrop = renderBackdrop
    ? renderBackdrop({ opacity: backdropOpacity, onClick: handleClose })
    : defaultBackdrop;

  return (
    <>
      {/* Backdrop */}
      {backdrop}
      {/* Bottom Sheet */}
      <animated.div
        className="fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col"
        style={{
          y,
          touchAction: 'none',
          maxHeight: `${maxHeight * 100}vh`
        }}
      >
        {/* Grabber Area */}
        <div
          {...bind()}
          className="flex justify-center items-center py-4 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 pb-6"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {children}
        </div>
      </animated.div>
    </>
  );
});

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;