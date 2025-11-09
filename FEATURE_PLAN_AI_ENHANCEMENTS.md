# JUSTICEMAP - AI ENHANCEMENT FEATURES
## Implementation Plan for 3 New Features

---

## 🎯 Feature 1: AI Top 3 Priority Picks (Clients Page)

### Vision
Add a prominent "AI Recommendations" card at the top of the Clients page that suggests the top 3 cases volunteers should tackle first, with clear explanations for each recommendation.

### Key Principle
**"AI suggests, humans decide"** - The system provides data-driven recommendations but explicitly states these are suggestions requiring human verification.

### Implementation Details

#### A. Scoring Algorithm
Each transcript gets a "Priority Score" (0-100) based on:

```typescript
Priority Score = 
  + Innocence Claim Strength (0-30 points)
    - Strong explicit claim: 30
    - Implicit claim: 20
    - Weak/ambiguous: 10
    - No claim: 0
  
  + Bias Risk (0-25 points)
    - 100% LE/prosecution panel: 25
    - Mixed panel with majority LE: 15
    - Balanced panel: 5
  
  + Case Urgency (0-25 points)
    - Hearing in last 6 months: 25
    - Hearing 6-12 months ago: 15
    - Hearing 1-2 years ago: 10
    - Older: 5
  
  + Assignment Status (0-20 points)
    - Unassigned: 20
    - Assigned but no activity: 10
    - In progress: 5
    - Completed: 0
```

#### B. UI Design

**Location**: Top of Clients page, above the search bar

**Card Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI-Powered Priority Recommendations                     │
│  ⚠️  These are suggestions only. Review each case carefully.│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🥇 #1: [Inmate Name] - CDCR #XXXXX                         │
│  Priority Score: 92/100                                      │
│  Why: Strong innocence claim + 100% prosecution panel +     │
│        recent hearing + unassigned                           │
│  [View Case] [Analyze] [Assign to Me]                       │
│                                                              │
│  🥈 #2: [Inmate Name] - CDCR #XXXXX                         │
│  Priority Score: 87/100                                      │
│  Why: Explicit innocence language + high bias risk          │
│  [View Case] [Analyze] [Assign to Me]                       │
│                                                              │
│  🥉 #3: [Inmate Name] - CDCR #XXXXX                         │
│  Priority Score: 84/100                                      │
│  Why: Recent hearing + unassigned + commissioner history    │
│  [View Case] [Analyze] [Assign to Me]                       │
│                                                              │
│  [Refresh Recommendations] [Explain Scoring Method]         │
└─────────────────────────────────────────────────────────────┘
```

#### C. Code Changes

**Files to Modify**:
- `src/pages/Clients.tsx` - Add recommendation card component
- `src/services/transcripts.ts` - Add `calculatePriorityScore()` function
- `src/lib/types.ts` - Add `PriorityRecommendation` interface

**New Function**:
```typescript
interface PriorityRecommendation {
  transcript: Transcript;
  score: number;
  reasons: string[];
  breakdown: {
    innocenceScore: number;
    biasScore: number;
    urgencyScore: number;
    statusScore: number;
  };
}

