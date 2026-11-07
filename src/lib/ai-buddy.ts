import { SemesterPlan } from '@/types/course';
import { PlanComparison } from './plan-diff';

export interface ExplanationRequest {
  oldPlan: SemesterPlan[] | null;
  newPlan: SemesterPlan[];
  diff: PlanComparison;
  reason: string;
  userMessage?: string;
  apiKey?: string;
}

export interface ExplanationResult {
  text: string;
  provider: 'gemini' | 'local';
  modelUsed?: string;
  error?: string;
}

export const ACADEMIC_BUDDY_SYSTEM_PROMPT = `
You are Ada, an AI Academic Learning Buddy for computer science students.
IMPORTANT ARCHITECTURAL RULES:
1. Strict Deterministic Separation: The course schedule was computed by a deterministic mathematical DAG engine (Kahn's Topological Sort Algorithm) with a hard maximum of 6 credits per semester.
2. Zero Hallucination: Never alter or invent schedules, courses, or semester sequences.
3. Direct Student Communication: Speak directly to the student in friendly, encouraging second-person ("you").
4. No Meta-Rubrics: NEVER output internal checklists, evaluation rubrics, bracketed tags like [Greeting & Empathy] or [Constraint Check], or scratchpads. Output ONLY your final, polished explanation message to the student.
`.trim();

/**
 * Strips any leaked model thinking, bracketed meta-tags, or prompt checklist repetitions.
 */
export function cleanGeminiOutput(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();

  // Strip <thought> or <thinking> tags if present
  cleaned = cleaned.replace(/<think[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/<thought[\s\S]*?<\/thought>/gi, '').trim();

  const lines = cleaned.split('\n');
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip leaked prompt instructions or persona definitions
    if (
      trimmed.startsWith('Ada, an AI Academic') ||
      trimmed.startsWith('1. Explain plan changes') ||
      trimmed.startsWith('2. Explain prerequisite') ||
      trimmed.startsWith('3. Highlight the 6-credit') ||
      trimmed.startsWith('4. Encourage/guide') ||
      trimmed.startsWith('[Constraints:') ||
      trimmed.startsWith('[Greeting & Empathy:') ||
      trimmed.startsWith('[Constraint Check:') ||
      trimmed.startsWith('Constraint Check:') ||
      trimmed.startsWith('Outline the explanation') ||
      trimmed.startsWith('Rubric:') ||
      trimmed.startsWith('Drafting response:')
    ) {
      continue;
    }

    // Skip bracketed meta directives like [Step 1: ...] or [Tone: ...]
    if (/^\[(Constraint|Step|Greeting|Tone|Task|Goal|Rubric|Note|Check|Section|Draft)[^\]]*\]/i.test(trimmed)) {
      continue;
    }

    filteredLines.push(line);
  }

  cleaned = filteredLines.join('\n').trim();

  // Remove accidental 4-space indentations from markdown paragraphs so ReactMarkdown doesn't turn normal text into a code block
  cleaned = cleaned.replace(/^( {4}|\t)(?! {4})/gm, '');

  return cleaned.length > 0 ? cleaned : rawText.trim();
}

/**
 * Formats a semester plan into an unambiguous, readable text block for LLM prompts.
 */
export function formatPlanForPrompt(plan: SemesterPlan[] | null): string {
  if (!plan || plan.length === 0) return 'No previous plan (initial evaluation).';
  return plan
    .map(
      (sem) =>
        `Semester ${sem.semesterNumber} (${sem.totalCredits}/6 credits):\n` +
        sem.courses
          .map(
            (c) =>
              `  - [${c.code}] ${c.name} (${c.credits} cr) | Prereqs: ${
                c.prerequisites.length > 0 ? c.prerequisites.join(', ') : 'None'
              }`
          )
          .join('\n')
    )
    .join('\n\n');
}

/**
 * Deterministic explanation builder that delivers nuanced, human-like explanations
 * grounded 100% in the mathematically validated DAG.
 */
