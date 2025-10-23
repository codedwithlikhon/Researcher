"use client"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, Clipboard } from "lucide-react"
import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type CollapsibleSectionContextType = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleSectionContext = createContext<CollapsibleSectionContextType | undefined>(undefined)

function useCollapsibleSectionContext() {
  const context = useContext(CollapsibleSectionContext)
  if (!context) {
    throw new Error("useCollapsibleSectionContext must be used within a CollapsibleSection provider")
  }
  return context
}

export type CollapsibleSectionProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function CollapsibleSection({ children, className, open, onOpenChange }: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <CollapsibleSectionContext.Provider
      value={{
        isOpen,
        onOpenChange: handleOpenChange,
      }}
    >
      <div className={className}>{children}</div>
    </CollapsibleSectionContext.Provider>
  )
}

export type CollapsibleSectionTriggerProps = {
  children: React.ReactNode
  className?: string
  contentToCopy: string
} & React.HTMLAttributes<HTMLDivElement>

function CollapsibleSectionTrigger({
  children,
  className,
  contentToCopy,
  ...props
}: CollapsibleSectionTriggerProps) {
  const { isOpen, onOpenChange } = useCollapsibleSectionContext()
  const { toast } = useToast()

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(contentToCopy)
    toast({
      description: "Copied to clipboard!",
    })
  }

  return (
    <div
      className={cn("flex cursor-pointer items-center justify-between", className)}
      onClick={() => onOpenChange(!isOpen)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className={cn("transform transition-transform", isOpen ? "rotate-180" : "")}>
          <ChevronDownIcon className="size-4" />
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
        <Clipboard className="w-3 h-3 mr-1" />
        Copy
      </Button>
    </div>
  )
}

export type CollapsibleSectionContentProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

function CollapsibleSectionContent({ children, className, ...props }: CollapsibleSectionContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const { isOpen } = useCollapsibleSectionContext()

  useEffect(() => {
    if (!contentRef.current || !innerRef.current) return

    const observer = new ResizeObserver(() => {
      if (contentRef.current && innerRef.current && isOpen) {
        contentRef.current.style.maxHeight = `${inner-Ref.current.scrollHeight}px`
      }
    })

    observer.observe(innerRef.current)

    if (isOpen) {
      contentRef.current.style.maxHeight = `${innerRef.current.scrollHeight}px`
    }

    return () => observer.disconnect()
  }, [isOpen])

  return (
    <div
      ref={contentRef}
      className={cn("overflow-hidden transition-[max-height] duration-150 ease-out", className)}
      style={{
        maxHeight: isOpen ? contentRef.current?.scrollHeight : "0px",
      }}
      {...props}
    >
      <div ref={innerRef} className="p-2">
        {children}
      </div>
    </div>
  )
}

export { CollapsibleSection, CollapsibleSectionTrigger, CollapsibleSectionContent }
