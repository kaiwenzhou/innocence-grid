import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const Cases = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Table */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Case Analysis</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Transcript ID: 00001</span>
              <span>Client: Emmanuel Young</span>
              <span>Case Assigned to: Jaden Boyle</span>
            </div>
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        {/* Split Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
          {/* Left Panel - Transcript */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Transcript</h2>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">PRESIDING COMMISSIONER RUFF:</p>
                  <p className="text-muted-foreground">
                    Good afternoon, Mr. Young. This is your parole consideration hearing.
                    We'll be discussing your case and your progress since your last hearing.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">EMMANUEL YOUNG:</p>
                  <p className="text-muted-foreground">
                    Thank you, Commissioner. I appreciate the opportunity to speak today.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">PRESIDING COMMISSIONER RUFF:</p>
                  <p className="text-muted-foreground">
                    I've reviewed your file. I see you've been working on your rehabilitation.
                    Can you tell me about what you've learned about yourself?
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">EMMANUEL YOUNG:</p>
                  <p className="text-muted-foreground bg-slate-50 p-3 rounded border-l-4 border-slate-300">
                    I understand my actions caused harm. I've been working on understanding
                    the dynamics of what happened. I maintain that the circumstances were
                    different than presented at trial.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">DEPUTY COMMISSIONER WEILBACHER:</p>
                  <p className="text-muted-foreground">
                    What specifically have you done to address your behavior patterns?
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">ATTORNEY MBELU:</p>
                  <p className="text-muted-foreground">
                    If I may, Commissioner, Mr. Young has completed several programs including
                    domestic violence intervention and anger management.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-3">Identified Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  Maintains Different Account
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100">
                  Rehabilitation Efforts
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  Legal Representation
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  Causality
                </Badge>
              </div>
            </div>
          </Card>

          {/* Right Panel - Case Details */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Case Details</h2>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="panel">Panel Analysis</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Case Summary</h3>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Applicant</dt>
                          <dd className="font-medium">Emmanuel Young</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">CDCR Number</dt>
                          <dd className="font-medium">AK2960</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Conviction</dt>
                          <dd className="font-medium">Second-Degree Murder</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Hearing Date</dt>
                          <dd className="font-medium">October 24, 2024</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Years Served</dt>
                          <dd className="font-medium">18 years</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Innocence Score</dt>
                          <dd>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                              Medium (0.45)
                            </Badge>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Innocence Indicators</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-slate-500">⚠️</span>
                          <span>Maintains different account of events than trial record</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-slate-500">ℹ️</span>
                          <span>States circumstances were "different than presented"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-slate-500">✓</span>
                          <span>Has legal representation present</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Recommended Actions</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Request complete trial transcripts</li>
                        <li>• Review appellate documents</li>
                        <li>• Interview attorney regarding "different circumstances"</li>
                        <li>• Assess rehabilitation vs. innocence claim narrative</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="panel" className="flex-1 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Panel Composition</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">Commissioner Michael Ruff</p>
                              <p className="text-sm text-muted-foreground">Presiding Commissioner</p>
                            </div>
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                              Corrections Background
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Former warden at San Quentin (12.5 years) and DVI (5 years).
                            Career focused on institutional security.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">Commissioner James Weilbacher</p>
                              <p className="text-sm text-muted-foreground">Deputy Commissioner</p>
                            </div>
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                              Unknown Background
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Background information pending research.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Bias Risk Assessment</h3>
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">High Risk</Badge>
                          <span className="text-sm font-medium">100% Law Enforcement/Corrections Panel</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This panel composition has historically shown higher denial rates
                          for innocence claims, often interpreting maintained innocence as
                          "lack of remorse" or "minimization."
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timeline" className="flex-1 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div className="w-0.5 h-full bg-border" />
                      </div>
                      <div className="pb-8">
                        <p className="font-medium">October 24, 2024</p>
                        <p className="text-sm text-muted-foreground">Parole Hearing - Stipulation</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          3-year denial, applicant requested time for additional programming
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-border" />
                        <div className="w-0.5 h-full bg-border" />
                      </div>
                      <div className="pb-8">
                        <p className="font-medium">2022</p>
                        <p className="text-sm text-muted-foreground">Scheduled Hearing - Postponed</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hearing postponed due to sentence recalculation
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-border" />
                      </div>
                      <div>
                        <p className="font-medium">2006</p>
                        <p className="text-sm text-muted-foreground">Conviction</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Second-degree murder conviction
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button className="flex-1" variant="default">
                Verify
              </Button>
              <Button className="flex-1" variant="outline">
                Contact
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cases;
