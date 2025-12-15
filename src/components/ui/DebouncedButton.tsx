'use client'

import React, { useState, useCallback } from 'react'
import { Button } from './Button'

interface DebouncedButtonProps extends React.ComponentProps<typeof Button> {
  debounceMs?: number
  onDebouncedClick?: () => void | Promise<void>
}

export default function DebouncedButton({ 
  debounceMs = 1000, 
  onDebouncedClick, 
  onClick,
  disabled,
  children,
  ...props 
}: DebouncedButtonProps) {
  const [isDebouncing, setIsDebouncing] = useState(false)

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDebouncing || disabled) {
      console.log('⚠️ Button click ignored - debouncing or disabled')
      return
    }

    setIsDebouncing(true)
    
    try {
      if (onDebouncedClick) {
        await onDebouncedClick()
      } else if (onClick) {
        onClick(e)
      }
    } catch (error) {
      console.error('Button click error:', error)
    } finally {
      setTimeout(() => {
        setIsDebouncing(false)
      }, debounceMs)
    }
  }, [isDebouncing, disabled, onDebouncedClick, onClick, debounceMs])

  return (
    <Button
      {...props}
      disabled={disabled || isDebouncing}
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}