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
  const searchPluginInstance = useRef(
    searchPlugin({
      onHighlightKeyword: (props) => {
        props.highlightEle.classList.add('source-highlight');
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

  const highlightText = useCallback((text) => {
    if (!text || !containerRef.current) return;
    
    clearHighlights();

    // Clean and prepare the text for matching
    const cleanText = text.trim();
    
    // Try different matching strategies
    const matchStrategies = [
      cleanText, // Try exact match first
      cleanText.substring(0, Math.min(150, cleanText.length)), // Try first 150 chars
      // For numbers, try to match the numeric portion
      cleanText.match(/\d+/)?.[0],
      // For longer text, try to match complete sentences
      cleanText.match(/[^.!?]+[.!?]+/)?.[0]?.trim(),
    ].filter(Boolean);

    // Try each strategy until we find matches
    for (const matchText of matchStrategies) {
      searchPluginInstance.highlight({
        keyword: matchText,
        matchCase: true,
      });

      // If we found any highlights, stop trying other strategies
      const hasHighlights = containerRef.current.querySelector('.rpv-search__highlight');
      if (hasHighlights) break;
    }
  }, [searchPluginInstance, clearHighlights]);

  useEffect(() => {
    if (!activeSource || !containerRef.current) return;

    const { text } = activeSource;
    if (!text) return;

    const timer = setTimeout(() => {
      highlightText(text);
      
      // Wait a bit for the highlight to be added to DOM
      setTimeout(() => {
        const highlight = containerRef.current?.querySelector('.rpv-search__highlight');
        if (highlight) {
          highlight.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
    }, 300);

    return () => {
      clearTimeout(timer);
      clearHighlights();
    };
  }, [activeSource, highlightText, clearHighlights]);

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