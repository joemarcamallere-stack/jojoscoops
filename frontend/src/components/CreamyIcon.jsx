export default function CreamyIcon({ size = 32, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="24" cy="44" rx="14" ry="3" fill="#ff4d8d" opacity="0.12" />
      <path
        d="M14 22 L24 42 L34 22 Z"
        fill="#E8B87A"
        stroke="#D49A5C"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M16 22 L24 38 L32 22"
        fill="none"
        stroke="#D49A5C"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M15 22 L24 40 L33 22"
        fill="none"
        stroke="#C88E4E"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="24" cy="17" r="9.5" fill="#FFB8D2" />
      <circle cx="24" cy="16" r="9.5" fill="#FF4D8D" />
      <ellipse cx="20" cy="14" rx="3" ry="2" fill="#fff" opacity="0.35" />
      <circle cx="19" cy="9.5" r="6.5" fill="#FFD6E8" />
      <circle cx="19" cy="8.5" r="6.5" fill="#FF8FB8" />
      <ellipse cx="16.5" cy="7" rx="2" ry="1.2" fill="#fff" opacity="0.4" />
      <path
        d="M28 5 C30 3 33 4 33.5 6.5 C34 8.5 32 10 30 9.5"
        stroke="#2E7D32"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="33" cy="6" r="2.2" fill="#E53935" />
      <circle cx="33" cy="5.6" r="0.7" fill="#fff" opacity="0.5" />
      <circle cx="14" cy="12" r="1.2" fill="#5E35B1" opacity="0.8" />
      <circle cx="30" cy="14" r="1" fill="#FFEB3B" opacity="0.9" />
      <circle cx="27" cy="19" r="0.9" fill="#4FC3F7" opacity="0.85" />
    </svg>
  );
}
