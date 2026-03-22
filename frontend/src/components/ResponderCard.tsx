import { Activity, Heart, Wind, Droplets, Thermometer, Battery, Signal, MapPin } from 'lucide-react';
import { Responder } from '../types';

interface ResponderCardProps {
  responder: Responder;
  onClick: () => void;
}

export function ResponderCard({ responder, onClick }: ResponderCardProps) {
  const getStatusColor = () => {
    const { vitals, gasExposure } = responder;

    if (
      vitals.heartRate > 120 ||
      vitals.spO2 < 90 ||
      gasExposure.co > 200 ||
      vitals.fatigueLevel > 80
    ) {
      return 'border-red-500 bg-red-500/10';
    }

    if (
      vitals.heartRate > 100 ||
      vitals.fatigueLevel > 60 ||
      gasExposure.co > 35
    ) {
      return 'border-orange-500 bg-orange-500/10';
    }

    return 'border-emerald-500 bg-emerald-500/5';
  };

  const getStatusDot = () => {
    const colorClass = getStatusColor();
    if (colorClass.includes('red')) return 'bg-red-500';
    if (colorClass.includes('orange')) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 ${getStatusColor()} backdrop-blur-sm transition-all hover:scale-[1.02] text-left`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusDot()} animate-pulse`} />
            <h3 className="font-semibold text-white">{responder.name}</h3>
          </div>
          <p className="text-sm text-slate-400">{responder.role}</p>
          <p className="text-xs text-slate-500 mt-1">{responder.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Battery className={`w-3 h-3 ${responder.device.batteryLevel < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
            <span>{responder.device.batteryLevel.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Signal className="w-3 h-3" />
            <span>{responder.device.signalStrength.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Heart className="w-4 h-4 text-red-400" />
          <span>{responder.vitals.heartRate.toFixed(0)} BPM</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>{responder.vitals.spO2.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span>{responder.vitals.respiratoryRate.toFixed(0)} /min</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Thermometer className="w-4 h-4 text-orange-400" />
          <span>{responder.vitals.bodyTemperature.toFixed(1)}°C</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Fatigue Level</span>
          <span className={`font-semibold ${
            responder.vitals.fatigueLevel > 80 ? 'text-red-400' :
            responder.vitals.fatigueLevel > 60 ? 'text-orange-400' : 'text-emerald-400'
          }`}>
            {responder.vitals.fatigueLevel.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full transition-all ${
              responder.vitals.fatigueLevel > 80 ? 'bg-red-500' :
              responder.vitals.fatigueLevel > 60 ? 'bg-orange-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${responder.vitals.fatigueLevel}%` }}
          />
        </div>
      </div>
    </button>
  );
}