function calculatePriorityScore(transcript: Transcript): PriorityRecommendation {
  // Implementation details
}
```

---

## 🏠 Feature 2: Similar Cases Dashboard (Home Page)

### Vision
Transform the Dashboard into an insight hub showing similar cases from across the database that can inform current work - helping volunteers learn from patterns and outcomes.

### Key Principle
**"Learn from the data"** - Show volunteers how other cases with similar characteristics were handled, without making prescriptive decisions.

### Implementation Details

#### A. Similarity Matching Logic

For each active case, find similar cases based on:

1. **Crime Type Similarity**
   - Extract crime type from transcript (murder, assault, etc.)
   - Match with other cases

2. **Commissioner Background Similarity**
   - Match cases that had the same commissioner
   - Match cases with similar panel compositions

3. **Innocence Claim Similarity**
   - Use semantic similarity of innocence language
   - Group cases with similar narrative themes

4. **Outcome Patterns**
   - Track what happened to similar cases
   - Identify success factors

#### B. UI Design

**Dashboard Sections**:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Pattern Insights Across 290 Cases                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Similar Case Patterns                                   │
│                                                              │
│  For: [Currently Selected/Assigned Case]                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎯 Cases with Similar Commissioner Panels           │   │
│  │ Found 12 cases with panels of similar backgrounds   │   │
│  │                                                       │   │
│  │ • 8 had 100% LE/prosecution panels                   │   │
│  │ • 4 had Commissioner Ruff presiding                  │   │
│  │ • Average outcome: 67% denial                        │   │
│  │                                                       │   │
│  │ Key Insight: Cases with "lack of insight" language  │   │
│  │ in commissioner comments had 85% denial rate         │   │
│  │                                                       │   │
│  │ [View All Similar Cases]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 Similar Innocence Claims                          │   │
│  │ Found 7 cases with similar language patterns        │   │
│  │                                                       │   │
│  │ • "maintain different circumstances" - 4 cases       │   │
│  │ • "wrongly convicted" - 3 cases                      │   │
│  │                                                       │   │
│  │ What Worked: In 3/7 cases, narratives that balanced │   │
│  │ empathy with innocence claims led to positive review│   │
│  │                                                       │   │
│  │ [View Similar Narratives]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🌐 National Context (Future: API Integration)       │   │
│  │                                                       │   │
│  │ Placeholder for future integration with:             │   │
│  │ • National Registry of Exonerations API              │   │
│  │ • Similar case databases from other states           │   │
│  │ • Innocence Project network data                     │   │
│  │                                                       │   │
│  │ Current Status: Local database only                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### C. Code Changes

**Files to Modify**:
- `src/pages/Dashboard.tsx` - Complete redesign with insight cards
- `src/services/similarity.ts` - NEW: Similarity matching service
- `src/lib/types.ts` - Add similarity types

**New Service**:
```typescript
interface SimilarCase {
  transcript: Transcript;
  similarityScore: number;
  matchReasons: string[];
  outcomes?: string;
}

class SimilarityService {
  findSimilarByCommissioner(targetCase: Transcript): SimilarCase[]
  findSimilarByInnocenceClaim(targetCase: Transcript): SimilarCase[]
  findSimilarByCrimeType(targetCase: Transcript): SimilarCase[]
  getPatternInsights(targetCase: Transcript): InsightCard[]
}
```

---

## ✍️ Feature 3: Enhanced Narrative Builder (Narratives Page)

### Vision
Transform the Narratives page from a blank template into an intelligent coaching tool that:
- Extracts relevant facts from the transcript
- Suggests strong phrasing based on the specific case
- Provides section-by-section guidance
- Shows real-time feedback on narrative strength

### Key Principle
**"Co-pilot, not autopilot"** - The AI assists the volunteer in crafting the narrative but never writes it for them.

### Implementation Details

#### A. New Features

1. **Intelligent Fact Extraction**
   - Parse transcript to pull key facts:
     - Programs completed
     - Years incarcerated
     - Commissioner comments
     - Support network mentions
     - Specific achievements

2. **Section-by-Section Builder**
   - Guided workflow through narrative sections
   - Context-aware suggestions for each section
   - Visual progress indicator

3. **Smart Phrasing Suggestions**
   - Based on case specifics:
     - If innocence claim → "empathy without confession" phrases
     - If long sentence → "growth and transformation" phrases
     - If victim impact mentioned → "accountability" phrases

4. **Narrative Strength Meter**
   - Real-time analysis:
     - Length check (is it too short/long?)
     - Tone consistency
     - Flag potentially problematic phrases
     - Balance check (empathy vs. facts)

5. **Learn from Similar Cases**
   - Show excerpts from successful narratives in similar cases
   - Highlight what worked

#### B. UI Design

**New Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│  ✍️ Narrative Builder: [Inmate Name]                        │
│  Progress: Section 2 of 5 ████░░░░░ 40%                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LEFT PANEL (50%):                RIGHT PANEL (50%):        │
│  ┌────────────────────────────┐  ┌────────────────────────┐│
│  │ Current Section:           │  │ 💡 AI Assistant        ││
│  │ "Personal Growth"          │  │                         ││
│  │                            │  │ Extracted Facts:        ││
│  │ [Text Editor]              │  │ • Completed AA program  ││
│  │                            │  │ • 15 years incarcerated ││
│  │                            │  │ • Family support present││
│  │                            │  │                         ││
│  │                            │  │ Suggested Phrases:      ││
│  │                            │  │ "Over 15 years, I have  ││
│  │                            │  │  dedicated myself to..." ││
│  │                            │  │                         ││
│  │                            │  │ [Insert Phrase]         ││
│  │                            │  │                         ││
│  │                            │  │ ⚠️ Flags:               ││
│  │                            │  │ None detected           ││
│  │                            │  │                         ││
│  │                            │  │ 📊 Strength Meter:      ││
│  │                            │  │ ████████░░ 80%          ││
│  │                            │  │ • Length: Good          ││
│  │                            │  │ • Tone: Balanced        ││
│  │                            │  │ • Empathy: Strong       ││
│  │                            │  │                         ││
│  │                            │  │ 💡 From Similar Cases:  ││
│  │                            │  │ "In cases like yours,   ││
│  │                            │  │  highlighting specific  ││
│  │                            │  │  programs was effective"││
│  └────────────────────────────┘  └────────────────────────┘│
│                                                              │
│  [← Previous Section] [Save Draft] [Next Section →]         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### C. Code Changes

**Files to Modify**:
- `src/pages/Narratives.tsx` - Complete redesign with split panel
- `src/services/narrative-assistant.ts` - NEW: AI assistance service
- `src/components/narrative/FactExtractor.tsx` - NEW: Component
- `src/components/narrative/PhrasingSuggestions.tsx` - NEW: Component
- `src/components/narrative/StrengthMeter.tsx` - NEW: Component

**New Service**:
```typescript
class NarrativeAssistant {
  extractFacts(transcript: Transcript): ExtractedFact[]
  
