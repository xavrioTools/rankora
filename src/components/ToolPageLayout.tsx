import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../utils/motion';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function ToolPageLayout({ title, description, icon, children }: ToolPageLayoutProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-3xl space-y-3">
          {icon && (
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
               {icon}
             </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