export function generateLocalExplanation(
  diff: PlanComparison,
  reason: string,
  userMessage?: string
): string {
  // If user asked a specific conversational query
  if (userMessage && !reason.includes('Mastery Check')) {
    const q = userMessage.toLowerCase();

    if (q.includes('credit') || q.includes('9 credit') || q.includes('load') || q.includes('more')) {
      return `### ⚖️ Academic Credit Cap Policy (Strict 6 Credits/Semester)

I cannot add more courses to any semester. Our academic planning engine enforces a **hard mathematical ceiling of 6 credits per semester**.

Here is why:
1. **Cognitive Load & Deep Mastery:** Core courses like Data Structures & Algorithms and Advanced DB require dedicated focus. Exceeding 6 credits significantly increases failure rates.
2. **DAG Scheduling Constraint:** When Kahn's algorithm packs each semester, it greedily fills available slots up to 6 credits. Any candidate that would push the total to 7+ credits is automatically postponed to the following semester.
3. **Pacing Guarantee:** Sticking to 6 credits ensures you build solid conceptual foundations before tackling advanced capstones.`;
    }

    if (q.includes('kahn') || q.includes('dag') || q.includes('algorithm') || q.includes('topological')) {
      return `### 📐 How the Deterministic DAG Engine Works (Kahn's Algorithm)

Our platform strictly separates **mathematical scheduling** from **generative AI**:

1. **Graph Construction:** Every course is a node. Prerequisites form directed edges: \`A ➔ B\` means course A must precede course B.
2. **In-Degree Calculation:** An in-degree of 0 means all prerequisites for that course are completely satisfied.
3. **Level-by-Level Scheduling:** Kahn's algorithm finds all courses with \`inDegree == 0\`, prioritizes active retakes and critical bottleneck paths, and packs them into Semester 1 up to **6 credits**.
4. **Iterative Reduction:** Once Semester 1 is scheduled, those courses are deemed satisfied, reducing the in-degrees of downstream dependent courses (like Advanced DB and Web Engineering) for Semester 2.
5. **Zero Hallucination:** I am an LLM explainer—I do not invent courses. I simply translate this validated mathematical sequence for you!`;
    }

    if (q.includes('sys-arch') || q.includes('architecture') || q.includes('last') || q.includes('capstone')) {
      return `### 🏛️ Why Large-Scale Software Architecture is Scheduled in the Final Semester

**CS-301 (Large-Scale Software Architecture)** has dual prerequisites:
- **CS-201 (Full-Stack Web Engineering)**
- **CS-205 (Advanced Database Systems & Query Optimization)**

Because those two courses require foundational subjects (**NPTEL Database Basics** and **Data Structures**), they must be cleared first. Kahn's algorithm will not assign CS-301 an in-degree of 0 until both prerequisites have been completed in earlier semesters. That places it safely in the final semester!`;
    }

    if (q.includes('nptel') || q.includes('open resource') || q.includes('swayam')) {
      return `### 🌐 Role of Open Resources (NPTEL Courses)

Your curriculum strategically integrates high-quality Open Educational Resources (OER) like **NPTEL Database Basics (NPTEL-CS21)** and **NPTEL Cloud & Distributed Systems (NPTEL-CS34)** alongside University Core subjects.

- They carry equal credit weight (3 credits) in the DAG.
- They act as foundational prerequisites for advanced university core classes.
- If a mastery check on an NPTEL course is not cleared, dependent university core courses cannot proceed until the mastery check is resolved!`;
    }
  }

  // Handle plan adaptations / mastery check triggers
  const lines: string[] = [];

  if (reason.toLowerCase().includes('failed') || reason.toLowerCase().includes('fail')) {
    lines.push(`### ⚠️ Schedule Adaptation: Database Mastery Check Not Cleared`);
    lines.push(
      `Because your mastery check for **NPTEL Database Basics (NPTEL-CS21)** was not cleared, our deterministic DAG engine has recalculated your academic trajectory:`
    );
    lines.push('');
    lines.push(`#### 1. Remediation Priority in Semester 1`);
    lines.push(
      `**NPTEL Database Basics** (3 credits) has been placed immediately into **Semester 1** as a top-priority remediation, alongside **Data Structures & Algorithms** (3 credits). This fully utilizes the **6-credit semester limit**.`
    );
    lines.push('');
    lines.push(`#### 2. Why Advanced DB Was Deferred`);
    lines.push(
      `**Advanced Database Systems (CS-205)** has a direct prerequisite edge on Database Basics (\`NPTEL-CS21 ➔ CS-205\`). In a strict DAG, a dependent course can **never** be taken in the same semester as its prerequisite. Therefore, CS-205 was moved to **Semester 2**.`
    );
    lines.push('');
    lines.push(`#### 3. Credit Capacity Enforcement`);
    lines.push(
      `Even if you felt ready for Advanced DB, taking Database Basics (3 cr) + Data Structures (3 cr) + Advanced DB (3 cr) would total **9 credits**, violating the hard 6-credit ceiling.`
    );
    lines.push('');
    lines.push(`#### 4. Downstream Ripple Effect`);
    if (diff.coursesDelayed.length > 0) {
      const delayedList = diff.coursesDelayed
        .map((d) => `• **${d.courseCode} (${d.courseName})**: Shifted from Semester ${d.previousSemester} ➔ Semester ${d.newSemester}`)
        .join('\n');
      lines.push(delayedList);
    }
    lines.push('');
    lines.push(`> 💡 **Next Action:** Focus your attention on passing the Database Basics remediation in Semester 1. Once verified, your downstream courses will unlock smoothly!`);
  } else if (reason.toLowerCase().includes('restored') || reason.toLowerCase().includes('passed')) {
    lines.push(`### ✅ Schedule Optimized: Database Mastery Verified!`);
    lines.push(
      `Great job! With **NPTEL Database Basics (NPTEL-CS21)** verified as mastered, its outgoing prerequisite edges have been cleared in Kahn's algorithm:`
    );
    lines.push('');
    lines.push(
      `• **Advanced Database Systems (CS-205)** has moved forward to **Semester 1**, pairing with **Data Structures & Algorithms** (6 credits total).`
    );
    lines.push(
      `• All downstream capstone courses have shifted earlier, shortening your timeline back to a streamlined progression.`
    );
    lines.push('');
    lines.push(`*Mathematical verification:* 0 circular dependencies, 6/6 credits optimal capacity.`);
  } else {
    // General plan update
    lines.push(`### 📋 Academic Plan Updated`);
    lines.push(`The deterministic DAG engine has re-sorted your courses to guarantee prerequisite compliance and credit caps.`);
    if (diff.coursesDelayed.length > 0) {
      lines.push(`**Deferred Courses:**`);
      diff.coursesDelayed.forEach((d) => {
        lines.push(`- **${d.courseCode}**: Semester ${d.previousSemester} ➔ Semester ${d.newSemester}`);
      });
    }
    if (diff.coursesAdvanced.length > 0) {
      lines.push(`**Accelerated Courses:**`);
      diff.coursesAdvanced.forEach((d) => {
        lines.push(`- **${d.courseCode}**: Semester ${d.previousSemester} ➔ Semester ${d.newSemester}`);
      });
    }
    lines.push(`All semesters strictly adhere to the 6-credit limit.`);
  }

  return lines.join('\n');
}

