type UUID = string;
type DetectIconMap = Map<UUID, number>;

class DetectIconColor {
  private map: DetectIconMap;
  private currentNumber: number;

  constructor() {
    this.map = new Map();
    this.currentNumber = 1;
  }

  private getNextNumber(): number {
    const nextNumber = this.currentNumber;
    this.currentNumber = this.currentNumber === 9 ? 1 : this.currentNumber + 1;
    return nextNumber;
  }

  public addUUID(uuid: UUID): void {
    const sequentialNumber = this.getNextNumber();
    this.map.set(uuid, sequentialNumber);
  }

  public getColorByUUID(uuid: UUID): number {
    if (this.map.has(uuid)) {
      return this.map.get(uuid) as number;
    } else {
      this.addUUID(uuid);
      console.log(`Added ${uuid} ${this.map.get(uuid)} to DetectIconColor`);
      return this.map.get(uuid) as number;
    }
  }

  public getMap(): DetectIconMap {
    return this.map;
  }
}

export default DetectIconColor;
