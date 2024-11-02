import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

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
      duration: 3000,
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
      duration: 4000,
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
      duration: 4000,
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
}; 