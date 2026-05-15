/**
 * Mini icon set — SVG inline, stroke-based, style Lucide.
 * Évite d'ajouter `lucide-react` en v1. À étendre selon besoin.
 * Toutes les icônes : viewBox 24 24, stroke=currentColor, taille controlée par `size` prop.
 */

import * as React from "react";

interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  strokeWidth?: number;
}

const base = (props: IconProps): React.SVGAttributes<SVGElement> => ({
  width: props.size ?? 18,
  height: props.size ?? 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: props.strokeWidth ?? 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const StarIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l2.6 5.7L21 9.7l-4.6 4.4 1.1 6.4L12 17.4 6.5 20.5l1.1-6.4L3 9.7l6.4-1z" />
  </svg>
);

export const SparklesIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 4l1.5 4 4 1.5-4 1.5L12 15l-1.5-4-4-1.5 4-1.5z" />
    <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7z" />
  </svg>
);

export const BookIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" />
    <path d="M4 17a3 3 0 0 1 3-3h12" />
  </svg>
);

export const TrophyIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
    <path d="M16 4h3v3a3 3 0 0 1-3 3M8 4H5v3a3 3 0 0 0 3 3" />
    <path d="M10 14h4l-1 4h-2z" />
    <path d="M8 21h8" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

export const KeyIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="8" cy="14" r="4" />
    <path d="M11 11l9-9" />
    <path d="M16 6l3 3" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12l5 5L20 6" />
  </svg>
);
