import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, AlertCircle, Loader2, Info } from "lucide-react";

export const customToast = {
  success: (message) =>
    toast.success(message, {
      style: {
        background: '#F3E8FF',
        color: '#6B21A8',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #E9D5FF',
      },
      icon: <CheckCircle className="w-5 h-5 text-purple-700" />,
      duration: 4000,
    }),

  error: (message) =>
    toast.error(message, {
      style: {
        background: '#FEE2E2',
        color: '#991B1B',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #FECACA',
      },
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      duration: 6000,
    }),

  warning: (message) =>
    toast(message, {
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #FDE68A',
      },
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
      duration: 6000,
    }),

  loading: (message) =>
    toast.loading(message, {
      style: {
        background: '#F3E8FF',
        color: '#6B21A8',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #E9D5FF',
      },
      icon: <Loader2 className="w-5 h-5 text-purple-700 animate-spin" />,
    }),


  info: (message, options = {}) =>
    toast(
      <div>
        <div className="font-medium">{message}</div>
        {options.description && (
          <div className="text-sm mt-1">{options.description}</div>
        )}
        {options.action && (
          <button
            onClick={options.action.onClick}
            className="mt-2 text-sm font-medium underline"
          >
            {options.action.label}
          </button>
        )}
      </div>,
      {
        style: {
          background: '#EFF6FF',
          color: '#1E40AF',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #DBEAFE',
        },
        icon: <Info className="w-5 h-5 text-blue-600" />,
        duration: options.duration || 6000,
      }
    ),
}; 
