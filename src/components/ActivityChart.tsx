"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export default function ActivityChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <div
      className="activity-chart"
      role="img"
      aria-label="Launches per UTC day in the selected sample. Exact values are available in the data table below."
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 8, bottom: 0, left: -24 }}
        >
          <CartesianGrid vertical={false} stroke="#ffffff09" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            stroke="#71889a"
            fontSize={9}
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            stroke="#71889a"
            fontSize={9}
          />
          <Tooltip
            cursor={{ fill: "#ffffff04" }}
            contentStyle={{
              background: "#121e2b",
              border: "1px solid #ffffff18",
              borderRadius: 6,
              fontSize: 11,
            }}
          />
          <Bar
            dataKey="count"
            name="Launches"
            fill="#8ce6da"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
