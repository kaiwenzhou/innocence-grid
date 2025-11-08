import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Upload, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TranscriptService } from "@/services/transcripts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    pending: 0
  });

  useEffect(() => {
    TranscriptService.getStatistics().then(setStats);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your case analysis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold">{stats.processed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Upload className="h-8 w-8 text-accent" />
            </div>
          </Card>
        </div>

        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Case
            </Button>
            <Button variant="outline" onClick={() => navigate("/transcripts")}>
              <FileText className="mr-2 h-4 w-4" />
              View All Cases
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
