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

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PencilIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M14 6l4 4" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M9 7V4h6v3" />
  </svg>
);

export const EyeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10 10 0 0 1 12 6c6 0 10 7 10 7a17 17 0 0 1-3.5 4.1" />
    <path d="M6.6 6.6A17 17 0 0 0 2 13s4 7 10 7a10 10 0 0 0 4.5-1.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const ArchiveIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
    <path d="M10 12h4" />
  </svg>
);

export const BookmarkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 4h12v17l-6-4-6 4z" />
  </svg>
);

export const BookmarkFilledIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M6 4h12v17l-6-4-6 4z" />
  </svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ListIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const UsersIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15 20a5 5 0 0 1 6.5-4.8" />
  </svg>
);

export const FlameIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1-3 0-5 3-6z" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

export const CodeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 18l-6-6 6-6M16 6l6 6-6 6" />
  </svg>
);

export const ImageIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M4 18l5-5 4 4 3-3 4 4" />
  </svg>
);

export const QuoteIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 7h4v6H7zM13 7h4v6h-4z" />
    <path d="M7 13c0 3-2 4-2 4M13 13c0 3-2 4-2 4" />
  </svg>
);

export const AlertTriangleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l9 16H3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

export const AlertCircleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
);

export const CheckCircleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const LeafIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 19c0-8 5-13 14-13 0 9-5 14-14 13z" />
    <path d="M5 19c3-4 6-6 10-7" />
  </svg>
);

export const LightbulbIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10c.7.7 1 1.4 1 2h6c0-.6.3-1.3 1-2a6 6 0 0 0-4-10z" />
  </svg>
);

export const GripVerticalIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </svg>
);

export const DownloadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21V9" />
    <path d="M7 13l5-5 5 5" />
    <path d="M4 4h16" />
  </svg>
);

export const TableIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9 4v16M15 4v16" />
  </svg>
);

export const TerminalIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 9l3 3-3 3M13 15h4" />
  </svg>
);

export const TypeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7V5h16v2M9 5v14M7 19h4" />
  </svg>
);

export const HelpCircleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" />
  </svg>
);

export const XIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
