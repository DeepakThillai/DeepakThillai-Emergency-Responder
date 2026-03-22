import { Cloud, Droplet, Wind, AlertTriangle } from 'lucide-react';
import { GasExposure } from '../types';

interface GasExposurePanelProps {
  gasExposure: GasExposure;
}

export function GasExposurePanel({ gasExposure }: GasExposurePanelProps) {
  const getGasStatus = (value: number, safe: number, warning: number, danger: number) => {
    if (value >= danger) return { color: 'text-red-500', bg: 'bg-red-500/20', status: 'DANGER' };
    if (value >= warning) return { color: 'text-orange-500', bg: 'bg-orange-500/20', status: 'WARNING' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500/20', status: 'SAFE' };
  };

  const getO2Status = (value: number) => {
    if (value < 19.5 || value > 23.5) return { color: 'text-red-500', bg: 'bg-red-500/20', status: 'DANGER' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500/20', status: 'SAFE' };
  };

  const coStatus = getGasStatus(gasExposure.co, 0, 35, 200);
  const co2Status = getGasStatus(gasExposure.co2, 0, 5000, 10000);
  const o2Status = getO2Status(gasExposure.o2);
  const h2sStatus = getGasStatus(gasExposure.h2s, 0, 10, 50);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${coStatus.bg} rounded-lg p-4 border border-slate-700`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cloud className={`w-5 h-5 ${coStatus.color}`} />
              <span className="text-slate-300 font-medium">Carbon Monoxide</span>
            </div>
            <span className={`text-xs font-semibold ${coStatus.color}`}>{coStatus.status}</span>
          </div>
          <div className="text-2xl font-bold text-white">{gasExposure.co.toFixed(1)} PPM</div>
          <div className="text-xs text-slate-400 mt-1">Safe: &lt;35 PPM</div>
        </div>

        <div className={`${co2Status.bg} rounded-lg p-4 border border-slate-700`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cloud className={`w-5 h-5 ${co2Status.color}`} />
              <span className="text-slate-300 font-medium">Carbon Dioxide</span>
            </div>
            <span className={`text-xs font-semibold ${co2Status.color}`}>{co2Status.status}</span>
          </div>
          <div className="text-2xl font-bold text-white">{gasExposure.co2.toFixed(0)} PPM</div>
          <div className="text-xs text-slate-400 mt-1">Safe: &lt;5000 PPM</div>
        </div>

        <div className={`${o2Status.bg} rounded-lg p-4 border border-slate-700`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wind className={`w-5 h-5 ${o2Status.color}`} />
              <span className="text-slate-300 font-medium">Oxygen Level</span>
            </div>
            <span className={`text-xs font-semibold ${o2Status.color}`}>{o2Status.status}</span>
          </div>
          <div className="text-2xl font-bold text-white">{gasExposure.o2.toFixed(1)}%</div>
          <div className="text-xs text-slate-400 mt-1">Safe: 19.5-23.5%</div>
        </div>

        <div className={`${h2sStatus.bg} rounded-lg p-4 border border-slate-700`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${h2sStatus.color}`} />
              <span className="text-slate-300 font-medium">Hydrogen Sulfide</span>
            </div>
            <span className={`text-xs font-semibold ${h2sStatus.color}`}>{h2sStatus.status}</span>
          </div>
          <div className="text-2xl font-bold text-white">{gasExposure.h2s.toFixed(1)} PPM</div>
          <div className="text-xs text-slate-400 mt-1">Safe: &lt;10 PPM</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">VOC Level</div>
          <div className="text-xl font-semibold text-white">{gasExposure.voc.toFixed(0)}</div>
          <div className="text-xs text-slate-500">0-500 scale</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Ambient Temp</div>
          <div className="text-xl font-semibold text-white">{gasExposure.ambientTemp.toFixed(1)}°C</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Humidity</div>
          <div className="text-xl font-semibold text-white">{gasExposure.humidity.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}
