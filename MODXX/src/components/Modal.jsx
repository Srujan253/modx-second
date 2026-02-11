import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

const Modal = ({ isOpen, onClose, onConfirm, title, message, type = "danger", confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-red-500/20",
          icon: "text-red-500",
          button: "bg-red-600 hover:bg-red-700",
          border: "border-red-500/50"
        };
      case "warning":
        return {
          bg: "bg-yellow-500/20",
          icon: "text-yellow-500",
          button: "bg-yellow-600 hover:bg-yellow-700",
          border: "border-yellow-500/50"
        };
      default:
        return {
          bg: "bg-orange-500/20",
          icon: "text-orange-500",
          button: "bg-orange-600 hover:bg-orange-700",
          border: "border-orange-500/50"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md bg-gray-900 border ${styles.border} rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Header/Banner */}
          <div className={`${styles.bg} p-6 flex items-center justify-center relative`}>
            <div className={`p-4 rounded-full bg-gray-900 shadow-xl`}>
              <AlertCircle className={`w-8 h-8 ${styles.icon}`} />
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed mb-8">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-8 py-2.5 rounded-xl ${styles.button} text-white shadow-lg transition-all duration-200 font-bold active:scale-95`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
