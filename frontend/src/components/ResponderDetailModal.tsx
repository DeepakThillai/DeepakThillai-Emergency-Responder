import { X, MapPin, Clock, Battery, Signal, Activity } from 'lucide-react';
import { Responder } from '../types';
import { VitalSignsChart } from './VitalSignsChart';
import { GasExposurePanel } from './GasExposurePanel';

interface ResponderDetailModalProps {
  responder: Responder;
  onClose: () => void;
}

export function ResponderDetailModal({ responder, onClose }: ResponderDetailModalProps) {
  const deploymentDuration = Date.now() - responder.deploymentTime.getTime();
  const hours = Math.floor(deploymentDuration / 3600000);
  const minutes = Math.floor((deploymentDuration % 3600000) / 60000);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">{responder.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="bg-slate-800 px-3 py-1 rounded">{responder.role}</span>
              <span>{responder.id}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Deployed: {hours}h {minutes}m</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Battery className="w-5 h-5" />
                <span className="font-medium">Battery Status</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {responder.device.batteryLevel.toFixed(0)}%
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    responder.device.batteryLevel > 50 ? 'bg-emerald-500' :
                    responder.device.batteryLevel > 20 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${responder.device.batteryLevel}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Mode: {responder.device.mode}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Signal className="w-5 h-5" />
                <span className="font-medium">Signal Strength</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {responder.device.signalStrength.toFixed(0)}%
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${responder.device.signalStrength}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Last sync: {responder.device.lastSync.toLocaleTimeString()}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">GPS Location</span>
              </div>
              <div className="text-sm text-white mb-1">
                Lat: {responder.device.gpsLat.toFixed(4)}°
              </div>
              <div className="text-sm text-white">
                Lon: {responder.device.gpsLon.toFixed(4)}°
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Bluetooth 5.0 - Range: 100m
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Vital Signs Monitoring
            </h3>
            <VitalSignsChart responder={responder} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Blood Pressure</div>
              <div className="text-xl font-bold text-white">
                {responder.vitals.bloodPressureSystolic.toFixed(0)}/
                {responder.vitals.bloodPressureDiastolic.toFixed(0)}
              </div>
              <div className="text-xs text-slate-500">mmHg</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Heart Rate</div>
              <div className="text-xl font-bold text-white">
                {responder.vitals.heartRate.toFixed(0)}
              </div>
              <div className="text-xs text-slate-500">BPM</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">SpO2</div>
              <div className="text-xl font-bold text-white">
                {responder.vitals.spO2.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">%</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Fatigue Level</div>
              <div className={`text-xl font-bold ${
                responder.vitals.fatigueLevel > 80 ? 'text-red-400' :
                responder.vitals.fatigueLevel > 60 ? 'text-orange-400' : 'text-emerald-400'
              }`}>
                {responder.vitals.fatigueLevel.toFixed(0)}%
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Gas Exposure Monitoring</h3>
            <GasExposurePanel gasExposure={responder.gasExposure} />
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Device Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Weight</div>
                <div className="text-white font-medium">&lt;100g</div>
              </div>
              <div>
                <div className="text-slate-500">Battery Life</div>
                <div className="text-white font-medium">24-48 hours</div>
              </div>
              <div>
                <div className="text-slate-500">Charge Time</div>
                <div className="text-white font-medium">2-3 hours</div>
              </div>
              <div>
                <div className="text-slate-500">Water Resistance</div>
                <div className="text-white font-medium">IP67</div>
              </div>
              <div>
                <div className="text-slate-500">Operating Temp</div>
                <div className="text-white font-medium">-20°C to 60°C</div>
              </div>
              <div>
                <div className="text-slate-500">Wireless Range</div>
                <div className="text-white font-medium">100m (BT 5.0)</div>
              </div>
              <div>
                <div className="text-slate-500">Data Interval</div>
                <div className="text-white font-medium">1-5 seconds</div>
              </div>
              <div>
                <div className="text-slate-500">Connectivity</div>
                <div className="text-white font-medium">Bluetooth/WiFi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
