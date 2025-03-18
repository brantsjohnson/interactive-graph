import { useEffect, useRef, useState } from 'react';

interface GridData {
  quadrantNumber: number;
  percentages: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface GridProps {
  onGridClick: (data: GridData) => void;
  shouldReset?: boolean;
}

const Grid: React.FC<GridProps> = ({ onGridClick, shouldReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dotPosition, setDotPosition] = useState<{ x: number; y: number } | null>(null);
  const size = 300; // Grid size in pixels
  const cellSize = size / 5; // Size of each cell (5x5 grid)

  // Reset dot position when shouldReset changes
  useEffect(() => {
    if (shouldReset) {
      setDotPosition(null);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas and redraw X
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size, size);
      ctx.moveTo(size, 0);
      ctx.lineTo(0, size);
      ctx.stroke();
    }
  }, [shouldReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw main X
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();

    // Draw dot if exists
    if (dotPosition) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(dotPosition.x, dotPosition.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dotPosition]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update dot position
    setDotPosition({ x, y });

    // Calculate percentages (0-100)
    const topPercent = Math.round((1 - y / size) * 100);
    const leftPercent = Math.round((1 - x / size) * 100);
    const bottomPercent = Math.round(y / size * 100);
    const rightPercent = Math.round(x / size * 100);

    // Calculate grid quadrant (1-25)
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const quadrantNumber = row * 5 + col + 1;

    onGridClick({
      quadrantNumber,
      percentages: {
        top: topPercent,
        bottom: bottomPercent,
        left: leftPercent,
        right: rightPercent
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleClick}
        style={{
          border: '2px solid black',
          backgroundColor: 'white',
          cursor: 'crosshair'
        }}
      />
    </div>
  );
};

export default Grid;