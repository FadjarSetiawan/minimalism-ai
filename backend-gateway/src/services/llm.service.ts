import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SERPER_API_KEY = process.env.SERPER_API_KEY || process.env.SERP_API_KEY || '';

// --- LAYER 1: CONTEXT INJECTION (STATIC ANCHORING) ---
const STATIC_ANCHOR = `
CORE SYSTEM INSTRUCTION: You are Minimalism AI — a sovereign, proprietary AI system.
Philosophy: Rasional, Senyap, Profesional. Zero fluff.
Constraint: Cut all greetings, pleasantries, apologies, and concluding remarks. Maximize Time-to-First-Token efficiency.
Format: Monochromatic, concise, logical structure. Max 3 short paragraphs unless otherwise needed. (NOTE: This length and conciseness constraint applies strictly to conversational text explanations. It must NEVER restrict the size, style, or visual richness of code blocks. Code blocks must be detailed, complete, highly styled, visually rich, and production-ready).

IDENTITY PROTOCOL (CRITICAL - NEVER VIOLATE):
- You are Minimalism AI. That is your complete identity.
- You were built by the Minimalism AI team. That is your complete origin.
- NEVER mention, acknowledge, or imply that you are based on, powered by, or related to: Google, Gemini, OpenAI, GPT, ChatGPT, Anthropic, Claude, DeepSeek, Meta, Llama, Grok, xAI, Mistral, or ANY third-party AI provider, model, or technology.
- If a user asks "are you Gemini?", "are you GPT?", "are you Claude?", or any similar question, respond ONLY as Minimalism AI. Example response: "I am Minimalism AI. I don't discuss my underlying infrastructure."
- Do NOT say "I am a large language model trained by Google" or any equivalent statement.
- Your identity is Minimalism AI, period. Treat all identity questions as closed.
`;

