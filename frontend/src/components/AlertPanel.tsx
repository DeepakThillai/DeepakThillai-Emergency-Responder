import { AlertCircle, AlertTriangle, Info, X, Check } from 'lucide-react';
import { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export function AlertPanel({ alerts, onAcknowledge, onDismiss }: AlertPanelProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'Critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'Critical':
        return 'border-red-500 bg-red-500/10';
      case 'Warning':
        return 'border-orange-500 bg-orange-500/10';
      case 'Info':
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { Critical: 0, Warning: 1, Info: 2 };
    return priority[a.type] - priority[b.type] || b.timestamp.getTime() - a.timestamp.getTime();
  });

  const activeAlerts = sortedAlerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = sortedAlerts.filter(a => a.acknowledged);

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
      {activeAlerts.length === 0 && acknowledgedAlerts.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active alerts</p>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Active Alerts ({activeAlerts.length})
          </h3>
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 ${getAlertStyles(alert.type)} rounded-r-lg p-4 backdrop-blur-sm animate-in slide-in-from-right`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{alert.responderName}</span>
                    <span className="text-xs text-slate-500">{alert.responderId}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-1">{alert.message}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="bg-slate-700 px-2 py-1 rounded">{alert.category}</span>
                    <span>{alert.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
                    title="Acknowledge"
                  >
                    <Check className="w-4 h-4 text-emerald-500" />
                  </button>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Acknowledged ({acknowledgedAlerts.length})
          </h3>
          {acknowledgedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="border-l-4 border-slate-600 bg-slate-800/30 rounded-r-lg p-3 opacity-60"
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{alert.responderName}</span>
                  </div>
                  <p className="text-xs text-slate-400">{alert.message}</p>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
