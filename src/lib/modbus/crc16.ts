/** CRC-16/Modbus: polynomial 0xA001 (reflected 0x8005), init 0xFFFF, no final xor. */
export function crc16Modbus(bytes: ArrayLike<number>): number {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] & 0xff;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
    }
  }
  return crc & 0xffff;
}

/** CRC as it appears on the wire: low byte first, then high byte. */
export function crcWireBytes(crc: number): [number, number] {
  return [crc & 0xff, (crc >>> 8) & 0xff];
}

export function toHexByte(n: number): string {
  return (n & 0xff).toString(16).toUpperCase().padStart(2, "0");
}

export function crcWireHex(crc: number): string {
  return crcWireBytes(crc).map(toHexByte).join(" ");
}
