export function WeatherIcon({ name, size = 48 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "sun":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="10" />
          <path d="M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4 4M46 46l4 4M14 50l4-4M46 18l4-4" />
        </svg>
      );
    case "cloud-sun":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="8" />
          <path d="M24 8v4M8 24h4M13 13l3 3" />
          <path d="M22 44h22a10 10 0 0 0 0-20 13 13 0 0 0-25 4" />
        </svg>
      );
    case "fog":
      return (
        <svg {...common}>
          <path d="M16 28h32M12 36h40M18 44h28" />
        </svg>
      );
    case "drizzle":
      return (
        <svg {...common}>
          <path d="M20 30h24a9 9 0 0 0 0-18 12 12 0 0 0-23 4" />
          <path d="M24 40v6M32 42v6M40 40v6" />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path d="M20 28h24a9 9 0 0 0 0-18 12 12 0 0 0-23 4" />
          <path d="M22 40l-3 8M32 40l-3 8M42 40l-3 8" />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path d="M20 28h24a9 9 0 0 0 0-18 12 12 0 0 0-23 4" />
          <path d="M24 42h0M32 46h0M40 42h0M28 50h0M36 50h0" strokeWidth="4" />
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <path d="M20 28h24a9 9 0 0 0 0-18 12 12 0 0 0-23 4" />
          <path d="M30 34l-6 10h8l-4 12" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M20 38h24a10 10 0 0 0 0-20 13 13 0 0 0-25 5" />
        </svg>
      );
  }
}
