'use client';
import { cn } from '../../utils/cn';
import { motion, type SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  format?: (v: number) => string;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  format = (v) => Math.round(v).toLocaleString(),
}: AnimatedNumberProps) {
  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    format(current)
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={cn('tabular-nums', className)}>
      {display as any}
    </motion.span>
  );
}