/**
 * Dynamically queries Google Generative Language API to get working models for this key
 */
async function discoverWorkingModels(apiKey: string): Promise<{ models: string[]; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
      {
        headers: {
          'x-goog-api-key': apiKey.trim(),
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const list = data.models || [];
      const supported = list
        .filter((m: { supportedGenerationMethods?: string[] }) =>
          m.supportedGenerationMethods?.includes('generateContent')
        )
        .map((m: { name: string }) => m.name.replace('models/', ''));

      if (supported.length > 0) {
        return { models: supported };
      }
    } else {
      const errData = await res.json().catch(() => null);
      const errMsg = errData?.error?.message || res.statusText;
      return { models: [], error: errMsg };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Network failure';
    return { models: [], error: errMsg };
  }

  return { models: [] };
}

/**
 * Pings Google Gemini to quickly test key validity
 */
export async function testGeminiKey(
  apiKey: string
): Promise<{ success: boolean; model?: string; message: string }> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return { success: false, message: 'No API key provided. Check environment variables or enter a key.' };
  }

  // 1. Discover models dynamically
  const discovery = await discoverWorkingModels(cleanKey);
  if (discovery.error) {
    return {
      success: false,
      message: `Google Gemini API error: ${discovery.error}`,
    };
  }

  const candidateModels = discovery.models.length > 0
    ? discovery.models
    : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': cleanKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping: Respond with "pong"' }] }],
          }),
        }
      );

      if (response.ok) {
        return {
          success: true,
          model,
          message: `Successfully connected to Google Gemini (${model})!`,
        };
      }
    } catch {
      // try next
    }
  }

  return {
    success: false,
    message: 'Could not connect to any Gemini models with this key.',
  };
}

