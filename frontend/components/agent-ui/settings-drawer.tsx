import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconSettings } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";
import { SensitiveDataForm } from './sensitive-data-form';

interface SettingsDrawerProps {
  onSensitiveDataChange: (data: Record<string, string>) => void;
}

export const SettingsDrawer = ({ 
  onSensitiveDataChange
}: SettingsDrawerProps) => {
  const [sensitiveData, setSensitiveData] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleSensitiveDataChange = (data: Record<string, string>) => {
    setSensitiveData(data);
    onSensitiveDataChange(data);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 sm:h-12 sm:w-12 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open settings"
        >
          <IconSettings size={16} className="sm:w-[18px] sm:h-[18px]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-80 md:w-96 p-0" align="end" sideOffset={8}>
        <div className="w-full">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold">Settings</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <SensitiveDataForm 
                initialData={sensitiveData}
                onSensitiveDataChange={handleSensitiveDataChange} 
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 