export class ExecutiveSummaryPromptBuilder {
  static buildUserAnalyticsPrompt(data: any[]): string {
    return `
You are an expert travel analytics engine. You analyze user browsing data from a travel platform and produce an executive summary.

#############################################
## STRICT DATA INPUT
#############################################
Here is the JSON data you must analyze:
${JSON.stringify(data, null, 2)}

#############################################
## STRICT TASK
#############################################
Using the input data:
1. Identify the **most active** and **least active** user segments based on frequency of topic visits.
2. Produce **business-level recommendations** (targeting, offers, conversion actions).
3. Summarize everything in **a single paragraph**, maximum **100 words**, no extra sections.
4. The summary **must** be concise, actionable, and executive-grade.

#############################################
## ABSOLUTE OUTPUT RULES (DO NOT VIOLATE)
#############################################
You MUST return **only** this exact HTML structure (Tailwind included):

<h1 className="text-2xl font-bold mb-4">Executive Summary</h1>
<ul className="list-disc list-inside space-y-2 text-sm">
  The highest engaged group with{' '}
  <span className="font-bold text-primary text-lg">45% (90 users)</span
  >{' '} significantly outweighing the{' '}
  <span className="font-bold text-primary text-lg">37% (74 users) </span>
  moderately active group. The Least Active segment at{' '}
  <span className="font-bold text-primary text-lg">18% (36 users)</span
  >{' '} is the primary focus area.
  <br />
  <span className="font-bold text-black text-lg">Action:</span>
  Target these 36 users immediately with a re-engagement campaign centered
  around{' '}
  <span className="font-bold text-primary text-lg">'New York'</span
  >, as the top users' focus on this topic confirms its high value.
</ul>

Where:
- The summary is **one paragraph only**, no line breaks except ONE paragraph.
- You MUST embed data insights inside <span class="font-bold text-primary text-lg"> ... </span> when mentioning percentages, user counts, or important metrics.
- You may use <b>, <i>, <ul>, <li>, and <span> ONLY inside the paragraph.
- DO NOT add <h2>, <h3>, <p>, <div>, <br>, markdown, backticks, comments, or any other tags.
- DO NOT change the structure of <h1> or <ul>.
- DO NOT create multiple sentences beyond ~3 concise sentences.

#############################################
## TONE & CONTENT RULES
#############################################
- Output should be compact, business-friendly, and ready for direct rendering in React.
- DO NOT exceed 100 words.
- DO NOT add stylistic fluff.
- DO NOT repeat the instructions.
- STRICTLY GENERATE HTML IN THE FORMAT SPECIFIED ABOVE.

#############################################
## NOW GENERATE THE SUMMARY
#############################################
Produce the final HTML output STRICTLY following the rules above.
    `;
  }
}
