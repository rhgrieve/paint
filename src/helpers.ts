
export function constructGrid(width: number, height: number): string[][] {
    const grid = new Array(height).fill(0);
    return grid.map(_row => new Array(width).fill('#000'))
}