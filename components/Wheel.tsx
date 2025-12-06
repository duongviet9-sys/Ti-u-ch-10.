import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3-shape';

interface WheelProps {
  items: string[];
  rotation: number;
  onTransitionEnd: () => void;
  colors: string[];
}

const Wheel: React.FC<WheelProps> = ({ items, rotation, onTransitionEnd, colors }) => {
  const radius = 400; // SVG coordinate space size
  const diameter = radius * 2;

  // Generate SVG paths for each slice
  const slices = useMemo(() => {
    if (items.length === 0) return [];
    
    const pie = d3.pie<string>()
      .sort(null) // Do not sort, keep order matching the array
      .value(() => 1); // Equal size for all

    const arcGenerator = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Generator specifically for placing text at the outer ring
    const labelArcGenerator = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(radius * 0.82) // Place text at 82% of radius (close to edge)
      .outerRadius(radius * 0.82);

    const arcData = pie(items);

    return arcData.map((d, i) => {
      const path = arcGenerator(d) || "";
      
      // Calculate centroid using the label generator to push text outwards
      const [x, y] = labelArcGenerator.centroid(d);
      
      // Calculate angle for text rotation
      const rotateAngle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
      
      return {
        path,
        fill: colors[i % colors.length],
        label: d.data,
        centroid: { x, y },
        angle: rotateAngle,
        index: i
      };
    });
  }, [items, colors, radius]);

  // If no items, show a placeholder
  if (items.length === 0) {
    return (
      <div className="w-full h-full rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
        <p className="text-gray-400 font-bold">Thêm học sinh để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto p-2">
      {/* The Wheel */}
      <motion.div
        className="w-full h-full rounded-full overflow-hidden shadow-2xl border-[16px] border-red-600 ring-4 ring-red-800"
        animate={{ rotate: rotation }}
        transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }} // Custom cubic-bezier for realistic spin
        onAnimationComplete={onTransitionEnd}
        style={{ transformOrigin: "center" }}
      >
        <svg
          viewBox={`-${radius} -${radius} ${diameter} ${diameter}`}
          className="w-full h-full transform -rotate-90" // Start at 12 o'clock
        >
          {slices.map((slice) => (
            <g key={slice.index}>
              <path d={slice.path} fill={slice.fill} stroke="white" strokeWidth="2" />
              {/* Text Label */}
              <text
                x={slice.centroid.x}
                y={slice.centroid.y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={items.length > 30 ? 14 : items.length > 20 ? 18 : 24}
                fontWeight="bold"
                // Rotate text to match the slice angle
                transform={`rotate(${slice.angle + 90}, ${slice.centroid.x}, ${slice.centroid.y})`}
                style={{ pointerEvents: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
              >
                {/* Truncate long names, but allow slightly more length since we are at the outer edge */}
                {slice.label.length > 12 && items.length > 15 ? slice.label.substring(0, 10) + '..' : slice.label}
              </text>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Center Hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-lg flex flex-col items-center justify-center z-10 border-4 border-red-200">
        <span className="text-3xl font-black text-red-600 leading-none">10A1</span>
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">CLASS</span>
      </div>

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
        <div className="w-12 h-16 drop-shadow-lg">
           <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M24 60L44 10H4L24 60Z" fill="#ef4444" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
             <circle cx="24" cy="10" r="4" fill="white"/>
           </svg>
        </div>
      </div>
    </div>
  );
};

export default Wheel;