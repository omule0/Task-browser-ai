"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface ModernTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  variant?: "default" | "underline" | "pill"
  renderContent?: (tabId: string) => React.ReactNode
  contentClassName?: string
}

const ModernTabs = React.forwardRef<HTMLDivElement, ModernTabsProps>(
  ({ className, tabs, activeTab, onTabChange, variant = "default", renderContent, contentClassName, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoverStyle, setHoverStyle] = useState({})
    const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
    const tabRefs = useRef<(HTMLDivElement | null)[]>([])

    // Update active index if activeTab prop changes
    useEffect(() => {
      if (activeTab) {
        const index = tabs.findIndex(tab => tab.id === activeTab)
        if (index !== -1) {
          setActiveIndex(index)
        }
      }
    }, [activeTab, tabs])

    // Update styles when hovering over tabs
    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex]
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      }
    }, [hoveredIndex])

    // Update active tab indicator position
    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }, [activeIndex])

    // Set initial active tab position
    useEffect(() => {
      requestAnimationFrame(() => {
        const firstElement = tabRefs.current[activeIndex]
        if (firstElement) {
          const { offsetLeft, offsetWidth } = firstElement
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      })
    }, [activeIndex])

    const getTabContentId = (tabId: string) => `content-${tabId}`

    return (
      <div 
        ref={ref} 
        className={cn("w-full", className)} 
        {...props}
      >
        <div className="relative">
          {/* Hover Highlight */}
          {variant === "default" && (
            <div
              className="absolute h-[40px] transition-all duration-300 ease-out bg-[#0e0f1110] dark:bg-[#ffffff15] rounded-[6px] flex items-center"
              style={{
                ...hoverStyle,
                opacity: hoveredIndex !== null ? 1 : 0,
              }}
            />
          )}

          {/* Active Indicator */}
          {variant === "default" && (
            <div
              className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-out"
              style={activeStyle}
            />
          )}

          {variant === "underline" && (
            <div
              className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-out"
              style={activeStyle}
            />
          )}

          {variant === "pill" && (
            <div
              className="absolute inset-0 bg-primary/10 rounded-md transition-all duration-300 ease-out"
              style={{
                ...activeStyle,
                height: "40px",
              }}
            />
          )}

          {/* Tabs */}
          <div className="relative flex items-center border-b border-border justify-center">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                ref={el => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                aria-selected={index === activeIndex}
                aria-controls={getTabContentId(tab.id)}
                tabIndex={index === activeIndex ? 0 : -1}
                className={cn(
                  "px-4 py-2.5 cursor-pointer transition-colors duration-300 h-[40px] flex items-center gap-2 justify-center flex-1",
                  variant === "pill" && "relative z-10",
                  index === activeIndex 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveIndex(index)
                  onTabChange?.(tab.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(index);
                    onTabChange?.(tab.id);
                  }
                }}
              >
                {tab.icon}
                <span className="text-sm font-medium whitespace-nowrap">
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderContent ? (
          <div className={cn("flex-1 overflow-auto", contentClassName)}>
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                id={getTabContentId(tab.id)}
                role="tabpanel"
                aria-labelledby={tab.id}
                className={cn(
                  "h-full",
                  index === activeIndex ? "block" : "hidden"
                )}
              >
                {renderContent(tab.id)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
)
ModernTabs.displayName = "ModernTabs"

export { ModernTabs } 