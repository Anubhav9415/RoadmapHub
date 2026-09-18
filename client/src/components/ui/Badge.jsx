const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#2da44e', bg: '#dafbe1' },
  under_review:{ label: 'Under Review',color: '#9a6700', bg: '#fff8c5' },
  planned:     { label: 'Planned',     color: '#0969da', bg: '#ddf4ff' },
  in_progress: { label: 'In Progress', color: '#8250df', bg: '#fbefff' },
  completed:   { label: 'Completed',   color: '#1a7f37', bg: '#d1f7e2' },
  closed:      { label: 'Closed',      color: '#57606a', bg: '#f6f8fa' },
};

const CATEGORY_CONFIG = {
  feature:     { label: 'Feature',     color: '#0969da', bg: '#ddf4ff' },
  bug:         { label: 'Bug',         color: '#cf222e', bg: '#ffebe9' },
  improvement: { label: 'Improvement', color: '#8250df', bg: '#fbefff' },
  other:       { label: 'Other',       color: '#57606a', bg: '#f6f8fa' },
};

const badgeStyle = (color, bg) => ({
  display:       'inline-flex',
  alignItems:    'center',
  padding:       '2px 10px',
  borderRadius:  '12px',
  fontSize:      '12px',
  fontWeight:    '600',
  letterSpacing: '0.01em',
  color,
  backgroundColor: bg,
  border:        `1px solid ${color}33`,
  whiteSpace:    'nowrap',
});

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return <span style={badgeStyle(cfg.color, cfg.bg)}>{cfg.label}</span>;
}

export function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
  return <span style={badgeStyle(cfg.color, cfg.bg)}>{cfg.label}</span>;
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
  value,
  label,
}));
