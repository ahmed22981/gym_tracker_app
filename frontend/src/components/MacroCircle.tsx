interface MacroCircleProps {
  label: string;
  value: number;
  unit: string;
  color: string; 
  size?: number; 
  strokeWidth?: number; 
}

export default function MacroCircle({
  label,
  value,
  unit,
  color,
  size = 120,
  strokeWidth = 8,
}: MacroCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // بنخلي الدائرة مليانة دايماً في الداشبورد دي، بس الكود جاهز لو حبيت تعمله Progress مستقبلاً
  const offset = 0; 

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Hidden Circle */}
        <svg className="absolute transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Colored Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        {/* Number */}
        <div className="absolute flex flex-col items-center">
          <span className="font-display font-bold" style={{ fontSize: size * 0.2 }}>{value}</span>
          <span className="text-xs text-[--text-muted]">{unit}</span>
        </div>
      </div>
      {/* Macro Name */}
      <span className="text-sm font-semibold uppercase tracking-wider text-[--text-muted]">
        {label}
      </span>
    </div>
  );
}