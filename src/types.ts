import type { DBSchema } from "idb";

export interface ActivityItem {
  category: number;
  intensity: number;
  steps: number;
  heartRate: number;
  timestamp: Date;
}

export interface StoredActivityItem {
  totalSteps: number;
  averageHeartRate: number;
  timestamp: Date;
}

export interface IdleAlertsConfig {
  enabled: boolean;
  startTime: Time;
  endTime: Time;
}

export enum Weekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
  Everyday = 7
}

export const WeatherIcons = [
  { code: 0x00, icon: "sun", name: "Sun" },
  { code: 0x01, icon: "moon", name: "Partly Cloudy" },
  { code: 0x02, icon: "cloud", name: "Cloud" },
  { code: 0x03, icon: "sun-rain-cloud", name: "Partly Cloudy with Rain" },
  { code: 0x04, icon: "lightning-rain-cloud", name: "Thunderstorm" },
  { code: 0x05, icon: "lightning-snow-cloud", name: "Thunderstorm with Snow" },
  { code: 0x06, icon: "rain-snow-cloud", name: "Snow and Rain" },
  { code: 0x07, icon: "rain-3", name: "Light Rain" },
  { code: 0x08, icon: "rain-4", name: "Rain" },
  { code: 0x0C, icon: "rain-5", name: "Downpour" },
  { code: 0x09, icon: "rain-5-alt", name: "Heavy Rain" },
  { code: 0x0A, icon: "rain-6", name: "Heavy Downpour" },
  { code: 0x0D, icon: "sun-snow-cloud", name: "Partly Cloudy with Snow"},
  { code: 0x0E, icon: "snow-1", name: "Light Snow" },
  { code: 0x0F, icon: "snow-2", name: "Snow" },
  { code: 0x10, icon: "snow-3", name: "Heavy Snow" },
  { code: 0x11, icon: "snow-4", name: "Very Heavy Snow" },
  { code: 0x12, icon: "fog", name: "Fog" },
  { code: 0x13, icon: "hail", name: "Hail" },
  { code: 0x14, icon: "blowing-dust", name: "Blowing Dust" },
  { code: 0x1D, icon: "floating-dust", name: "Floating Dust" },
  { code: 0x1F, icon: "tornado", name: "Tornado" },
  { code: 0x35, icon: "haze", name: "Haze" },
];

export interface ForecastDay {
  high: number;
  low: number;
  text: string;
  icon: number;
}

export interface Alarm {
  id: number;
  time: Time;
  enabled: boolean;
  days: Set<Weekday>;
}

export interface Band {
  id: number;
  nickname: string;
  macAddress: string;
  authKey: string;
  dateAdded: Date;
  deviceId: string;
  latestActivityTimestamp?: Date;
  activityGoal?: number;
  goalNotifications?: boolean;
  idleAlerts?: IdleAlertsConfig;
  alarms?: Alarm[];
};

export interface Time {
  hour: number;
  minute: number;
}

export interface MiBandDB extends DBSchema {
  config: {
    key: "showBetaBanner";
    value: boolean;
  } | {
    key: "distanceUnit";
    value: "km" | "miles";
  };
  bands: {
    key: number;
    value: Band;
    indexes: {
      macAddress: string;
      deviceId: string;
    };
  };
  activityData: {
    key: number;
    value: {
      id: number;
      // Each item describes 1 day of activity. It will have at most 24 items, one for each hour of the day
      timestamp: Date; // start of the day
      bandId: number;
      items: StoredActivityItem[];
    };
    indexes: {
      "bandId-timestamp": [number, number];
    }
  }
}

export type UnsavedBand = Pick<Band, "authKey" | "macAddress" | "nickname" | "deviceId">;

export interface Config {
  showBetaBanner: boolean;
  distanceUnit: "km" | "miles";
};

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}