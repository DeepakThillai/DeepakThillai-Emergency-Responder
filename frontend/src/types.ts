export interface VitalSigns {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  respiratoryRate: number;
  spO2: number;
  bodyTemperature: number;
  fatigueLevel: number;
}

export interface GasExposure {
  co: number;
  co2: number;
  o2: number;
  h2s: number;
  voc: number;
  ambientTemp: number;
  humidity: number;
}

export interface DeviceStatus {
  batteryLevel: number;
  signalStrength: number;
  lastSync: Date;
  gpsLat: number;
  gpsLon: number;
  mode: 'Active' | 'Standby' | 'Charging';
}

export interface Alert {
  id: string;
  responderId: string;
  responderName: string;
  type: 'Critical' | 'Warning' | 'Info';
  category: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface Responder {
  id: string;
  name: string;
  role: string;
  vitals: VitalSigns;
  gasExposure: GasExposure;
  device: DeviceStatus;
  deploymentTime: Date;
  vitalHistory: Array<{ timestamp: Date; vitals: VitalSigns }>;
  gasHistory: Array<{ timestamp: Date; gas: GasExposure }>;
}

export interface SimulationSettings {
  speed: number;
  isPaused: boolean;
  emergencyScenario: string | null;
}

export type AlertThresholds = {
  heartRate: { min: number; max: number };
  bloodPressure: { systolic: number; diastolic: number };
  respiratoryRate: { min: number; max: number };
  spO2: { min: number };
  bodyTemperature: { min: number; max: number };
  co: { warning: number; danger: number };
  co2: { warning: number; danger: number };
  o2: { min: number; max: number };
  h2s: { warning: number; danger: number };
  fatigueLevel: { warning: number; danger: number };
};
