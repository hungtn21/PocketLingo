import React, { useEffect, useMemo, useRef, useState } from "react";

export type HighlightItem = { image: string; title: string; desc: string };

interface Props {
  items: HighlightItem[];
  /** Number of cards visible at once. Default: 3 */
  visible?: number;
}

const HighlightCarousel: React.FC<Props> = ({ items, visible = 3 }) => {
  const base = items.length;
  const extended = useMemo(() => [...items, ...items, ...items], [items]);
  const [index, setIndex] = useState(base); // start in middle chunk
  const [withTransition, setWithTransition] = useState(true);
  const [itemWidth, setItemWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const recalc = () => {
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    setItemWidth(vw / Math.max(1, visible));
  };

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handlePrev = () => setIndex((i) => i - 1);
  const handleNext = () => setIndex((i) => i + 1);

  const onTransitionEnd = () => {
    // Seamless loop: jump back into middle chunk without transition
    if (index >= 2 * base) {
      setWithTransition(false);
      setIndex((i) => i - base);
    } else if (index < base) {
      setWithTransition(false);
      setIndex((i) => i + base);
    }
  };

  // Re-enable transition after a jump frame
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => setWithTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  const trackStyle: React.CSSProperties = {
    width: `${extended.length * (itemWidth || 1)}px`,
    transform: `translateX(-${index * (itemWidth || 0)}px)`,
    transition: withTransition ? "transform 0.4s ease" : "none",
  };

  return (
    <div className="hl-carousel d-flex align-items-center">
      <button className="nav-arrow" aria-label="prev" onClick={handlePrev}>
        ‹
      </button>
      <div className="hl-carousel-viewport flex-grow-1 mx-2" ref={viewportRef}>
        <div className="hl-carousel-track" style={trackStyle} onTransitionEnd={onTransitionEnd}>
          {extended.map((h, idx) => (
            <div
              key={idx}
              className="hl-carousel-item"
              style={{ width: itemWidth || undefined }}
            >
              <div className="highlight-card p-3 text-center h-100">
                <div className="hl-img mb-2">
                  <img src={h.image} alt={h.title} />
                </div>
                <div className="hl-title fw-bold">{h.title}</div>
                <div className="hl-desc text-muted">{h.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="nav-arrow" aria-label="next" onClick={handleNext}>
        ›
      </button>
    </div>
  );
};

export default HighlightCarousel;
