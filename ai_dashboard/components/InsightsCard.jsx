import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function InsightsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Insights</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
