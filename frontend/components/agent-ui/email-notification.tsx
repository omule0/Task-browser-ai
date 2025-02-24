import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface EmailNotificationProps {
  onEmailChange: (email: string | null) => void;
  defaultEmail?: string | null;
}

export const EmailNotification = ({ onEmailChange, defaultEmail }: EmailNotificationProps) => {
  const [enableEmail, setEnableEmail] = useState(false);
  const [email, setEmail] = useState(defaultEmail || '');

  useEffect(() => {
    if (defaultEmail && defaultEmail !== email) {
      setEmail(defaultEmail);
      onEmailChange(null);
    }
  }, [defaultEmail, email, onEmailChange]);

  const handleToggle = (checked: boolean) => {
    setEnableEmail(checked);
    if (!checked) {
      onEmailChange(null);
    } else {
      onEmailChange(email || defaultEmail || null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (enableEmail) {
      onEmailChange(newEmail || null);
    }
  };

  return (
    <div className="flex flex-col space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label 
          htmlFor="email-notifications" 
          className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email Notifications
        </Label>
        <Switch
          id="email-notifications"
          checked={enableEmail}
          onCheckedChange={handleToggle}
          className="scale-90 sm:scale-100"
        />
      </div>
      {enableEmail && (
        <div className="mt-1 sm:mt-2">
          <Input
            type="email"
            placeholder={defaultEmail || "Enter your email"}
            value={email}
            onChange={handleEmailChange}
            className="w-full h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-2 rounded-md"
          />
          <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
            We&apos;ll notify you when your task is complete
          </p>
        </div>
      )}
    </div>
  );
}; 