import { useEffect } from "react";

const HEIGHT_PROPERTY = "--visual-viewport-height";

const BOTTOM_INSET_PROPERTY = "--visual-viewport-bottom-inset";

function writeVisualViewportProperties(viewport: VisualViewport): void {
  const hiddenBottomInPixels = window.innerHeight - viewport.offsetTop - viewport.height;
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty(HEIGHT_PROPERTY, `${viewport.height}px`);
  rootStyle.setProperty(BOTTOM_INSET_PROPERTY, `${Math.max(hiddenBottomInPixels, 0)}px`);
}

function clearVisualViewportProperties(): void {
  const rootStyle = document.documentElement.style;

  rootStyle.removeProperty(HEIGHT_PROPERTY);
  rootStyle.removeProperty(BOTTOM_INSET_PROPERTY);
}

function subscribeToVisualViewport(viewport: VisualViewport): () => void {
  function handleViewportChange(): void {
    writeVisualViewportProperties(viewport);
  }

  handleViewportChange();
  viewport.addEventListener("resize", handleViewportChange);
  viewport.addEventListener("scroll", handleViewportChange);

  return () => {
    viewport.removeEventListener("resize", handleViewportChange);
    viewport.removeEventListener("scroll", handleViewportChange);
    clearVisualViewportProperties();
  };
}

export function useVisualViewport(): void {
  useEffect(() => {
    const viewport = window.visualViewport;

    if (viewport === null) {
      return;
    }

    return subscribeToVisualViewport(viewport);
  }, []);
}
