export interface Transcript {
  id: string;
  filename: string;
  innocenceScore: number;
  dateUploaded: string;
  content: string;
  claims: Claim[];
}

export interface Claim {
  text: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export const mockTranscripts: Transcript[] = [
  {
    id: "1",
    filename: "State_v_Johnson_2019.pdf",
    innocenceScore: 0.82,
    dateUploaded: "2024-01-15",
    content: `COURT TRANSCRIPT - STATE V. JOHNSON

THE COURT: This matter comes before the court on the defendant's motion for a new trial based on newly discovered evidence. 

DEFENDANT'S ATTORNEY: Your Honor, we present alibi evidence from three witnesses who were not called during the original trial. These witnesses place my client at a family gathering 45 miles away at the time of the alleged crime.

WITNESS 1 TESTIMONY: I remember that night clearly. Marcus was at my house for my daughter's birthday party. He arrived at 6:30 PM and didn't leave until after 10 PM. I have photos with timestamps to prove it.

PROSECUTOR: The original conviction was based on eyewitness testimony placing the defendant at the scene.

DEFENDANT'S ATTORNEY: That eyewitness later recanted, stating they were pressured by investigators and were not wearing their prescription glasses at the time of identification.

FORENSIC EXPERT: Upon re-examination of the DNA evidence, I found that the samples were contaminated during collection. The chain of custody was broken, and proper protocols were not followed.`,
    claims: [
      {
        text: "alibi evidence from three witnesses who were not called during the original trial",
        confidence: 0.89,
        startIndex: 160,
        endIndex: 247,
      },
      {
        text: "That eyewitness later recanted, stating they were pressured by investigators",
        confidence: 0.91,
        startIndex: 587,
        endIndex: 664,
      },
      {
        text: "DNA samples were contaminated during collection. The chain of custody was broken",
        confidence: 0.85,
        startIndex: 770,
        endIndex: 850,
      },
    ],
  },
  {
    id: "2",
    filename: "People_v_Martinez_2020.pdf",
    innocenceScore: 0.45,
    dateUploaded: "2024-01-20",
    content: `COURT TRANSCRIPT - PEOPLE V. MARTINEZ

THE COURT: We are here for sentencing in the matter of People v. Martinez.

PROSECUTOR: The evidence clearly shows the defendant's guilt. Multiple witnesses testified to seeing the defendant at the scene, and physical evidence corroborates their testimony.

DEFENDANT: I maintain my innocence, Your Honor. But I understand the jury has spoken.

DEFENSE ATTORNEY: While we respect the jury's verdict, we note some inconsistencies in witness testimony that we believe warrant appeal.`,
    claims: [
      {
        text: "inconsistencies in witness testimony",
        confidence: 0.52,
        startIndex: 450,
        endIndex: 488,
      },
    ],
  },
  {
    id: "3",
    filename: "Commonwealth_v_Smith_2018.pdf",
    innocenceScore: 0.91,
    dateUploaded: "2024-01-22",
    content: `COURT TRANSCRIPT - COMMONWEALTH V. SMITH

THE COURT: This is a hearing on defendant's petition for post-conviction relief.

DEFENSE ATTORNEY: Your Honor, we have discovered that the prosecution withheld exculpatory evidence during the original trial. A police report showing another suspect confessing to the crime was never disclosed to the defense.

NEW EVIDENCE: Detective Johnson's notes indicate that a different individual, who has since been convicted of similar crimes, admitted to this offense but the information was buried in case files.

INNOCENCE PROJECT ATTORNEY: DNA testing, which was not available at the time of trial, definitively excludes Mr. Smith as the perpetrator. The DNA matches the individual mentioned in the suppressed police report.

CHARACTER WITNESS: I've known Mr. Smith for 30 years. He's never been violent. The crime he was convicted of is completely out of character.

DEFENDANT: I've spent 15 years in prison for something I didn't do. This DNA evidence proves my innocence.`,
    claims: [
      {
        text: "prosecution withheld exculpatory evidence during the original trial",
        confidence: 0.94,
        startIndex: 145,
        endIndex: 217,
      },
      {
        text: "another suspect confessing to the crime was never disclosed",
        confidence: 0.92,
        startIndex: 240,
        endIndex: 299,
      },
      {
        text: "DNA testing definitively excludes Mr. Smith as the perpetrator",
        confidence: 0.96,
        startIndex: 540,
        endIndex: 603,
      },
    ],
  },
  {
    id: "4",
    filename: "State_v_Williams_2021.pdf",
    innocenceScore: 0.67,
    dateUploaded: "2024-01-25",
    content: `COURT TRANSCRIPT - STATE V. WILLIAMS

DEFENSE ATTORNEY: The conviction relied heavily on jailhouse informant testimony, which has proven to be unreliable in numerous cases.

INFORMANT TESTIMONY EXPERT: Studies show that jailhouse informants have strong incentives to fabricate testimony in exchange for reduced sentences.

FORENSIC EXPERT: The forensic analysis used in this case employed techniques that have since been discredited by the scientific community.`,
    claims: [
      {
        text: "jailhouse informant testimony, which has proven to be unreliable",
        confidence: 0.74,
        startIndex: 75,
        endIndex: 137,
      },
      {
        text: "forensic analysis used techniques that have since been discredited",
        confidence: 0.71,
        startIndex: 310,
        endIndex: 376,
      },
    ],
  },
  {
    id: "5",
    filename: "People_v_Davis_2019.pdf",
    innocenceScore: 0.38,
    dateUploaded: "2024-02-01",
    content: `COURT TRANSCRIPT - PEOPLE V. DAVIS

PROSECUTOR: The defendant was caught on surveillance camera at the scene of the crime.

DEFENSE: The video quality is poor and identification is uncertain.

WITNESS: I saw the defendant running from the location shortly after the incident occurred.`,
    claims: [
      {
        text: "video quality is poor and identification is uncertain",
        confidence: 0.48,
        startIndex: 125,
        endIndex: 177,
      },
    ],
  },
];
