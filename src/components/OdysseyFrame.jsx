import React from 'react';

/**
 * OdysseyFrame
 *
 * Props:
 *  title        — large engraved heading inside the frame
 *  subtitle     — smaller body text below the rules
 *  illustration — <img> src for the sepia-toned artwork at the top
 *  caption      — text displayed below the outer frame
 *  dark         — boolean — use dark mat variant
 *  size         — 'sm' | 'md' (default) | 'lg'
 *  stacked      — boolean — render a ghost copy behind for the tilted-stack look
 *  className    — extra classes on the outer wrapper
 *  children     — extra content placed inside the mat
 */
const OdysseyFrame = ({
  title,
  subtitle,
  illustration,
  caption,
  dark = false,
  size,           // 'sm' | 'lg'
  stacked = false,
  className = '',
  children,
}) => {
  const sizeClass = size ? `odyssey-frame--${size}` : '';
  const darkClass = dark ? 'odyssey-frame--dark' : '';

  // Render function (not a nested component) so state/identity stays stable
  const renderFrame = () => (
    <div className={`odyssey-frame ${sizeClass} ${darkClass}`}>
      <div className="odyssey-mat">
        {/* Corner ornaments */}
        <span className="corner corner-tl" aria-hidden="true" />
        <span className="corner corner-tr" aria-hidden="true" />
        <span className="corner corner-bl" aria-hidden="true" />
        <span className="corner corner-br" aria-hidden="true" />

        {/* Optional illustration */}
        {illustration && (
          <img
            src={illustration}
            alt=""
            className="odyssey-illustration"
            aria-hidden="true"
          />
        )}

        {/* Top rule */}
        <div className="odyssey-rule" />

        {/* Title */}
        {title && <h2 className="odyssey-title">{title}</h2>}

        {/* Double rule */}
        <div className="odyssey-rule-double" />

        {/* Subtitle */}
        {subtitle && <p className="odyssey-subtitle">{subtitle}</p>}

        {/* Bottom rule */}
        <div className="odyssey-rule" />

        {/* Slot for custom children */}
        {children}
      </div>
    </div>
  );

  return (
    <div className={`odyssey-frame-wrapper ${className}`}>
      {stacked ? (
        <div className="odyssey-frame-stack">
          {/* Ghost frame (behind) */}
          {renderFrame()}
          {/* Primary frame (front) */}
          {renderFrame()}
        </div>
      ) : (
        renderFrame()
      )}

      {caption && <p className="odyssey-caption">{caption}</p>}
    </div>
  );
};

export default OdysseyFrame;
