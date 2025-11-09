import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CommissionerService } from "@/services/commissioners";
import { Commissioner, CommissionerStatistics } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Building, Calendar, Mail, Phone, MapPin, Briefcase, GraduationCap, Scale, TrendingUp, FileText, ExternalLink, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CommissionerProfile = () => {
  const { id, name } = useParams<{ id?: string; name?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [commissioner, setCommissioner] = useState<Commissioner | null>(null);
  const [statistics, setStatistics] = useState<CommissionerStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommissioner = async () => {
      try {
        setIsLoading(true);
        
        let data: Commissioner | null = null;
        
        // Try to load by ID first, then by name
        if (id) {
          data = await CommissionerService.getCommissionerById(id);
        } else if (name) {
          data = await CommissionerService.getCommissionerByName(name);
        }
        
        if (!data) {
          toast({
            title: "Commissioner not found",
            description: "The requested commissioner profile could not be found.",
            variant: "destructive",
          });
          navigate("/commissioner-breakdown");
          return;
        }
        
        setCommissioner(data);
        
        // Load statistics if available
        const stats = await CommissionerService.getCommissionerStatistics(data.id);
        setStatistics(stats);
        
      } catch (error) {
        toast({
          title: "Error loading commissioner",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCommissioner();
  }, [id, name, navigate, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-white">Loading commissioner profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!commissioner) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-white">Commissioner not found.</p>
          <Button onClick={() => navigate("/commissioner-breakdown")} className="mt-4">
            Back to Commissioner Breakdown
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{commissioner.full_name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  {commissioner.background_category && (
                    <Badge variant="outline" className="text-sm">
                      {commissioner.background_category}
                    </Badge>
                  )}
                  <Badge variant={commissioner.active ? "default" : "secondary"}>
                    {commissioner.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Background & Contact */}
          <div className="lg:col-span-2 space-y-6">
            {/* Background Information */}
            <Card className="p-6 bg-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Background</h2>
              
              {commissioner.background_details && (
                <div className="mb-4">
                  <p className="text-foreground/80 leading-relaxed">{commissioner.background_details}</p>
                </div>
              )}
              
              {commissioner.biography && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Biography</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{commissioner.biography}</p>
                </div>
              )}
            </Card>

            {/* Previous Roles */}
            {commissioner.previous_roles && commissioner.previous_roles.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Previous Roles
                </h2>
                <div className="space-y-3">
                  {commissioner.previous_roles.map((role: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                      <p className="font-semibold text-foreground">{role.title}</p>
                      <p className="text-sm text-foreground/70">{role.organization}</p>
                      {(role.start_date || role.end_date) && (
                        <p className="text-xs text-foreground/50 mt-1">
                          {role.start_date} - {role.end_date || "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Education */}
            {commissioner.education && commissioner.education.length > 0 && (
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </h2>
                <div className="space-y-3">
                  {commissioner.education.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                      <p className="font-semibold text-foreground">{edu.degree}</p>
                      <p className="text-sm text-foreground/70">{edu.institution}</p>
                      {edu.year && (
                        <p className="text-xs text-foreground/50 mt-1">{edu.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-bold text-foreground mb-4">Contact Information</h2>
              <div className="space-y-3">
                {commissioner.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{commissioner.email}</p>
                    </div>
                  </div>
                )}
                {commissioner.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground">{commissioner.phone}</p>
                    </div>
                  </div>
                )}
                {commissioner.office_location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Office</p>
                      <p className="text-sm text-foreground">{commissioner.office_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Appointment Info */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-bold text-foreground mb-4">Appointment Details</h2>
              <div className="space-y-3">
                {commissioner.appointment_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Appointed</p>
                      <p className="text-sm text-foreground">
                        {new Date(commissioner.appointment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {commissioner.term_end_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Term Ends</p>
                      <p className="text-sm text-foreground">
                        {new Date(commissioner.term_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Statistics */}
            {statistics && (
              <Card className="p-6 bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Hearing Statistics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground/70">Total Hearings</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{statistics.total_hearings}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-foreground/70">Grants</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{statistics.total_grants}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                      <span className="text-sm text-foreground/70">Denials</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{statistics.total_denials}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Grant Rate</span>
                    <span className="text-xl font-bold text-primary">{statistics.grant_rate}%</span>
                  </div>
                </div>
              </Card>
            )}

            {/* External Links */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-bold text-foreground mb-4">Resources</h2>
              <div className="space-y-2">
                {commissioner.profile_url && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(commissioner.profile_url!, '_blank')}
                  >
                    {commissioner.profile_url.includes('linkedin.com') ? (
                      <>
                        <Linkedin className="mr-2 h-4 w-4" />
                        View LinkedIn Profile
                      </>
                    ) : (
                      <>
                        <Building className="mr-2 h-4 w-4" />
                        View CDCR Profile
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/commissioner-breakdown")}
                >
                  <Scale className="mr-2 h-4 w-4" />
                  View All Commissioners
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommissionerProfile;

