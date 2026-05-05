import React, { useRef, useState } from 'react';

const OUTPUT_SIZE = 800; // output canvas is always 800×800 px (square)
const MAX_PREVIEW = 560; // max display width/height in the modal

const ImageCropper = ({ src, fileName, onCrop, onCancel }) => {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [dispSize, setDispSize] = useState({ w: MAX_PREVIEW, h: MAX_PREVIEW });
  const [box, setBox] = useState({ x: 0, y: 0, size: 100 });

  const handleImgLoad = () => {
    const img = imgRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const s = Math.min(MAX_PREVIEW / nw, MAX_PREVIEW / nh, 1);
    const dw = Math.round(nw * s);
    const dh = Math.round(nh * s);
    const cropSize = Math.round(Math.min(dw, dh) * 0.85);
    setScale(s);
    setDispSize({ w: dw, h: dh });
    setBox({ x: Math.round((dw - cropSize) / 2), y: Math.round((dh - cropSize) / 2), size: cropSize });
    setLoaded(true);
  };

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startBox = { ...box };
    const { w, h } = dispSize;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (type === 'move') {
        setBox({
          x: Math.max(0, Math.min(w - startBox.size, startBox.x + dx)),
          y: Math.max(0, Math.min(h - startBox.size, startBox.y + dy)),
          size: startBox.size,
        });
      } else {
        // resize-se: drag bottom-right corner, keep 1:1 ratio
        const delta = (dx + dy) / 2;
        const maxSize = Math.min(w - startBox.x, h - startBox.y);
        const ns = Math.max(40, Math.min(maxSize, startBox.size + delta));
        setBox({ x: startBox.x, y: startBox.y, size: ns });
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTouchStart = (e, type) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startBox = { ...box };
    const { w, h } = dispSize;

    const onMove = (ev) => {
      const t = ev.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (type === 'move') {
        setBox({
          x: Math.max(0, Math.min(w - startBox.size, startBox.x + dx)),
          y: Math.max(0, Math.min(h - startBox.size, startBox.y + dy)),
          size: startBox.size,
        });
      } else {
        const delta = (dx + dy) / 2;
        const maxSize = Math.min(w - startBox.x, h - startBox.y);
        const ns = Math.max(40, Math.min(maxSize, startBox.size + delta));
        setBox({ x: startBox.x, y: startBox.y, size: ns });
      }
    };

    const onEnd = () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');

    const sx = box.x / scale;
    const sy = box.y / scale;
    const sSize = box.size / scale;

    ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob(
      (blob) => {
        const name = fileName ? fileName.replace(/\.[^.]+$/, '.jpg') : 'product.jpg';
        onCrop(new File([blob], name, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  };

  const modalStyle = {
    background: '#fff', borderRadius: 12, padding: 24,
    maxWidth: MAX_PREVIEW + 80, width: '95vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>Crop Product Image</h3>
            <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
              Square 1:1 · Output {OUTPUT_SIZE}×{OUTPUT_SIZE}px · Drag box to move, drag corner to resize
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>✕</button>
        </div>

        {/* Image + crop overlay */}
        <div
          style={{
            position: 'relative', width: dispSize.w, height: dispSize.h,
            margin: '0 auto', userSelect: 'none', overflow: 'hidden',
            background: '#f3f4f6', borderRadius: 6,
          }}
        >
          <img
            ref={imgRef}
            src={src}
            onLoad={handleImgLoad}
            alt="Crop source"
            draggable={false}
            style={{ display: 'block', width: dispSize.w, height: dispSize.h, userSelect: 'none' }}
          />

          {loaded && (
            <>
              {/* Dark overlay: top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: box.y, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
              {/* Bottom */}
              <div style={{ position: 'absolute', top: box.y + box.size, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
              {/* Left */}
              <div style={{ position: 'absolute', top: box.y, left: 0, width: box.x, height: box.size, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
              {/* Right */}
              <div style={{ position: 'absolute', top: box.y, left: box.x + box.size, right: 0, height: box.size, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />

              {/* Crop frame */}
              <div
                style={{
                  position: 'absolute', top: box.y, left: box.x,
                  width: box.size, height: box.size,
                  border: '2px solid #fff', boxSizing: 'border-box',
                  cursor: 'move',
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                onTouchStart={(e) => handleTouchStart(e, 'move')}
              >
                {/* Rule-of-thirds grid */}
                {[1, 2].map((i) => (
                  <React.Fragment key={i}>
                    <div style={{ position: 'absolute', top: `${i * 33.33}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', left: `${i * 33.33}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  </React.Fragment>
                ))}

                {/* Corner indicators (non-interactive) */}
                {[
                  { top: -3, left: -3 }, { top: -3, right: -3 },
                  { bottom: -3, left: -3 }, { bottom: -3, right: -3 },
                ].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', width: 10, height: 10, border: '2px solid #fff', ...pos, pointerEvents: 'none' }} />
                ))}

                {/* SE resize handle */}
                <div
                  style={{
                    position: 'absolute', bottom: -6, right: -6,
                    width: 14, height: 14, background: '#fff', borderRadius: 3,
                    cursor: 'se-resize', zIndex: 1,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'resize')}
                  onTouchStart={(e) => handleTouchStart(e, 'resize')}
                />
              </div>
            </>
          )}
        </div>

        {/* Size info */}
        {loaded && (
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6b7280', marginTop: 8 }}>
            Crop area: {Math.round(box.size / scale)}×{Math.round(box.size / scale)}px of original
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={applyCrop}
            disabled={!loaded}
            style={{
              padding: '8px 22px', borderRadius: 6, border: 'none',
              background: loaded ? '#2563eb' : '#93c5fd', color: '#fff',
              cursor: loaded ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.95rem',
            }}
          >
            Crop & Use
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
