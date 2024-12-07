"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { exampleReports } from "@/app/examples/constants/examples";

export function ExampleReports() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Example Reports</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/examples')}
        >
          View all examples
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(exampleReports).map(([key, report]) => (
          <Card key={key} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">{report.title}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {report.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {report.content.industry_analysis?.key_trends?.slice(0, 3).map((trend, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded"
                    >
                      {trend}
                    </span>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => router.push(`/examples?report=${key}`)}
                >
                  View example <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
} 