  suggestPhrasing(
    section: string, 
    context: CaseContext, 
    currentText: string
  ): Suggestion[]
  
  analyzeStrength(text: string): {
    score: number;
    length: 'too_short' | 'good' | 'too_long';
    tone: 'defensive' | 'balanced' | 'empathetic';
    flags: string[];
    suggestions: string[];
  }
  
  getSimilarNarrativeExcerpts(caseContext: CaseContext): NarrativeExcerpt[]
}
```

---

## 📋 Implementation Roadmap

### Phase 1: Feature 1 - AI Top 3 Picks (Estimated: 3-4 hours)
- [ ] Create priority scoring algorithm
- [ ] Build recommendation card UI component
- [ ] Integrate into Clients page
- [ ] Add "Explain Scoring" modal
- [ ] Test with real data

### Phase 2: Feature 2 - Similar Cases Dashboard (Estimated: 4-5 hours)
- [ ] Create similarity matching service
- [ ] Extract crime types from transcripts
- [ ] Build pattern insight cards
- [ ] Redesign Dashboard layout
- [ ] Add case selection/filtering
- [ ] Test similarity algorithms

### Phase 3: Feature 3 - Enhanced Narratives (Estimated: 5-6 hours)
- [ ] Create fact extraction logic
- [ ] Build split-panel UI
- [ ] Implement section-by-section workflow
- [ ] Create phrasing suggestion engine
- [ ] Build strength meter component
- [ ] Add similar narrative excerpts
- [ ] Test end-to-end narrative building

### Total Estimated Time: 12-15 hours

---

## 🎯 Success Metrics

### Feature 1 Success
- [ ] Volunteers report recommendations are helpful
- [ ] 70%+ of recommended cases are reviewed within 24 hours
- [ ] Score explanations are clear and trusted

### Feature 2 Success
- [ ] Volunteers use similar case insights to inform decisions
- [ ] Pattern insights lead to better narrative strategies
- [ ] Dashboard becomes primary landing page (not just Clients)

### Feature 3 Success
- [ ] Average narrative completion time decreases
- [ ] Narrative quality scores increase (measured by strength meter)
- [ ] Volunteers feel more confident in their writing

---

## 🔒 Ethical Safeguards

### Transparency
- Always label AI suggestions clearly
- Explain scoring/matching algorithms on request
- Never hide that AI is involved

### Human-in-the-Loop
- AI never makes final decisions
- All recommendations require volunteer review
- Volunteers can override any suggestion

### Bias Mitigation
- Regularly audit scoring algorithms for bias
- Ensure diverse training data (if ML models used)
- Allow volunteers to report problematic suggestions

### Data Privacy
- Never share individual case data externally
- Keep "similar cases" matching internal only
- Anonymize data in any aggregated views

---

## 💡 Future Enhancements

### National Database Integration
- Partner with National Registry of Exonerations
- Integrate Innocence Project network data
- Cross-reference with other state parole boards

### Machine Learning Improvements
- Train custom models on successful narratives
- Predict parole outcomes based on historical data
- Semantic search for better similarity matching

### Collaboration Features
- Multi-volunteer narrative co-authoring
- Peer review workflows
- Expert attorney consultation requests

---

## 📝 Next Steps

1. **Review this plan** with your team
2. **Prioritize features** (which one first?)
3. **Gather feedback** on UI mockups
4. **Begin implementation** starting with Feature 1

Would you like me to start implementing any of these features now?

