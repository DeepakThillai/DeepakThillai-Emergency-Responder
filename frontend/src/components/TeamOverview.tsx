import { Users, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Responder } from '../types';

interface TeamOverviewProps {
  responders: Responder[];
}

export function TeamOverview({ responders }: TeamOverviewProps) {
  const totalResponders = responders.length;
  const criticalAlerts = responders.filter(
    r => r.vitals.heartRate > 120 || r.vitals.spO2 < 90 || r.vitals.fatigueLevel > 80
  ).length;
  const averageFatigue = responders.reduce((sum, r) => sum + r.vitals.fatigueLevel, 0) / totalResponders;
  const averageDeploymentTime = responders.reduce((sum, r) => {
    return sum + (Date.now() - r.deploymentTime.getTime());
  }, 0) / totalResponders / 60000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
          <Users className="w-8 h-8 text-blue-400" />
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{totalResponders}</div>
            <div className="text-sm text-blue-300">Active Responders</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg p-4 border border-red-500/30">
        <div className="flex items-center justify-between mb-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{criticalAlerts}</div>
            <div className="text-sm text-red-300">Critical Alerts</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-lg p-4 border border-orange-500/30">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-8 h-8 text-orange-400" />
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{averageFatigue.toFixed(0)}%</div>
            <div className="text-sm text-orange-300">Avg Fatigue</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 rounded-lg p-4 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <Clock className="w-8 h-8 text-cyan-400" />
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{averageDeploymentTime.toFixed(0)}</div>
            <div className="text-sm text-cyan-300">Avg Time (min)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