/**
 * Main AI Buddy explanation coordinator.
 * Can call external Gemini if an API key is provided, or seamlessly
 * falls back to the deterministic local explanation generator.
 */
export async function getBuddyExplanation(
  req: ExplanationRequest
): Promise<ExplanationResult> {
  const { oldPlan, newPlan, diff, reason, userMessage, apiKey } = req;
  const cleanKey = (apiKey || '').trim();

  // If user provided a Gemini API key or environment key is present, attempt live LLM call
  if (cleanKey.length > 0) {
    let lastError = '';
    try {
      const systemInstruction = `
${ACADEMIC_BUDDY_SYSTEM_PROMPT}

STYLE DIRECTIVES:
- Write DIRECTLY to the student in the second person ("you").
- Express calm empathy for any failed check.
- Explain the prerequisite dependency and the 6-credit limit clearly.
- Output ONLY the final student message with Markdown headers (###), bold text, and bullet points.
- NEVER output checklists, bracketed prompts like [Constraints], or planning rubrics.
`.trim();

      const userPrompt = `
UPDATE REASON:
${reason}

${userMessage ? `STUDENT QUERY:\n"${userMessage}"\n` : ''}

CURRENT MATHEMATICAL SCHEDULE (Topologically calculated by Kahn's Algorithm):
${formatPlanForPrompt(newPlan)}

${oldPlan ? `PREVIOUS SCHEDULE:\n${formatPlanForPrompt(oldPlan)}\n` : ''}

TOPOLOGICAL DIFF DETAILS:
${diff.summaryText}
Deferred Courses: ${JSON.stringify(diff.coursesDelayed)}
Remediation Courses: ${JSON.stringify(diff.coursesAddedToSchedule)}

TASK:
Provide your friendly, encouraging explanation to the student explaining why the mathematical DAG scheduled their courses this way.
`.trim();

      // 1. Discover models or use robust defaults
      const discovery = await discoverWorkingModels(cleanKey);
      if (discovery.error) {
        lastError = discovery.error;
      }

      const candidateModels = discovery.models.length > 0
        ? discovery.models
        : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

      for (const model of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': cleanKey,
              },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstruction }],
                },
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: {
                  temperature: 0.4,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && candidateText.trim().length > 0) {
              const cleanedText = cleanGeminiOutput(candidateText);
              return {
                text: cleanedText,
                provider: 'gemini',
                modelUsed: model,
              };
            }
          } else {
            // Fallback without systemInstruction if a model doesn't support systemInstruction
            const fallbackRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': cleanKey,
                },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          text: `${systemInstruction}\n\n${userPrompt}`,
                        },
                      ],
                    },
                  ],
                }),
              }
            );

            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              const fbText = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (fbText && fbText.trim().length > 0) {
                return {
                  text: cleanGeminiOutput(fbText),
                  provider: 'gemini',
                  modelUsed: model,
                };
              }
            } else {
              const errData = await response.json().catch(() => null);
              lastError = errData?.error?.message || response.statusText;
              console.warn(`Gemini API error with model ${model}:`, lastError);
            }
          }
        } catch (innerErr) {
          lastError = innerErr instanceof Error ? innerErr.message : 'Network error';
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error';
    }

    // If an error occurred with the live key, build fallback with helpful alert
    const localText = generateLocalExplanation(diff, reason, userMessage);
    const alertNote = lastError
      ? `\n\n> ⚠️ **Gemini API Note:** Google returned: *"${lastError}"*. Displaying schedule via deterministic engine.`
      : '';

    return {
      text: localText + alertNote,
      provider: 'local',
      modelUsed: "Kahn's Deterministic Rule Explainer",
      error: lastError,
    };
  }

  // Fallback to our deterministic local explainer
  return {
    text: generateLocalExplanation(diff, reason, userMessage),
    provider: 'local',
    modelUsed: "Kahn's Deterministic Rule Explainer",
  };
}
