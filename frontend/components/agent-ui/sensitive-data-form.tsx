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
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={handleAddEntry}
      >
        <IconPlus size={14} className="mr-1" />
        Add Sensitive Data
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Sensitive Data</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddEntry}
        >
          <IconPlus size={16} className="mr-2" />
          Add Field
        </Button>
      </div>
      
      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Variable name"
            value={entry.key}
            onChange={(e) => handleEntryChange(index, 'key', e.target.value)}
            className="flex-1"
          />
          <div className="relative flex-1">
            <Input
              type={showValues[index] ? 'text' : 'password'}
              placeholder="Value"
              value={entry.value}
              onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
              className="w-full pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => toggleShowValue(index)}
            >
              {showValues[index] ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveEntry(index)}
            className="shrink-0"
          >
            <IconTrash size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
} 