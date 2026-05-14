import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ICONS, type IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface IconProps {
  name: IconName;
  className?: string;
  fixedWidth?: boolean;
  "aria-label"?: string;
}

export function Icon({
  name,
  className,
  fixedWidth,
  "aria-label": ariaLabel,
}: IconProps) {
  return (
    <FontAwesomeIcon
      icon={ICONS[name]}
      className={cn(className)}
      fixedWidth={fixedWidth}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  );
}
