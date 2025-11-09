# 🔧 Fix: LE/Prosecution Panels Calculation

## ⚠️ Current Problem

The **"2% LE/Prosecution Panels"** metric is **INACCURATE** and **MISLEADING**.

### What It Currently Shows
```
2% = Percentage of HEARINGS conducted by LE/Prosecution commissioners
```

### What It SHOULD Show
```
X% = Percentage of PANELS that are 100% LE/Prosecution
```

## 📊 Current Calculation (WRONG)

Located in `src/pages/CommissionerBreakdown.tsx` lines 261-263:

```typescript
const lePercentage = ((commissionerAnalyses
  .filter(c => c.category === "Corrections & Law Enforcement" || c.category === "Prosecution & State's Attorney")
  .reduce((sum, c) => sum + c.hearingsCount, 0) / totalHearings) * 100).toFixed(0);
```

**This calculates:**
- Sum of all hearings conducted by LE/Prosecution commissioners
- Divided by total hearings
- Result: 2% means LE/Prosecution commissioners conducted 2% of all hearings

**Problem:** This is NOT what "LE/Prosecution Panels" means!

## ✅ Correct Calculation (SHOULD BE)

A "panel" refers to the GROUP of commissioners hearing a specific case.

"LE/Prosecution Panel" means:
- **ALL** commissioners on the panel have LE/Prosecution backgrounds
- **100% of the panel** is from law enforcement or prosecution

**Correct formula:**

```typescript
// Count panels where 100% commissioners are LE/Prosecution
const lePanels = transcripts.filter(transcript => {
  // Extract commissioners from this transcript
  const commissioners = extractCommissioners(transcript.raw_text);
  if (commissioners.length === 0) return false;
  
  // Count how many have LE/Prosecution backgrounds
  const leCount = commissioners.filter(name => {
    // Find commissioner in database or hardcoded list
    const commissioner = commissionerAnalyses.find(c => 
      c.name.toUpperCase() === name.toUpperCase()
    );
    
    return commissioner && (
      commissioner.category === "Corrections & Law Enforcement" ||
      commissioner.category === "Prosecution & State's Attorney"
    );
  }).length;
  
  // Panel is 100% LE/Prosecution only if ALL commissioners match
  return leCount === commissioners.length && commissioners.length > 0;
}).length;

const lePercentage = totalHearings > 0 
  ? ((lePanels / totalHearings) * 100).toFixed(0)
  : 0;
```

## 📈 Why This Matters

### Current (Wrong) Result: 2%
"2% of hearings were conducted by LE/Prosecution commissioners"
- **Misleading:** Doesn't tell us about panel composition
- **Inaccurate:** Not measuring what the label claims

### Correct Result: Likely 10-30%
"X% of panels had 100% LE/Prosecution commissioners"
- **Accurate:** Actually measures panel composition
- **Meaningful:** Shows how often inmates face unanimous law enforcement panels
- **Important:** This is a key bias indicator for innocence cases

## 🔍 Example Scenarios

### Scenario 1: Mixed Panel
**Panel:** 
- Commissioner A: Law Enforcement
- Commissioner B: Mental Health
- Commissioner C: Legal/Judicial

**Current calculation:** Counts as LE hearing (Commissioner A)  
**Correct calculation:** NOT a LE/Prosecution panel (only 33% LE)

### Scenario 2: 100% LE Panel  
**Panel:**
- Commissioner A: Law Enforcement
- Commissioner B: Corrections
- Commissioner C: Prosecution

**Current calculation:** Counts as LE hearing  
**Correct calculation:** IS a LE/Prosecution panel (100% LE/Prosecution) ✓

## 🛠️ Implementation Steps

The fix requires updating the calculation in `CommissionerBreakdown.tsx`.

## 📊 Expected Impact

After fixing:

**Before (Wrong):** "2% LE/Prosecution Panels"
- Misleading number
- Doesn't reflect reality
- Not useful for bias analysis

**After (Correct):** Likely "15-25% LE/Prosecution Panels"
- Accurate representation
- Shows true panel composition bias
- Useful for identifying concerning patterns

## 🎯 Why the Current Number is So Low (2%)

The 2% appears because:
1. Your dataset has 294 transcripts
2. Only a few commissioners in your system have LE/Prosecution backgrounds
3. Those commissioners only appear in ~6-7 hearings
4. 6-7 / 294 ≈ 2%

But this doesn't mean only 2% of **panels** are LE/Prosecution!

## ⚖️ The Real Question

What we SHOULD be measuring:
- "How many panels had ALL commissioners from LE/Prosecution?"
- This is the **high bias risk** scenario
- This matters for innocence claims

What we're WRONGLY measuring:
- "How many hearings involved at least one LE/Prosecution commissioner?"
- This doesn't tell us about panel composition
- Not useful for bias analysis

## 🚨 Critical for Innocence Cases

For wrongful conviction analysis, we care about:

**High Bias Risk:** 100% LE/Prosecution panel
- All decision-makers have prosecutorial mindset
- No diverse perspectives
- Highest risk of bias against innocence claims

**Medium Bias Risk:** Majority LE/Prosecution
- Some diversity, but LE perspective dominates

**Low Bias Risk:** Minority LE/Prosecution
- Diverse panel composition
- Multiple perspectives represented

The current calculation doesn't distinguish these scenarios!

## 📝 Summary

**Current:**
- Calculates: % of hearings by LE/Prosecution commissioners
- Shows: 2%
- **Status: WRONG**

**Should Be:**
- Calculates: % of panels that are 100% LE/Prosecution
- Should show: ~15-25% (estimated)
- **Status: NEEDS FIX**

---

This is a critical fix for accurate bias analysis in wrongful conviction cases! The metric is currently misleading and understates the potential bias risk.

