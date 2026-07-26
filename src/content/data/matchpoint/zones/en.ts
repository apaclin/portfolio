export interface ZoneCopy {
  title: string;
  body: string;
}

export const enZoneCopy: Record<string, ZoneCopy> = {
  chips: {
    title: 'Two axes, not one',
    body: 'Severity is how much is at risk; confidence is how sure the system is. Only severity carries color, so the two never read as one signal.',
  },
  stepper: {
    title: 'An exception has a lifecycle',
    body: 'A warning vanishes when you dismiss it. An object keeps its stage, owner and history — this screen is one stage of five.',
  },
  conclusion: {
    title: 'The answer before the evidence',
    body: 'One sentence states what differs, by how much, and what it costs. The table below is proof, not the finding.',
  },
  'diff-table': {
    title: 'No side is marked wrong',
    body: 'Both values are bold: the row reports a difference, not a culprit. Cells are never filled with color — status lives in its own column.',
  },
  'confidence-popover': {
    title: 'Confidence you can open',
    body: "The chip isn't a badge — open it and the flag explains itself: the trigger, the signals, and the rule that fired. Without this, people recheck automation by hand.",
  },
  'suggested-actions': {
    title: 'Suggested, not executed',
    body: 'Three branches, each with its real cost — time, approval, who gets emailed. Approve as-is is the only amber card: it closes outside tolerance and needs a documented reason.',
  },
  'vendor-context': {
    title: 'Baseline, not a global rule',
    body: '+20% is an anomaly for this vendor, measured against its own history. A new vendor has no baseline — the panel says so instead of faking certainty.',
  },
  activity: {
    title: 'The trail stays inside',
    body: 'System events and human actions in one stream. In the current process this lives in email and is gone by the time an audit asks.',
  },
};
