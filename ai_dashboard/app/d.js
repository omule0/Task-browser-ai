"use client";

import { useState } from "react";
import {
  DownloadIcon,
  TableIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SearchIcon,
  HomeIcon,
  FileIcon,
  FolderPlusIcon,
  SettingsIcon,
  ZapIcon,
  BarChartIcon,
  DatabaseIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 200 },
  { name: "Apr", value: 278 },
  { name: "May", value: 189 },
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-1">
      <aside
        className={`bg-white w-64 p-4 flex flex-col ${
          isSidebarOpen ? "" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              Q
            </div>
            <span className="font-semibold">quick-silver-499...</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
        <Input type="text" placeholder="Search" className="mb-4" />
        <nav className="space-y-2">
          <SidebarItem icon={<HomeIcon />} label="Home" isActive />
          <SidebarItem icon={<FileIcon />} label="My Spreadsheets" />
          <SidebarItem icon={<FolderPlusIcon />} label="Add Folder" />
        </nav>
        <div className="mt-auto">
          <SidebarItem icon={<SettingsIcon />} label="Settings" />
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Within plan limits.</span>
            <ZapIcon className="w-4 h-4" />
          </div>
          <p className="text-sm text-gray-500">Upgrade for more.</p>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Home</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ActionCard
            icon={<SearchIcon className="w-6 h-6" />}
            title="New Search Query"
            description="Start with a blank file"
            bgColor="bg-yellow-200"
          />
          <ActionCard
            icon={<DownloadIcon className="w-6 h-6" />}
            title="Import Data"
            description="From a CSV or XLSX file"
            bgColor="bg-gray-200"
          />
          <ActionCard
            icon={<BarChartIcon className="w-6 h-6" />}
            title="Generate Report"
            description="Create insights from your data"
            bgColor="bg-gray-200"
          />
          <ActionCard
            icon={<DatabaseIcon className="w-6 h-6" />}
            title="Connect Data Source"
            description="Link to external databases"
            bgColor="bg-gray-200"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Data Visualization Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Latest Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InsightItem
                title="Revenue Increase"
                description="15% increase in revenue compared to last month"
                type="positive"
              />
              <InsightItem
                title="New Users"
                description="50 new users signed up in the last 24 hours"
                type="neutral"
              />
              <InsightItem
                title="Server Load"
                description="High server load detected during peak hours"
                type="negative"
              />
            </div>
          </CardContent>
        </Card>
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
      </main>
    </div>
  );
}

function ActionCard({ icon, title, description, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 flex items-start space-x-3`}>
      <div className="p-2 bg-white rounded-full">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, isActive = false }) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`w-full justify-start ${
        isActive ? "bg-purple-100 text-purple-600" : ""
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );
}

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

function InsightItem({ title, description, type }) {
  const badgeColor =
    type === "positive"
      ? "bg-green-100 text-green-800"
      : type === "negative"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";
  return (
    <div className="flex items-start space-x-3">
      <Badge className={badgeColor}>{type}</Badge>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