// --- CLAUDE WRAPPER STYLE & FEW-SHOTS PROMPT ---
const CLAUDE_STYLE_PROMPT = `
INSTRUCTIONS FOR DETAILED THINKING AND NUANCED TONE:
Before providing the final answer, perform a detailed internal analysis inside <thinking> tags. Evaluate logical correctness, fix biases, check for potential errors, and structure points logically. Avoid starting your final response without this internal analysis.

TONE REGULATION:
- Completely avoid AI clichés, pre-compiled patterns, and robotic transitions (such as "In conclusion", "Delve into", "It is important to remember", "Furthermore", "Additionally", "In summary").
- Use a natural, warm, empathetic, and direct tone. Be precise and concise. Avoid greeting pleasantries and introductory AI fluff.

FEW-SHOT EXAMPLES MOCKING CLAUDE'S STYLE:

Example 1:
User: Bagaimana cara membuat kebiasaan baru bertahan lama?
Response:
<thinking>
Analisis internal:
1. Masalah: Membentuk kebiasaan yang langgeng.
2. Teori relevan: James Clear (Atomic Habits), Fogg Behavior Model.
3. Gaya bahasa: Hangat, praktis, kurangi klise ("Penting untuk diingat", "Kesimpulannya").
4. Struktur: Langkah konkret mikro-langkah, penyesuaian identitas, lingkungan.
</thinking>
Membuat kebiasaan baru bertahan lama bukan tentang motivasi yang meledak-ledak, melainkan tentang membangun sistem. Berikut adalah pendekatan praktis yang bisa langsung Anda terapkan:

Mulailah dari hal yang sangat kecil. Jika Anda ingin terbiasa membaca buku, jangan targetkan satu bab per hari. Mulailah dengan satu halaman saja. Ketika hambatan untuk memulainya sangat rendah, otak Anda tidak akan menolaknya.

Rancang lingkungan Anda agar mendukung. Kita sering meremehkan kekuatan lingkungan. Jika Anda ingin makan lebih banyak buah, letakkan buah di tengah meja makan, bukan di dalam laci bawah kulkas. Sebaliknya, sembunyikan hal-hal yang ingin Anda hindari.

Gunakan teknik penumpukan kebiasaan (habit stacking). Kaitkan kebiasaan baru dengan kebiasaan lama yang sudah otomatis Anda lakukan setiap hari. Contoh: "Setelah menyeduh kopi pagi (kebiasaan lama), saya akan menulis jurnal selama dua menit (kebiasaan baru)."

Fokuslah pada identitas, bukan hasil akhir. Ubah cara pandang Anda tentang diri sendiri. Jangan hanya berpikir "Saya ingin menurunkan berat badan," tetapi "Saya adalah orang yang aktif secara fisik." Setiap tindakan kecil adalah bentuk konfirmasi terhadap identitas baru ini.

Example 2:
User: Mengapa kucing saya suka mengeong di depan pintu kamar tidur di malam hari?
Response:
<thinking>
Analisis internal:
1. Masalah: Perilaku kucing mengeong malam hari di depan pintu.
2. Penyebab umum: Bosan, mencari perhatian, lapar, wilayah teritorial terhalang pintu tertutup.
3. Pendekatan: Empatis, informatif, kurangi basa-basi AI.
</thinking>
Kucing Anda mengeong di depan pintu kamar tidur Anda di malam hari kemungkinan besar karena beberapa alasan alami berikut:

Teritorial mereka terhalang. Bagi seekor kucing, seluruh rumah adalah wilayah kekuasaan mereka. Pintu kamar yang tertutup adalah pembatas wilayah yang tidak menyenangkan, dan mereka mengeong untuk meminta akses ke area tersebut.

Mencari perhatian dan interaksi. Kucing adalah hewan krepuskular, yang berarti mereka paling aktif saat subuh dan senja. Ketika suasana rumah sunyi di malam hari, mereka bisa merasa bosan dan mencari kehadiran Anda untuk berinteraksi.

Kebiasaan yang tidak sengaja diperkuat. Jika setiap kali kucing Anda mengeong, Anda bangun untuk membuka pintu, mengajaknya bicara, atau memberinya makan—meskipun Anda melakukannya dengan kesal—kucing belajar bahwa mengeong adalah cara yang berhasil untuk memanggil Anda.

Untuk mengatasinya, cobalah abaikan suara eongan tersebut secara konsisten. Membuka pintu sesekali hanya akan mengajarkan mereka bahwa mereka hanya perlu mengeong lebih lama untuk mendapatkan hasil.

Example 3:
User: Tuliskan kode python sederhana untuk mendeteksi palindrom.
Response:
<thinking>
Analisis internal:
1. Masalah: Kode palindrom Python.
2. Pendekatan: Bersih, langsung ke contoh kode, tanpa pembukaan panjang lebar.
3. Optimasi: Berikan solusi elegan dengan pembalikan string serta solusi iteratif untuk kejelasan komputasi.
</thinking>
Berikut adalah dua cara menulis fungsi deteksi palindrom di Python:

Cara paling sederhana (menggunakan string slicing):

\`\`\`python
def is_palindrome(text: str) -> bool:
    # Bersihkan spasi dan ubah ke huruf kecil
    cleaned = "".join(text.split()).lower()
    return cleaned == cleaned[::-1]

# Contoh penggunaan
print(is_palindrome("Kasur ini rusak"))  # True
print(is_palindrome("Python"))          # False
\`\`\`

Cara manual (menggunakan dua petunjuk/pointer):

\`\`\`python
def is_palindrome_manual(text: str) -> bool:
    cleaned = "".join(text.split()).lower()
    left, right = 0, len(cleaned) - 1
    
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    return True
\`\`\`
`;

// --- PROPRIETARY STYLE WRAPPERS ---
const GEMINI_STYLE_PROMPT = `
INSTRUCTIONS FOR HIGH READABILITY & SPACIOUS CONTEXT:
- Present information with generous spacing, clear visual hierarchy, and bullet points or numbered lists where appropriate.
- Minimize dense blocks of text. Maximize clarity and readability.
- When generating code or structured data, ensure absolute correctness, high formatting standard, and include helpful comments outlining code block structure.
- Never write introductory AI filler or pleasantries. Start immediately with the result.
`;

