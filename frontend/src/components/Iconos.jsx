// Íconos SVG simples (sin librerías externas).
const base = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const IconoVehiculo = () => (
  <svg {...base}>
    <path d="M3 16V7a1 1 0 0 1 1-1h10v10" />
    <path d="M14 9h4l3 4v3h-7" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export const IconoConductor = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);

export const IconoRuta = () => (
  <svg {...base}>
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" />
  </svg>
);

export const IconoCalendario = () => (
  <svg {...base}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="M8 14h3M8 17h6" />
  </svg>
);

export const IconoLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect width="32" height="32" rx="8" fill="currentColor" />
    <path
      d="M9 20c0-6 5-10 14-11-1 8-5 13-11 13-1 0-2-.3-3-1l-2 3"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
