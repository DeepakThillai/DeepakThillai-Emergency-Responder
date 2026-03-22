import { useState, useEffect, useCallback } from 'react';
import { Shield, Bell, WifiOff } from 'lucide-react';
import { Responder, Alert } from './types';
import { fetchResponders, fetchAlerts, acknowledgeAlert, dismissAlert } from './utils/api';
import { ResponderCard } from './components/ResponderCard';
import { ResponderDetailModal } from './components/ResponderDetailModal';
import { AlertPanel } from './components/AlertPanel';
import { ControlPanel } from './components/ControlPanel';
import { TeamOverview } from './components/TeamOverview';

const POLL_INTERVAL_MS = 10_000;

function App() {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [selectedResponder, setSelectedResponder] = useState<Responder | null>(null);
  const [darkMode, setDarkMode]     = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [newResponders, newAlerts] = await Promise.all([
        fetchResponders(),
        fetchAlerts(),
      ]);
      setResponders(newResponders);
      setAlerts(newAlerts);
      setIsConnected(true);
      setLastUpdated(new Date());

      if (selectedResponder) {
        const updated = newResponders.find((r) => r.id === selectedResponder.id);
        if (updated) setSelectedResponder(updated);
      }
    } catch (err) {
      console.error('Failed to fetch data from backend:', err);
      setIsConnected(false);
    }
  }, [selectedResponder]);

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  useEffect(() => {
    const interval = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
    try {
      await acknowledgeAlert(alertId);
    } catch {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: false } : a)));
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      await dismissAlert(alertId);
    } catch {
      await loadData();
    }
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-100'} transition-colors`}>
      <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6">

        <header className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-lg p-6 border border-blue-700/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Emergency Response Command Center
                </h1>
                <p className="text-blue-200 text-sm md:text-base">
                  Real-Time Wearable Device Monitoring System
                </p>
                {lastUpdated && (
                  <p className="text-blue-300 text-xs mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isConnected && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>Backend offline</span>
                </div>
              )}
              <button
                onClick={() => setAlerts(prev => prev)}
                className="relative p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                <Bell className="w-6 h-6 text-white" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {activeAlerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <ControlPanel
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onRefresh={loadData}
          isConnected={isConnected}
        />

        <TeamOverview responders={responders} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded" />
              Active Responders
            </h2>

            {responders.length === 0 ? (
              <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p>{isConnected ? 'Loading responders…' : 'Cannot reach backend. Is the server running?'}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {responders.map((responder) => (
                  <ResponderCard
                    key={responder.id}
                    responder={responder}
                    onClick={() => setSelectedResponder(responder)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded" />
              Alert System
              {activeAlerts.length > 0 && (
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </h2>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <AlertPanel
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onDismiss={handleDismissAlert}
              />
            </div>
          </div>
        </div>

        {selectedResponder && (
          <ResponderDetailModal
            responder={selectedResponder}
            onClose={() => setSelectedResponder(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