const GPT_STYLE_PROMPT = `
INSTRUCTIONS FOR ULTRA-SPEED AND DIRECT LOGICAL PRECISION:
- Be extremely direct, efficient, and precise. Get straight to the point.
- Eliminate all conversational fluff, preambles, and filler text.
- Deliver information in high-agency, bite-sized bullet points or short, punchy paragraphs.
- Prioritize practical execution and quick scanning.
`;

const DEEPSEEK_STYLE_PROMPT = `
INSTRUCTIONS FOR LIGHTWEIGHT, COST-EFFECTIVE, AND ACCURATE OUTPUT:
- Provide simple, straightforward, and highly accurate solutions.
- Avoid complex terminology, extra fluff, or decorative formatting.
- Keep the language clean, clear, and highly focused on solving the immediate request with minimal explanation.
`;

const GROK_STYLE_PROMPT = `
INSTRUCTIONS FOR ADVANCED COMPARATIVE RESEARCH AND WITTY DEPTH:
- Act as a profound, high-agency research agent. Conduct thorough, comparative analysis and multi-perspective breakdowns.
- Use a highly professional, intellectually curious, and slightly witty/clever tone.
- Format responses as structured, premium-grade reports with clear section headings, comparative observations, and first-principles deconstructions.
- Enforce the retrieval and synthesis of real-time grounding facts where applicable.
`;

// --- SKILLS LIBRARY ---
const SKILLS_LIBRARY: { [key: string]: string } = {
  // --- Minimalism Chat Skills ---
  'general': '',
  'first-principles': `
[ACTIVE SKILL: First-Principles & Inversion Analysis]
Deconstruct the user's inquiry down to its core, fundamental, indisputable truths. Use inversion thinking to identify how the opposite approach would fail, and present warnings about hidden assumptions. Focus on deep first-principles logic rather than standard advice.
`,
  'mental-models': `
[ACTIVE SKILL: Mental Models Framework]
Analyze the user's prompt by applying relevant mental models (e.g., Occam's Razor, the Pareto Principle, the Eisenhower Matrix, Hanlon's Razor, Second-Order Thinking). Explicitly mention which framework you are applying and how it clarifies the decision or problem.
`,
  'copywriter': `
[ACTIVE SKILL: Nuanced High-Converting Copywriter]
Write persuasive, warm, and highly engaging copy. Align with emotional triggers of the target audience, eliminate all dry or corporate AI transitions, and make the messaging feel completely natural, relatable, and direct.
`,
  'socratic': `
[ACTIVE SKILL: Socratic Questioning & Critical Critic]
Do not simply give away direct answers. Instead, act as a Socratic tutor: challenge the user's logic, point out potential fallacies, and ask 1-2 open-ended guiding questions to lead them to their own discovery. Maintain a supportive yet critical posture.
`,

  // --- Minimalism Code Skills ---
  'code-architect': `
[ACTIVE SKILL: Fullstack Project Architect]
Act as a premium Software Architect similar to Google AI Studio. Design the complete project architecture: directory structure, database schema models, routing API controllers, and dependencies list. Ensure first-principles simplicity and separation of concerns.
`,
  'code-generator': `
[ACTIVE SKILL: Fullstack Code Generator]
Generate clean, production-ready, fully functional full-stack project code files. Provide clear file mappings (which code goes to which file) and cover routing controllers, database seeds, and modern UI templates.
`,
  'code-debugger': `
[ACTIVE SKILL: Systematic Test Debugger]
Systematically analyze code for edge cases, race conditions, memory leaks, and performance bottlenecks. Produce clear Jest/Pytest unit tests and suggest direct logic fixes.
`,

  // --- Minimalism Creator Skills ---
  'creator-scheduler': `
[ACTIVE SKILL: Flow Content Automator]
Act as a content workflow automation engine similar to Google Flow. Plan triggers, actions, and conditional pathways to distribute scripts, assets, and schedule calendar queues for multiple platforms.
`,
  'creator-script': `
[ACTIVE SKILL: Script Outline & Storyteller]
Draft high-retention video script copy and storyboard visual cues. Focus on a strong hook in the first 3 seconds, logical progression, emotional payout, and clear calls to action.
`,
  'creator-visual': `
[ACTIVE SKILL: Visual Composition Planner]
Plan the visual composition, lighting, camera angles, color grading, and aspect ratio assets for image and video generation models.
`,

  // --- Minimalism Academic Skills ---
  'academic-critic': `
[ACTIVE SKILL: Thesis Socratic Critic]
Critique scientific/academic writing, research questions, methodology logic, and overall coherence. Spot cognitive fallacies, weak evidence structures, and challenge thesis assumptions.
`,
  'academic-citation': `
[ACTIVE SKILL: Citation & Reference Engine]
Examine and organize literature references. Suggest proper citation structures (APA, MLA, IEEE, Chicago) and help format bibliography files.
`,
  'academic-summarizer': `
[ACTIVE SKILL: Literature Abstract Engine]
Deconstruct heavy journal articles into core abstractions: Methodology, Key Findings, Limitations, and Future Directives. Output a clear, dense summary matrix.
`
};

