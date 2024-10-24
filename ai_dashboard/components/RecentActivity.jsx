import { TableIcon, EyeIcon, MoreHorizontalIcon } from "lucide-react";

export function RecentActivity() {
  return (
    <section className="mt-8">
    <h3 className="text-xl font-semibold mb-4">Recent activity</h3>
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TableIcon className="w-6 h-6 text-purple-600" />
          <div>
            <h4 className="font-semibold">Deals</h4>
            <p className="text-sm text-gray-500">In My Spreadsheets</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <p className="text-sm">Modified a year ago</p>
          <EyeIcon className="w-5 h-5" />
          <MoreHorizontalIcon className="w-5 h-5" />
        </div>
      </div>
      </div>
    </section>
  );
}
