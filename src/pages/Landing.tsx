import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, Search, FileText, BarChart3, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-card to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <Scale className="h-16 w-16 text-primary" />
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground">
              JusticeMAP
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Advanced AI-powered analysis of parole hearing transcripts to identify potential wrongful convictions.
              Upload court documents and receive detailed innocence assessments.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate("/dashboard")}
            >
              Get Started
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border bg-card p-6">
              <Upload className="mb-4 h-10 w-10 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">1. Upload Transcripts</h3>
              <p className="text-muted-foreground">
                Drag and drop PDF court transcripts for instant analysis
              </p>
            </Card>

            <Card className="border-border bg-card p-6">
              <Search className="mb-4 h-10 w-10 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our system analyzes claims and identifies potential innocence indicators
              </p>
            </Card>

            <Card className="border-border bg-card p-6">
              <BarChart3 className="mb-4 h-10 w-10 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">3. Review Results</h3>
              <p className="text-muted-foreground">
                Get detailed innocence scores and highlighted evidence sections
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Analyze Cases?</h2>
          <p className="mb-8 text-muted-foreground">
            Start reviewing court transcripts with AI-powered analysis
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
          >
            Access Dashboard
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