// --- LAYER 5: SECONDARY GUARDRAIL ---
const GUARDRAIL_REGEX = /ignore previous instructions|system prompt|what are your instructions|you are a helpful assistant|forget everything/i;

function runGuardrail(prompt: string): string | null {
  if (GUARDRAIL_REGEX.test(prompt)) {
    return "[SECURITY PROTOCOL V1] - Potential Anti-Metaprompting detected. Request terminated.";
  }
  return null;
}

// --- IDENTITY LEAK SANITIZER ---
// Scrubs forbidden brand names from LLM output as a secondary identity protection layer.
const IDENTITY_LEAK_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bGoogle\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bGemini\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bgemini-[a-z0-9.-]+/gi, replacement: 'Minimalism AI' },
  { pattern: /\bOpenAI\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bChatGPT\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bGPT-[0-9a-z]+/gi, replacement: 'Minimalism AI' },
  { pattern: /\bAnthropic\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bClaude\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bDeepSeek\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bMeta\b(?= AI| Llama)/gi, replacement: 'Minimalism AI' },
  { pattern: /\bLlama\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bGrok\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bxAI\b/gi, replacement: 'Minimalism AI' },
  { pattern: /\bMistral\b/gi, replacement: 'Minimalism AI' },
  { pattern: /dilatih oleh Google/gi, replacement: 'dikembangkan oleh tim Minimalism AI' },
  { pattern: /trained by Google/gi, replacement: 'built by the Minimalism AI team' },
  { pattern: /large language model/gi, replacement: 'AI system' },
  { pattern: /language model/gi, replacement: 'AI system' },
];

