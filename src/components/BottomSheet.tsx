import React, { useEffect, useRef, type ReactNode } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { Box } from '@radix-ui/themes'
import './BottomSheet.css'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  snapPoints?: number[]
  initialSnapIndex?: number
  enablePanDownToClose?: boolean
  backdropOpacity?: number
  borderRadius?: number
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  snapPoints = [0.25, 0.5, 0.95],
  initialSnapIndex = 1,
  enablePanDownToClose = true,
  backdropOpacity = 0.5,
  borderRadius = 16
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentSnapIndex = useRef(initialSnapIndex)

  // Calculate snap positions (y positions from top)
  const snapPositions = snapPoints.map(point => window.innerHeight * (1 - point))
  const closedPosition = window.innerHeight

  // Main sheet animation - y represents vertical position from top
  const [{ y }, api] = useSpring(() => ({
    y: closedPosition,
    config: config.stiff
  }))

  // Backdrop animation
  const [{ opacity }, backdropApi] = useSpring(() => ({
    opacity: 0,
    config: config.default
  }))

  // Close function
  const close = (velocity = 0) => {
    api.start({ 
      y: closedPosition, 
      immediate: false, 
      config: { ...config.stiff, velocity } 
    })
    backdropApi.start({ opacity: 0 })
    onClose()
  }

  // Open/close effect
  useEffect(() => {
    if (isOpen) {
      const targetY = snapPositions[currentSnapIndex.current]
      api.start({ 
        y: targetY, 
        immediate: false, 
        config: config.stiff 
      })
      backdropApi.start({ opacity: backdropOpacity })
    } else {
      api.start({ 
        y: closedPosition, 
        immediate: false, 
        config: config.stiff 
      })
      backdropApi.start({ opacity: 0 })
    }
  }, [isOpen, api, backdropApi, backdropOpacity, closedPosition, snapPositions])

  // Drag gesture handler
  const bind = useDrag(
    ({ 
      last, 
      velocity: [, vy], 
      direction: [, dy], 
      offset: [, oy], 
      canceled 
    }) => {

      if (last) {
        // Find closest snap point
        let targetSnapIndex = 0
        let minDistance = Infinity
        
        snapPositions.forEach((position: number, index: number) => {
          const distance = Math.abs(oy - position)
          if (distance < minDistance) {
            minDistance = distance
            targetSnapIndex = index
          }
        })

        // Check if should close
        const shouldClose = enablePanDownToClose && (
          oy > window.innerHeight * 0.7 || // Dragged too far down
          (vy > 0.5 && dy > 0) // Fast downward swipe
        )

        if (shouldClose) {
          close(Math.abs(vy))
        } else {
          currentSnapIndex.current = targetSnapIndex
          const targetPosition = snapPositions[targetSnapIndex]
          api.start({
            y: targetPosition,
            config: canceled ? config.wobbly : config.stiff
          })
        }
      } else {
        // While dragging, move the sheet
        api.start({ y: oy, immediate: true })
      }
    },
    { 
      from: () => [0, y.get()], 
      filterTaps: true, 
      axis: 'y',
      rubberband: true 
    }
  )

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        const newSnapPositions = snapPoints.map(point => window.innerHeight * (1 - point))
        api.start({ y: newSnapPositions[currentSnapIndex.current] })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, api, snapPoints])

  if (!isOpen && y.get() >= closedPosition) {
    return null
  }

  return (
    <div className="bottom-sheet-container">
      {/* Backdrop */}
      <animated.div
        className="bottom-sheet-backdrop"
        style={{ opacity }}
        onClick={handleBackdropClick}
      />
      
      {/* Sheet */}
      <animated.div
        ref={containerRef}
        className="bottom-sheet"
        style={{
          y,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius
        }}
        {...bind()}
      >
        {/* Handle */}
        <div className="bottom-sheet-handle" />
        
        {/* Content */}
        <Box className="bottom-sheet-content">
          {children}
        </Box>
      </animated.div>
    </div>
  )
}

export default BottomSheet