
interface UserQueryProps {
  task: string;
}

export const UserQuery = ({ task }: UserQueryProps) => (
  <div className="flex justify-end mb-6">
    <div className="max-w-[80%]">
      <div className="bg-blue-600 text-white px-6 py-3 rounded-[24px] shadow-sm">
        <p className="text-base break-words">{task}</p>
      </div>
    </div>
  </div>
); 