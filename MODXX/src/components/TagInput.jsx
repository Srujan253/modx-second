import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TagInput = ({ tags = [], setTags, maxTags = 3, placeholder = "Add interests..." }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      
      if (tags.length >= maxTags) {
        // Optional: show error toast
        return;
      }

      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
        setInput("");
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-800/80 border border-slate-600/50 rounded-xl focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium shadow-md"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent text-white placeholder-slate-400 focus:outline-none"
          />
        )}
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-slate-400">
          Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded border border-slate-600">Enter</kbd> to add
        </span>
        <span className={`font-medium ${tags.length >= maxTags ? "text-orange-400" : "text-slate-400"}`}>
          {tags.length}/{maxTags}
        </span>
      </div>
    </div>
  );
};

export default TagInput;
