"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// ApexCharts touches `window`, so it must never render on the server.
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PALETTE = ["#405189", "#0ab39c", "#f7b84b", "#f06548", "#299cdb", "#6559cc"];

export function RevenueAreaChart({
  days,
  totals,
}: {
  days: string[];
  totals: number[];
}) {
  const options: ApexOptions = {
    chart: { type: "area", height: 320, toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#0ab39c"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    xaxis: { categories: days, labels: { rotate: -45, style: { fontSize: "11px" } } },
    yaxis: { labels: { formatter: (v) => `${Math.round(v)} ₾` } },
    tooltip: { y: { formatter: (v) => `${v.toLocaleString("en-US")} ₾` } },
    grid: { borderColor: "#e2e8f0", strokeDashArray: 4 },
  };

  return (
    <ReactApexChart
      type="area"
      height={320}
      options={options}
      series={[{ name: "Revenue", data: totals }]}
    />
  );
}

export function SalesByTypeDonut({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const options: ApexOptions = {
    chart: { type: "donut", height: 320, fontFamily: "inherit" },
    labels,
    colors: PALETTE,
    legend: { position: "bottom" },
    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
    stroke: { width: 2 },
    tooltip: { y: { formatter: (v) => `${v.toLocaleString("en-US")} ₾` } },
    plotOptions: { pie: { donut: { size: "62%" } } },
  };

  return <ReactApexChart type="donut" height={320} options={options} series={values} />;
}
