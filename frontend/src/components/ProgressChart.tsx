import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ExerciseProgress } from "../types";

interface Props {
  data: ExerciseProgress[];
}

export default function ProgressChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", background: "var(--surface-2)", borderRadius: 12 }}>
        No data logged for this exercise yet. Go crush some weights!
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div style={{ width: "100%", height: 320, background: "var(--surface-2)", padding: "20px 20px 20px 0", borderRadius: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          
          <XAxis dataKey="formattedDate" stroke="var(--text-muted)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
            itemStyle={{ color: "var(--accent)" }}
            formatter={(value: unknown) => [`${value} kg`, 'Max Weight']}
          />
          
          <Line 
            type="monotone" 
            dataKey="max_weight" 
            stroke="var(--accent)" 
            strokeWidth={3}
            dot={{ fill: "var(--surface-2)", stroke: "var(--accent)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "var(--accent)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}