"use client";
import { useRef, useEffect, useState, useCallback } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import { searchPlugin } from '@react-pdf-viewer/search';
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";

const PdfViewer = ({ url, activeSource = null }) => {
  const containerRef = useRef(null);
  const [searchAttempts, setSearchAttempts] = useState(0);
  
  const searchPluginInstance = useRef(
    searchPlugin({
      onHighlightKeyword: (props) => {
        props.highlightEle.classList.add('source-highlight');
        props.highlightEle.style.backgroundColor = 'rgba(255, 255, 0, 0.4)';
        props.highlightEle.style.borderRadius = '2px';
        props.highlightEle.style.padding = '2px 0';
      },
    })
  ).current;
  
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut } = zoomPluginInstance;
  const scrollModePluginInstance = scrollModePlugin();

  const clearHighlights = useCallback(() => {
    if (!containerRef.current) return;
    searchPluginInstance.clearHighlights();
  }, [searchPluginInstance]);

  // New function to clean and normalize text for searching
  const normalizeText = (text) => {
    return text
      .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
      .replace(/[^\w\s\d]/g, ' ')  // Replace special characters with spaces, keep numbers
      .trim()                      // Remove leading/trailing spaces
      .toLowerCase();              // Convert to lowercase
  };

  // Modified findBestMatch function to prioritize longer matches
  const findBestMatch = (sourceText) => {
    const words = normalizeText(sourceText).split(' ');
    const searchPhrases = [];
    
    // Try the full text first (up to a reasonable length)
    if (words.length <= 15) {
      searchPhrases.push(words.join(' '));
    }
    
    // Try larger chunks
    if (words.length > 15) {
      // First 15 words
      searchPhrases.push(words.slice(0, 15).join(' '));
      // Last 15 words
      searchPhrases.push(words.slice(-15).join(' '));
    }
    
    // Add smaller fallback phrases
    for (let i = 0; i < Math.min(words.length - 2, 5); i++) {
      searchPhrases.push(words.slice(i, i + 3).join(' '));
    }
    
    return searchPhrases;
  };

  const highlightText = useCallback(async (text, attempt = 0) => {
    if (!text || !containerRef.current) return false;
    
    clearHighlights();
    
    const searchPhrases = findBestMatch(text);
    const currentPhrase = searchPhrases[attempt % searchPhrases.length];
    
    if (!currentPhrase) return false;

    console.log(`Attempting to highlight: "${currentPhrase}"`);

    try {
      await searchPluginInstance.highlight({
        keyword: currentPhrase,
        matchCase: false,
      });

      // Check if highlight was successful
      const highlight = containerRef.current.querySelector('.rpv-search__highlight');
      if (highlight) {
        console.log('Highlight successful');
        return true;
      } else {
        console.log('Highlight not found');
        return false;
      }
    } catch (error) {
      console.error('Highlight error:', error);
      return false;
    }
  }, [searchPluginInstance, clearHighlights]);

  useEffect(() => {
    if (!activeSource || !containerRef.current) return;

    const { text } = activeSource;
    if (!text) return;

    let timeoutId;
    
    const attemptHighlight = async () => {
      // Wait for PDF to be fully rendered
      timeoutId = setTimeout(async () => {
        const success = await highlightText(text, searchAttempts);
        
        if (success) {
          // If highlight successful, scroll to it
          const highlight = containerRef.current?.querySelector('.rpv-search__highlight');
          if (highlight) {
            highlight.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              
            });
          }
        } else if (searchAttempts < 5) {
          // Try next search phrase if available
          setSearchAttempts(prev => prev + 1);
        }
      }, 300);
    };

    attemptHighlight();

    return () => {
      clearTimeout(timeoutId);
      clearHighlights();
    };
  }, [activeSource, highlightText, searchAttempts, clearHighlights]);

  // Reset search attempts when source changes
  useEffect(() => {
    setSearchAttempts(0);
  }, [activeSource]);

  // Add CSS to your global styles or component
  useEffect(() => {
    // Add custom CSS for highlighting
    const style = document.createElement('style');
    style.textContent = `
      .source-highlight {
        background-color: rgba(255, 255, 0, 0.4) !important;
        border: 1px solid rgba(255, 200, 0, 0.6) !important;
        box-shadow: 0 0 3px rgba(255, 200, 0, 0.3) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-full w-full relative" ref={containerRef}>
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10 bg-white/90 p-1.5 rounded-lg shadow-sm border border-border">
        <ZoomOut>
          {(props) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={props.onClick}
            >
              <Minus size={14} />
            </Button>
          )}
        </ZoomOut>
        <ZoomIn>
          {(props) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={props.onClick}
            >
              <Plus size={14} />
            </Button>
          )}
        </ZoomIn>
      </div>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
        <div className="h-full">
          <Viewer
            fileUrl={url}
            plugins={[
              zoomPluginInstance,
              scrollModePluginInstance,
              searchPluginInstance,
            ]}
            defaultScale={SpecialZoomLevel.PageFit}
          />
        </div>
      </Worker>
    </div>
  );
};

export default PdfViewer; 