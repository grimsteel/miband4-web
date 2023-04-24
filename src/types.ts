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

export enum WeatherIcon {
  Sun = 0x00,
  SunCloud = 0x01,
  Cloud = 0x02,
  SunRainCloud = 0x03,
  LightningCloud = 0x04,
  LightningSnowCloud = 0x05,
  RainSnowCloud = 0x06,
  RainCloud3 = 0x07,
  RainCloud4 = 0x08,
  RainCloud5 = 0x09,
  RainCloud6 = 0x0A,
  SnowCloud1 = 0x0E,
  SnowCloud2 = 0x0F,
  SnowCloud3 = 0x10,
  SnowCloud4 = 0x11,
  Sleet = 0x12,
  RainSleetCloud = 0x13,
  CurledSandstorm = 0x14,
  Sandstorm = 0x1D,
  Tornado = 0x1F
}

export interface ForecastDay {
  high: number;
  low: number;
  text: string;
  icon: WeatherIcon;
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