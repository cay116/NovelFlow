import React from 'react';
import { motion } from 'motion/react';

interface WeightedBlocksProps {
  blocksCount: number; // 1 to 5
  progress: number;    // 0 to 100
  interactive?: boolean;
  onBlockClick?: (targetProgress: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const WeightedBlocks: React.FC<WeightedBlocksProps> = ({
  blocksCount = 1,
  progress = 0,
  interactive = false,
  onBlockClick,
  size = 'md'
}) => {
  // Safe bounds check
  const safeBlocks = Math.max(1, Math.min(5, blocksCount));
  const safeProgress = Math.max(0, Math.min(100, progress));

  // Determine sizing classes
  const dimensions = {
    sm: { height: 'h-4', width: 'w-8', gap: 'gap-0.5', text: 'text-[10px]' },
    md: { height: 'h-6', width: 'w-12', gap: 'gap-1.5', text: 'text-xs' },
    lg: { height: 'h-8', width: 'w-16', gap: 'gap-2', text: 'text-sm' }
  }[size];

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className={`flex items-center ${dimensions.gap}`}>
        {Array.from({ length: safeBlocks }).map((_, index) => {
          // Calculate the exact fill of this individual block from 0 to 100 %
          const individualFill = Math.max(0, Math.min(100, (safeProgress * safeBlocks) - (index * 100)));
          const isFull = individualFill === 100;
          const isPartial = individualFill > 0 && individualFill < 100;

          // Render block
          return (
            <div
              key={index}
              id={`weighted-block-${index}`}
              onClick={() => {
                if (interactive && onBlockClick) {
                  // If clicking on block 1 of 3: target would be 33%, etc.
                  const targetPct = Math.round(((index + 1) / safeBlocks) * 100);
                  onBlockClick(targetPct);
                }
              }}
              className={`
                relative ${dimensions.height} ${dimensions.width} rounded-md border
                overflow-hidden bg-slate-900/80 backdrop-blur-md transition-all duration-300
                ${isFull ? 'border-amber-500/50 shadow-[0_0_10px_rgba(99,102,241,0.25)]' : 'border-slate-800'}
                ${isPartial ? 'border-amber-500/30' : ''}
                ${interactive ? 'cursor-pointer hover:border-amber-400 hover:shadow-[0_0_14px_rgba(99,102,241,0.4)]' : ''}
              `}
              title={`Block ${index + 1}: ${Math.round(individualFill)}% completed`}
            >
              {/* Completed glow indicator inside block */}
              {isFull && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent animate-pulse" />
              )}

              {/* Progress bar background fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${individualFill}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`
                  h-full absolute left-0 top-0 rounded-l-[4px]
                  ${isFull 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400' 
                    : 'bg-gradient-to-r from-amber-600/80 to-amber-500/80'
                  }
                `}
              />

              {/* Dynamic shining pulse for filling blocks */}
              {isPartial && (
                <motion.div
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    x: ['0%', '100%', '0%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-[1px] bg-gradient-to-r from-transparent via-amber-300/20 to-transparent pointer-events-none"
                  style={{ width: `${individualFill}%` }}
                />
              )}

              {/* Subtle visual percentage overlay inside the block */}
              {size !== 'sm' && (
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-slate-500 select-none z-10 font-bold">
                  {Math.round(individualFill)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 select-none">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>{safeProgress}% progress</span>
        </span>
        <span className="text-slate-500">
          {safeBlocks} {safeBlocks === 1 ? 'Block' : 'Blocks'} 
          <span className="mx-1">•</span> 
          {safeBlocks === 1 ? 'Small' : safeBlocks === 2 ? 'Medium' : 'Large'}
        </span>
      </div>
    </div>
  );
};
