import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function IconFrame({ title, children, ...props }: IconProps) {
  const labelled = Boolean(title);
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden={labelled ? undefined : true} role={labelled ? "img" : undefined} {...props}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function SourceIcon(props: IconProps) { return <IconFrame {...props}><path d="M5 3.5h10l4 4V20.5H5z" /><path d="M15 3.5v4h4M8 12h8M8 16h6" /></IconFrame>; }
export function DecisionIcon(props: IconProps) { return <IconFrame {...props}><path d="M4 20.5h16M6.5 18V9.5h11V18M4.5 9.5h15L12 3.5zM9 12.5v3M12 12.5v3M15 12.5v3" /></IconFrame>; }
export function PathIcon(props: IconProps) { return <IconFrame {...props}><circle cx="5" cy="6" r="2" /><circle cx="19" cy="12" r="2" /><circle cx="8" cy="19" r="2" /><path d="m6.7 7.1 10.6 3.8M17.5 13.7l-7.9 4" /></IconFrame>; }
export function CalculationIcon(props: IconProps) { return <IconFrame {...props}><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M8 7.5h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></IconFrame>; }
export function EvidenceIcon(props: IconProps) { return <IconFrame {...props}><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4.5 4.5M8 10.5h5M10.5 8v5" /></IconFrame>; }
export function BoundaryIcon(props: IconProps) { return <IconFrame {...props}><path d="M12 3.5 19 6v5.2c0 4.5-2.9 7.6-7 9.3-4.1-1.7-7-4.8-7-9.3V6z" /><path d="M12 8v4M12 15.5h.01" /></IconFrame>; }
export function MonitorIcon(props: IconProps) { return <IconFrame {...props}><path d="M4 19.5V4.5M4 19.5h16" /><path d="m7 15 3.4-3.3 2.9 1.8L18 8" /><circle cx="18" cy="8" r="1" /></IconFrame>; }
export function DownloadIcon(props: IconProps) { return <IconFrame {...props}><path d="M12 3.5v11M8 10.5l4 4 4-4M5 19.5h14" /></IconFrame>; }
export function ReferenceIcon(props: IconProps) { return <IconFrame {...props}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.1" /><path d="m12 4 1.2 5.9L20 12l-6.8 2.1L12 20l-1.2-5.9L4 12l6.8-2.1z" /></IconFrame>; }
export function DemocracyIcon(props: IconProps) { return <IconFrame {...props}><path d="M4 20h16M6 18v-7h12v7M4 11h16L12 4zM9 14v2M12 14v2M15 14v2" /><path d="M18.5 5.5v4M16.5 7.5h4" /></IconFrame>; }
export function CalendarIcon(props: IconProps) { return <IconFrame {...props}><rect x="4.5" y="5.5" width="15" height="14" rx="1.5" /><path d="M8 3.5v4M16 3.5v4M4.5 9.5h15M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" /></IconFrame>; }
export function HistoryIcon(props: IconProps) { return <IconFrame {...props}><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" /><path d="M4.5 4.5V9H9M12 8v4.3l2.8 1.8" /></IconFrame>; }
export function CheckCircleIcon(props: IconProps) { return <IconFrame {...props}><circle cx="12" cy="12" r="8" /><path d="m8.3 12 2.3 2.3 5.1-5.1" /></IconFrame>; }
