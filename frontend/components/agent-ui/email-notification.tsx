import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface EmailNotificationProps {
  onEmailChange: (email: string | null) => void;
}

export const EmailNotification = ({ onEmailChange }: EmailNotificationProps) => {
  const [enableEmail, setEnableEmail] = useState(false);
  const [email, setEmail] = useState('');

  const handleToggle = (checked: boolean) => {
    setEnableEmail(checked);
    if (!checked) {
      setEmail('');
      onEmailChange(null);
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
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="email-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Email Notifications
        </Label>
        <Switch
          id="email-notifications"
          checked={enableEmail}
          onCheckedChange={handleToggle}
        />
      </div>
      {enableEmail && (
        <div className="mt-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}; 