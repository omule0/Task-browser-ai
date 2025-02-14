import { IconUser } from '@tabler/icons-react';

interface UserQueryProps {
  task: string;
}

export const UserQuery = ({ task }: UserQueryProps) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
      <IconUser size={20} className="text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-base">{task}</p>
    </div>
  </div>
); 