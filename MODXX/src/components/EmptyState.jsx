import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
  type = 'default'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("w-full py-20", className)}
    >
      <Card className="bg-gray-900/50 border-2 border-dashed border-gray-800 p-16 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
        {/* Holographic Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full group-hover:bg-orange-500/10 transition-colors duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors duration-700" />
        
        <div className="relative z-10">
          {Icon && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-gray-800/80 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-gray-700/50 shadow-inner group-hover:border-orange-500/20 transition-all duration-500"
            >
              <Icon size={48} className="text-gray-500 group-hover:text-orange-500 transition-colors duration-500" />
            </motion.div>
          )}
          
          <h3 className="text-4xl font-black italic tracking-tighter text-white mb-4 uppercase">
            {title || "VOID DETECTED"}
          </h3>
          
          <p className="text-gray-500 font-bold text-sm max-w-sm mx-auto mb-10 leading-relaxed uppercase tracking-widest">
            {description || "THE PROJECT MATRIX IS CURRENTLY EMPTY. INITIATE FIRST PROTOCOL."}
          </p>
          
          {actionLabel && onAction && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={onAction}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] py-7 px-10 rounded-2xl shadow-[0_8px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all text-xs"
              >
                {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                {actionLabel}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default EmptyState;