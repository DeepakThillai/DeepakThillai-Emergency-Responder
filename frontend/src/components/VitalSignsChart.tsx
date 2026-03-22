import { Responder } from '../types';

interface VitalSignsChartProps {
  responder: Responder;
}

export function VitalSignsChart({ responder }: VitalSignsChartProps) {
  const maxDataPoints = 30;
  const history = responder.vitalHistory.slice(-maxDataPoints);

  const renderLineChart = (
    data: number[],
    color: string,
    min: number,
    max: number
  ) => {
    if (data.length < 2) return null;

    const width = 100;
    const height = 40;
    const padding = 5;

    const range = max - min;
    const xStep = (width - padding * 2) / (data.length - 1);

    const points = data.map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const heartRateData = history.map(h => h.vitals.heartRate);
  const spO2Data = history.map(h => h.vitals.spO2);
  const respRateData = history.map(h => h.vitals.respiratoryRate);
  const tempData = history.map(h => h.vitals.bodyTemperature);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Heart Rate</span>
          <span className="text-lg font-semibold text-red-400">
            {responder.vitals.heartRate.toFixed(0)} BPM
          </span>
        </div>
        {renderLineChart(heartRateData, '#f87171', 40, 160)}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">SpO2</span>
          <span className="text-lg font-semibold text-blue-400">
            {responder.vitals.spO2.toFixed(1)}%
          </span>
        </div>
        {renderLineChart(spO2Data, '#60a5fa', 85, 100)}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Respiratory Rate</span>
          <span className="text-lg font-semibold text-cyan-400">
            {responder.vitals.respiratoryRate.toFixed(0)} /min
          </span>
        </div>
        {renderLineChart(respRateData, '#22d3ee', 8, 30)}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Body Temperature</span>
          <span className="text-lg font-semibold text-orange-400">
            {responder.vitals.bodyTemperature.toFixed(1)}°C
          </span>
        </div>
        {renderLineChart(tempData, '#fb923c', 35, 40)}
      </div>
    </div>
  );
}
