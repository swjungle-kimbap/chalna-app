export interface LocationData {
  latitude: number;
  longitude: number;
  distance : number;
}

export interface Position {
  latitude: number;
  longitude: number;
}

export interface AccuracyTestResult {
  userUUID: string;
  distance: number;
}

export interface TestResponse extends Array<AccuracyTestResult> {}