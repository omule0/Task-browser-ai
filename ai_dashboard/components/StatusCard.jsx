import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatusItem({ label, status }) {
    const isOperational = status === "operational";
    return (
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex items-center">
          {isOperational ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={isOperational ? "text-green-500" : "text-red-500"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    );
  }

export function StatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatusItem label="Database" status="operational" />
          <StatusItem label="API" status="operational" />
          <StatusItem label="Web App" status="operational" />
          <StatusItem label="Analytics" status="degraded" />
        </div>
      </CardContent>
    </Card>
  );
}
