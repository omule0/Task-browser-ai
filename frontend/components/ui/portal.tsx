'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  wrapperId?: string;
}

export function Portal({ 
  children, 
  wrapperId = 'modal-root' 
}: PortalProps) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if we already have the wrapper element in the DOM
    let element = document.getElementById(wrapperId);
    let systemCreated = false;

    // If not found, create it
    if (!element) {
      systemCreated = true;
      element = document.createElement('div');
      element.id = wrapperId;
      element.style.position = 'fixed';
      element.style.left = '0';
      element.style.top = '0';
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.zIndex = '9999';
      element.style.pointerEvents = 'none';
      document.body.appendChild(element);
    }

    // Make sure it can receive pointer events when it has content
    element.style.pointerEvents = 'auto';
    
    // Set the wrapper element
    setWrapperElement(element);

    // Disable body scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup function
    return () => {
      // Reset pointer events when content is removed
      if (element) {
        element.style.pointerEvents = 'none';
      }
      
      // Restore body scrolling
      document.body.style.overflow = originalStyle;
      
      // If we created the element, remove it when there are no children
      if (systemCreated && element?.childElementCount === 0) {
        element.remove();
      }
    };
  }, [wrapperId]);

  // Only render the children once we have a wrapper element
  return wrapperElement ? createPortal(children, wrapperElement) : null;
}

export default Portal; 