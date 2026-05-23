export default function HeroIceCream({ className = '' }) {
  return (
    <div className={`hero-ice-art ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 360 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="180" cy="400" rx="120" ry="16" fill="#ff4d8d" opacity="0.1" />
        <g className="hero-scoop-float">
          <path
            d="M72 200 L180 390 L288 200 Z"
            fill="#E8B87A"
            stroke="#D49A5C"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M92 200 L180 350 L268 200"
            fill="none"
            stroke="#C88E4E"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
          <circle cx="180" cy="168" r="72" fill="#FFB8D2" />
          <circle cx="180" cy="162" r="72" fill="#FF4D8D" />
          <ellipse cx="148" cy="138" rx="22" ry="14" fill="#fff" opacity="0.28" />
          <circle cx="132" cy="88" r="52" fill="#FFD6E8" />
          <circle cx="132" cy="80" r="52" fill="#FF8FB8" />
          <ellipse cx="108" cy="62" rx="16" ry="10" fill="#fff" opacity="0.35" />
          <path
            d="M228 48 C238 28 262 32 268 58 C274 82 252 96 236 88"
            stroke="#2E7D32"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="268" cy="52" r="16" fill="#E53935" />
          <circle cx="268" cy="46" r="5" fill="#fff" opacity="0.45" />
        </g>
        <circle cx="88" cy="120" r="8" fill="#5E35B1" opacity="0.75" />
        <circle cx="292" cy="148" r="7" fill="#FFEB3B" />
        <circle cx="260" cy="200" r="6" fill="#4FC3F7" />
        <circle cx="108" cy="210" r="5" fill="#FF7043" opacity="0.8" />
        <circle cx="300" cy="100" r="5" fill="#AB47BC" opacity="0.7" />
      </svg>
    </div>
  );
}
