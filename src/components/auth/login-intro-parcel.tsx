const QR_N = 21;
const QR_CELL = 2.6;
const QR_SIZE = QR_N * QR_CELL;

function inFinderRegion(row: number, col: number) {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= QR_N - 7) ||
    (row >= QR_N - 7 && col < 7)
  );
}

function isDataModule(row: number, col: number) {
  if (inFinderRegion(row, col)) {
    return false;
  }
  if (row === 6 || col === 6) {
    return (row + col) % 2 === 0;
  }
  return (row * 7 + col * 13 + row * col) % 3 !== 1;
}

function Finder({ x, y }: { x: number; y: number }) {
  const outer = 7 * QR_CELL;
  const mid = 5 * QR_CELL;
  const core = 3 * QR_CELL;
  return (
    <g data-login-qr-finder className="origin-center [transform-box:fill-box]">
      <rect x={x} y={y} width={outer} height={outer} className="fill-primary" />
      <rect
        x={x + QR_CELL}
        y={y + QR_CELL}
        width={mid}
        height={mid}
        className="fill-background"
      />
      <rect
        x={x + QR_CELL * 2}
        y={y + QR_CELL * 2}
        width={core}
        height={core}
        className="fill-primary"
      />
    </g>
  );
}

function QrLabel() {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < QR_N; row += 1) {
    for (let col = 0; col < QR_N; col += 1) {
      if (isDataModule(row, col)) {
        cells.push({ row, col });
      }
    }
  }

  return (
    <g transform="matrix(1.05 -0.55 0 1.28 140 108)">
      <rect
        data-login-box-label
        x={-5}
        y={-5}
        width={QR_SIZE + 10}
        height={QR_SIZE + 10}
        className="fill-background"
      />
      <Finder x={0} y={0} />
      <Finder x={(QR_N - 7) * QR_CELL} y={0} />
      <Finder x={0} y={(QR_N - 7) * QR_CELL} />
      {cells.map(({ row, col }) => (
        <rect
          key={`${row}-${col}`}
          data-login-qr-cell
          x={col * QR_CELL}
          y={row * QR_CELL}
          width={QR_CELL - 0.2}
          height={QR_CELL - 0.2}
          className="origin-center fill-primary [transform-box:fill-box]"
        />
      ))}
    </g>
  );
}

export function LoginIntroParcel() {
  return (
    <svg
      data-login-parcel
      viewBox="0 0 264 228"
      className="relative z-10 h-44 w-52 overflow-visible sm:h-56 sm:w-64"
    >
      <polygon
        data-login-box-face
        points="60,72 132,110 132,198 60,160"
        className="fill-muted stroke-primary/25"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <polygon
        data-login-box-face
        points="132,110 204,72 204,160 132,198"
        className="fill-background stroke-primary/25"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <QrLabel />
      <polygon
        data-login-box-lid
        points="60,72 132,34 204,72 132,110"
        className="fill-muted stroke-primary/25"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <polygon
        data-login-box-tape
        points="104,53 132,68 160,53 160,62 132,77 104,62"
        className="fill-accent"
      />
      <line
        x1="132"
        y1="110"
        x2="132"
        y2="198"
        className="stroke-primary/20"
        strokeWidth="1"
      />
    </svg>
  );
}
