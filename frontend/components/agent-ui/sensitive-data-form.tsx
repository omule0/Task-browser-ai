import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus, IconTrash, IconEyeOff, IconEye } from '@tabler/icons-react';

interface SensitiveDataFormProps {
  onSensitiveDataChange: (data: Record<string, string>) => void;
}

export function SensitiveDataForm({ onSensitiveDataChange }: SensitiveDataFormProps) {
  const [entries, setEntries] = useState<Array<{ key: string; value: string }>>([]);
  const [showValues, setShowValues] = useState<Record<number, boolean>>({});

  const handleAddEntry = () => {
    setEntries([...entries, { key: '', value: '' }]);
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const handleEntryChange = (index: number, field: 'key' | 'value', value: string) => {
    const newEntries = entries.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const toggleShowValue = (index: number) => {
    setShowValues(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const updateParent = (newEntries: Array<{ key: string; value: string }>) => {
    const data = newEntries.reduce((acc, { key, value }) => {
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    onSensitiveDataChange(data);
  };

  if (entries.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground h-7 sm:h-8 px-2 sm:px-3"
        onClick={handleAddEntry}
      >
        <IconPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
        Add Sensitive Data
      </Button>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-medium">Sensitive Data</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddEntry}
          className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
        >
          <IconPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Add Field
        </Button>
      </div>
      
      {entries.map((entry, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Variable name"
            value={entry.key}
            onChange={(e) => handleEntryChange(index, 'key', e.target.value)}
            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3"
          />
          <div className="relative flex-1">
            <Input
              type={showValues[index] ? 'text' : 'password'}
              placeholder="Value"
              value={entry.value}
              onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
              className="w-full pr-8 sm:pr-10 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 sm:h-7 w-6 sm:w-7 p-0.5 sm:p-1"
              onClick={() => toggleShowValue(index)}
            >
              {showValues[index] ? (
                <IconEyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <IconEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveEntry(index)}
            className="shrink-0 h-8 sm:h-9 w-8 sm:w-9 sm:ml-0.5"
          >
            <IconTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
} 