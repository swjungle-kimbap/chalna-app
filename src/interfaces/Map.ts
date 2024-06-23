export interface AlaramItemProps {
  item: AlarmItem;
  expandedCardId: number | null;
  handleCardPress: (createAt: number) => void;
  navigate: () => void;
  removeAlarmItem: (idx:number) =>void;
}

export interface AlarmItem {
  createAt: string;
  message: string;
  senderId: string;
  overlapCount: string;
}

export interface GetAlarmData {
  code: string,
  data: AlarmItem[]
  message: string,
}