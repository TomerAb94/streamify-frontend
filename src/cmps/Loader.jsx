export function Loader({
  size = 6,     // dot diameter px
  gap = 4,      // space between dots px
  speed = 0.8,   // seconds per cycle (matches your sample)
  color = 'var(--color-text-secondary)',
  className = '',
  label = 'Loading…',
  center = false, // when true, use the centering helper container
}) {
  const styleVars = {
    '--ls-size': `${size}px`,
    '--ls-gap': `${gap}px`,
    '--ls-speed': `${speed}s`,
    '--ls-color': color,
  }

  const content = (
    <div className={`loader ${className}`} role="status" aria-live="polite" aria-label={label} style={styleVars}>
      <div className="ball1" aria-hidden="true"></div>
      <div className="ball1" aria-hidden="true"></div>
      <div className="ball1" aria-hidden="true"></div>
    </div>
  )

  return center ? <div className="loader-center">{content}</div> : content
}