import { Position } from "../interfaces";

const toRadian = angle => (Math.PI / 180) * angle;

// 구면 코사인 법칙 d = acos( sin φ 1 ⋅ sin φ 2 + cos φ 1 ⋅ cos φ 2 ⋅ cos Δλ ) ⋅ R
export const calDistance = (point1:Position, point2: Position) => {
  const lat1 = point1.latitude
  const lon1 = point1.longitude;
  const lat2 = point2.latitude;
  const lon2 = point2.longitude;
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLon = toRadian(lon2 - lon1);
  const radLat1 = toRadian(lat1);
  const radLat2 = toRadian(lat2);
  
  return Math.acos(
    Math.sin(radLat1) * Math.sin(radLat2) + // sin φ 1 ⋅ sin φ 2
    Math.cos(radLat1) * // cos φ 1 ⋅ cos φ 2 ⋅ cos Δλ
    Math.cos(radLat2) *
    Math.cos(dLon)
  ) * RADIUS_OF_EARTH_IN_KM;
};