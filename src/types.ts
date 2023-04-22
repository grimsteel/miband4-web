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

export interface Band {
  id: number;
  nickname: string;
  macAddress: string;
  authKey: string;
  dateAdded: Date;
  deviceId: string;
  latestActivityTimestamp?: Date;
};

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