import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { IconSettings } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import { SensitiveDataForm } from './sensitive-data-form';
import { EmailNotification } from './email-notification';

interface SettingsDrawerProps {
  onSensitiveDataChange: (data: Record<string, string>) => void;
  onEmailChange: (email: string | null) => void;
  defaultEmail?: string | null;
}

export const SettingsDrawer = ({ 
  onSensitiveDataChange, 
  onEmailChange, 
  defaultEmail 
}: SettingsDrawerProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-12 w-12 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open settings"
        >
          <IconSettings size={18} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <EmailNotification 
                onEmailChange={onEmailChange} 
                defaultEmail={defaultEmail} 
              />
            </div>
            <div className="space-y-4">
              <SensitiveDataForm 
                onSensitiveDataChange={onSensitiveDataChange} 
              />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}; 