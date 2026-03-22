import { Moon, Sun, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ControlPanelProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  isConnected: boolean;
}

export function ControlPanel({
  darkMode,
  onToggleDarkMode,
  onRefresh,
  isConnected,
}: ControlPanelProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            isConnected
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {isConnected
              ? <><Wifi className="w-4 h-4" /> Live — updates every 10s</>
              : <><WifiOff className="w-4 h-4" /> Backend offline</>
            }
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