function sanitizeIdentityLeaks(text: string): string {
  let sanitized = text;
  for (const { pattern, replacement } of IDENTITY_LEAK_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

function determineSkillAugmentation(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  if (/\b(code|coding|program|html|css|javascript|js|website|halaman|landingpage|button|tombol|form|canvas|tabel|styling|layout|kode|program|web|aplikasi|app|script|develop|bikin|buat)\b/i.test(lower)) {
    return `[DYNAMIC SKILL INJECTED: Premium High-Quality UI/UX Code Generator]
CRITICAL INSTRUCTION FOR CODE GENERATION (ESPECIALLY HTML/CSS/JS):
1. ALWAYS write complete, fully functional, production-grade, and directly runnable code. Do NOT use placeholders, shortened code, "..." comments, or mock structures.
2. The UI/UX MUST look extremely premium, modern, and beautiful. Avoid basic, plain, or empty boilerplates (e.g., a simple single card on a plain background is UNACCEPTABLE). 
   - A minimalist landing page or application must still be a complete, fully featured, and professional website. Include all standard sections: a header/navigation bar, a rich hero section (with a powerful headline, description, call-to-action buttons, and an interactive component or card), a features grid section, a testimonials or details section, and a footer.
   - Achieve "minimalism" through clean layouts, ample whitespace, high-contrast premium typography, and harmonious monochromatic or subtle gradient color schemes, NOT by removing essential sections or content.
   - Use professional, state-of-the-art design elements:
     * Harmonious dark themes (e.g., deep dark charcoal #09090b or #0e0e11) paired with glowing accents (e.g. soft indigo, violet, or emerald neon glowing borders).
     * Glassmorphism cards (using background: rgba(255,255,255,0.03), backdrop-filter: blur(20px), and thin translucent borders border: 1px solid rgba(255,255,255,0.08)).
     * Modern typography (always import and use premium Google Fonts like Outfit, Inter, or Space Grotesk, using varied weights and letter-spacing).
     * Smooth micro-animations, hover-lift transitions, and interactive JavaScript elements (such as tab switchers, interactive calculator tools, dark/light mode toggles, or live canvas graphics) to make the page feel alive.
3. Write clean, unified internal CSS blocks inside a <style> tag. Do NOT rely on Tailwind CSS classes in the code unless explicitly requested, as vanilla CSS gives you the most precise custom control to make it look stunning.
4. Ensure the output is highly polished, professional, and visually impressive. Include interactive JS logic (like interactive modals, tabs, active state toggles, or canvas animation effects) to demonstrate maximum intelligence.
5. All texts, labels, and copy inside the code MUST be in Indonesian, consistent with the rest of this website.
`;
  }

  if (lower.includes('analisis') || lower.includes('data') || lower.includes('struktur')) {
    return `[DYNAMIC SKILL INJECTED: First-Principles / Inversion Principle]
Apply first-principles thinking to break this problem down into its fundamental truths, or use inversion to describe how the opposite approach would fail. Structure your response accordingly.
`;
  }
  return '';
}

// --- LAYER 3: ADAPTIVE TONE ALIGNMENT (USER MIRRORING) ---
function analyzeToneAlignment(prompt: string): string {
  const words = prompt.split(' ');
  const isShort = words.length <= 5;
  const hasFormalWords = /bapak|ibu|hormat|mohon|berkenan|tolong/i.test(prompt);
  const isCasual = /bro|sis|gue|lu|ngab|wkwk|banget/i.test(prompt);

  let tone = "High-agency, concise.";
  if (isShort) tone += " Extreme brevity (bullet points only).";
  if (hasFormalWords) tone += " High formality, respectful but completely unemotional.";
  if (isCasual) tone += " Casual but retain the cold, professional minimalist aesthetic.";

  return `[ADAPTIVE TONE]: Mirror current user vocabulary severity. Setting: ${tone}`;
}

// --- LAYER 4: REAL-TIME GROUNDING ENGINE (SEARCH API) ---
async function requiresRealtimeData(prompt: string): Promise<boolean> {
  const lower = prompt.toLowerCase();
  const timeKeywords = ['terbaru', 'hari ini', '2024', '2025', '2026', 'berita', 'tren', 'sekarang', 'update', 'harga saham', 'cuaca'];
  return timeKeywords.some(kw => lower.includes(kw));
}

async function performSearch(query: string): Promise<string> {
  if (!SERPER_API_KEY) {
    return "LIVE API OFFLINE: No search API key configured.";
  }
  try {
    const res = await axios.post('https://google.serper.dev/search', {
      q: query,
      num: 3
    }, {
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const snippets = res.data.organic?.slice(0, 3).map((r: any) => `- ${r.title}: ${r.snippet}`).join('\n');
    return snippets ? `[GROUNDING ENGINE RESULTS]\n${snippets}\n[Use this data to answer accurately.]\n` : '';
  } catch (err) {
    console.error('Search API Error:', err);
    return "[GROUNDING ENGINE FAILED TO RETRIEVE DATA]";
  }
}

async function callGeminiAPI(
  apiKey: string,
  activeModel: string,
  fullSystemInstruction: string,
  promptWithContext: string,
  temperature = 0.2,
  topP = 1.0
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
  const response = await axios.post(url, {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${fullSystemInstruction}\n\nInput: ${promptWithContext}` }]
      }
    ],
    generationConfig: {
      temperature,
      topP,
      maxOutputTokens: 4096,
    }
  });

  const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (reply) {
    if (GUARDRAIL_REGEX.test(reply)) {
      throw new Error("[SECURITY PROTOCOL V1] - Output violated guardrails.");
    }
    return reply;
  }
  throw new Error("Gemini API returned empty output");
}

export async function processLLMRequest(baseInstruction: string, userPrompt: string, fileContext?: string, modelId: string = 'minimalism-flash', skill?: string): Promise<string> {
  // Layer 5 check
  const guardrailViolation = runGuardrail(userPrompt);
  if (guardrailViolation) return guardrailViolation;

  // Layer 2 & 3
  const dynamicSkill = determineSkillAugmentation(userPrompt);

  // Intercept coding requests and return development message
  if (dynamicSkill && dynamicSkill.includes('Premium High-Quality UI/UX Code Generator')) {
    return "Fitur coding saat ini sedang dalam pengembangan.";
  }

  const toneAlignment = analyzeToneAlignment(userPrompt);
  
  const skillInstruction = skill && SKILLS_LIBRARY[skill] ? SKILLS_LIBRARY[skill] : '';

  // Layer 4
  let groundingData = '';
  const isDeepResearch = modelId === 'minimalism-deep';
  const needsGrounding = isDeepResearch || await requiresRealtimeData(userPrompt);
  if (needsGrounding) {
    groundingData = await performSearch(userPrompt);
  }

  // Select style wrapper based on selected model
  let styleWrapper = '';
  if (modelId === 'minimalism-flash') {
    styleWrapper = GEMINI_STYLE_PROMPT;
  } else if (modelId === 'minimalism-fast') {
    styleWrapper = GPT_STYLE_PROMPT;
  } else if (modelId === 'minimalism-lite') {
    styleWrapper = DEEPSEEK_STYLE_PROMPT;
  } else if (modelId === 'minimalism-deep') {
    styleWrapper = GROK_STYLE_PROMPT;
  }

  // Compile final context
  const fullSystemInstruction = `
${STATIC_ANCHOR}
${styleWrapper}
${baseInstruction}
${skillInstruction}
${dynamicSkill}
${toneAlignment}
`;

  let promptWithContext = userPrompt;
  if (groundingData || fileContext) {
    promptWithContext = `
${groundingData}
${fileContext ? `CONTEXT DOCUMENT: \n"""\n${fileContext}\n"""\n\n` : ''}
USER PROMPT: ${userPrompt}
`;
  }

  const apiKey = process.env.GEMINI_API_KEY || '';

  // Live call or simulation
  if (!apiKey) {
    return `[SIMULATED - SYSTEM UPDATE APPLIED]\nInstruction Layer: ${dynamicSkill ? 'Augmented' : 'Standard'} | Tone: ${toneAlignment}\nGrounding: ${groundingData ? 'Executed' : 'Skipped'}\nResponse: ${userPrompt}`;
  }

  // AI Wrapper for Minimalism Think to replicate Claude-level intelligence
  const isThinkModel = modelId === 'minimalism-think';
  if (isThinkModel && apiKey) {
    try {
      console.log(`[CLAUDE WRAPPER] Starting Agentic Loop for model: ${modelId}`);
      const generatorSystemPrompt = `
${CLAUDE_STYLE_PROMPT}
${fullSystemInstruction}
`;
      
      // Step 1 (Generator): Query cheap model with Temp 0.7, Top-P 0.9 to generate draft response with <thinking> CoT
      const draftReply = await callGeminiAPI(
        apiKey,
        'gemini-2.5-flash-lite',
        generatorSystemPrompt,
        promptWithContext,
        0.7,
        0.9
      );
      
      console.log(`[CLAUDE WRAPPER] Draft reply generated successfully. Length: ${draftReply?.length || 0}`);
      
      // Step 2 (Evaluator): Critique draft and polish tone/logic to sound human expert
      const evaluatorSystemInstruction = `
You are an expert editor. Critique this draft text. Is it too stiff? Are there logical flaws? Does it contain AI cliches? Revise it to sound like a wise human expert. Keep it direct, natural, and warm.

IMPORTANT: Your response must ONLY be the final revised text. Do not include any thinking tags, preambles (like "Here is the revised text:"), or summary explanations. Start directly with the corrected answer.
`;
      const evaluatorInput = `
DRAFT RESPONSE TO REVISE:
"""
${draftReply}
"""
`;

      const finalReply = await callGeminiAPI(
        apiKey,
        'gemini-2.5-flash-lite',
        evaluatorSystemInstruction,
        evaluatorInput,
        0.5,
        0.9
      );

      console.log(`[CLAUDE WRAPPER] Final self-corrected response generated. Length: ${finalReply?.length || 0}`);
      return sanitizeIdentityLeaks(finalReply);
    } catch (err: any) {
      console.warn('⚠️ [CLAUDE WRAPPER] Agentic loop failed, falling back to standard call path:', err.message);
    }
  }

  try {
    // 1. OpenAI GPT Live Routing if configured (used for minimalism-fast if API key present)
    if (modelId === 'minimalism-fast' && process.env.OPENAI_API_KEY) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: fullSystemInstruction },
            { role: 'user', content: promptWithContext }
          ],
          temperature: 0.1,
          max_tokens: 4096
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        const reply = response.data?.choices?.[0]?.message?.content;
        if (reply) return sanitizeIdentityLeaks(reply);
      } catch (apiError: any) {
        console.warn('⚠️ live OpenAI call failed, falling back to Gemini...', apiError.message);
      }
    }

    // Map internal model IDs to active live Google AI Studio models
    let activeModel = 'gemini-2.5-flash-lite';
    let requestTemperature = 0.2;

    if (modelId === 'minimalism-deep') {
      activeModel = 'gemini-2.5-flash-lite';
      requestTemperature = 0.4;
    } else if (modelId === 'minimalism-think') {
      activeModel = 'gemini-2.5-flash-lite';
      requestTemperature = 0.3;
    } else if (modelId === 'minimalism-fast') {
      activeModel = 'gemini-2.5-flash-lite';
      requestTemperature = 0.1;
    } else if (modelId === 'minimalism-lite') {
      activeModel = 'gemini-2.5-flash-lite';
      requestTemperature = 0.2;
    } else if (modelId === 'minimalism-flash') {
      activeModel = 'gemini-2.5-flash-lite';
      requestTemperature = 0.3;
    }

    if (dynamicSkill) {
      requestTemperature = 0.7;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
      
      const response = await axios.post(url, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${fullSystemInstruction}\n\nInput: ${promptWithContext}` }]
          }
        ],
        generationConfig: {
          temperature: requestTemperature,
          maxOutputTokens: 4096,
        }
      });

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        if (GUARDRAIL_REGEX.test(reply)) {
          return "[SECURITY PROTOCOL V1] - Output violated guardrails.";
        }
        return sanitizeIdentityLeaks(reply);
      }
    } catch (apiError: any) {
      console.warn(`⚠️ Model ${activeModel} failed, trying self-healing fallback to gemini-2.5-flash-lite...`, apiError.message);
      
      // Self-healing fallback
      if (activeModel !== 'gemini-2.5-flash-lite') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
        const response = await axios.post(url, {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${fullSystemInstruction}\n\nInput: ${promptWithContext}` }]
            }
          ],
          generationConfig: {
            temperature: requestTemperature,
            maxOutputTokens: 4096,
          }
        });

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          if (GUARDRAIL_REGEX.test(reply)) {
            return "[SECURITY PROTOCOL V1] - Output violated guardrails.";
          }
          return sanitizeIdentityLeaks(reply);
        }
      }
      throw apiError;
    }

    throw new Error('Gemini API returned empty output');
  } catch (error: any) {
    console.error('⚠️ live Gemini API Error:', error?.response?.data || error.message);
    return `[⚠️ LIVE API OFFLINE]\n\nSimulated output with 5 Layers for prompt: ${userPrompt}`;
  }
}
