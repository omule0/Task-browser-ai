interface UserQueryProps {
  task: string;
}

export const UserQuery = ({ task }: UserQueryProps) => (
  <div className="flex justify-end mb-4 sm:mb-6">
    <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[75%]">
      <div className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[20px] sm:rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-200">
        <p className="text-sm sm:text-base break-words leading-relaxed">{task}</p>
      </div>
    </div>
  </div>
); 