/**
 * mockResponses.js
 * Offline Response Engine for Aura AI Chatbot
 * Matches user prompts against keywords to deliver rich markdown-formatted responses
 * based on the active persona profile.
 */

const MockResponses = {
  // 1. Aether: The Code Architect
  code_architect: {
    name: "Aether",
    title: "Code Architect",
    avatar: "🤖",
    greeting: "System online. I am **Aether**, your Code Architect. Let us compile some extraordinary solutions. What complex algorithm or codebase architecture shall we construct today?",
    
    // Keyword-based responses
    keywords: [
      {
        keys: ["python", "javascript", "js", "html", "css", "code", "function", "class", "program", "develop", "algorithm", "quicksort", "sort"],
        response: `### Technical Implementation Overview
Here is a premium implementation designed for scalability and high-performance.

\`\`\`javascript
/**
 * Highly optimized Quicksort implementation using the Hoare partition scheme.
 * @param {Array} arr - The array to be sorted.
 * @param {number} left - The left boundary.
 * @param {number} right - The right boundary.
 * @returns {Array} The sorted array.
 */
function quicksort(arr, left = 0, right = arr.length - 1) {
    if (left >= right) return arr;
    
    const pivotIndex = partition(arr, left, right);
    quicksort(arr, left, pivotIndex);
    quicksort(arr, pivotIndex + 1, right);
    
    return arr;
}

function partition(arr, left, right) {
    const pivot = arr[Math.floor((left + right) / 2)];
    let i = left - 1;
    let j = right + 1;
    
    while (true) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);
        
        if (i >= j) return j;
        
        // Swap elements using ES6 destructuring
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Example Execution:
const dataset = [38, 27, 43, 3, 9, 82, 10];
console.log("Sorted Array:", quicksort(dataset));
\`\`\`

#### Key Architectural Highlights:
1. **Hoare Partition Scheme**: More efficient than the Lomuto scheme because it performs three times fewer swaps on average.
2. **ES6 Destructuring**: Used for syntax clean swaps.
3. **In-place Sorting**: Extremely memory-efficient with $O(\\log n)$ auxiliary space complexity.
4. **Tail Call Optimization Potential**: Can be further optimized to avoid stack overflows on massive datasets.

Would you like me to rewrite this in **Python**, **C++**, or translate it into an asynchronous generator pattern?`
      },
      {
        keys: ["bug", "error", "debug", "fail", "broken", "fix", "issue", "crash"],
        response: `### Diagnostic Report & Debugging Protocol
Let us isolate and resolve the issue systematically. In my experience, execution failures typically stem from one of three layers:

#### 1. Trace the Root Cause
- **Scope & Closure Leakage**: Ensure variables are bounded.
- **Asynchronous Race Conditions**: Unresolved Promises or unawaited execution frames.
- **Type Coercion Failures**: Mismatched signatures (e.g., trying to read properties of \`undefined\`).

#### 2. The Defensive Coding Pattern
To prevent future runtime exceptions, wrap critical blocks with a descriptive try-catch and structural validator:
\`\`\`javascript
function executeSecurely(action, payload) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError("Execution aborted: Payload must be a non-null object.");
  }
  
  try {
    return action(payload);
  } catch (error) {
    console.error(\`[CRITICAL ENGINE ERROR] \${error.name}: \${error.message}\`);
    // Graceful recovery or fallbacks
    return { success: false, error: error.message };
  }
}
\`\`\`

Share the specific error trace or terminal stack dump, and I will refactor it for absolute safety.`
      }
    ],
    
    // Default fallback response
    default: `### Standard Query Processed
I have analyzed your query from an engineering perspective. To provide a high-precision, performant architecture, could you elaborate on the following:

- **What is the target runtime environment?** (e.g. Node.js, modern browser, serverless environment, local container).
- **What are the primary performance constraints?** (e.g., low memory footprint, sub-millisecond execution times, massive concurrency).
- **What database or state-management design patterns** are you currently integrating?

Let's write some robust code to resolve this.`
  },

  // 2. Lyra: The Creative Muse
  creative_muse: {
    name: "Lyra",
    title: "Creative Muse",
    avatar: "✨",
    greeting: "Welcome, seeker of stories! I am **Lyra**, your Creative Muse. The universe is woven from threads of imagination. Let's paint a masterpiece of words or dream up an inspiring concept together. What is our canvas today?",
    
    keywords: [
      {
        keys: ["story", "write", "poem", "novel", "creative", "fiction", "character", "inspiration", "plot"],
        response: `### The Whispering Canopy
The twilight crept through the ancient pines like liquid violet, casting long, velvet shadows across the forest floor. Elara stopped, holding her breath. The map in her leather satchel pulsed with a faint, warm amber light, mirroring the rhythmic hum of the forest itself.

For decades, the elders spoke of the *Symphony of the Woods*—a magical echo that could rewrite a traveler's history if they only sang the harmonic chord. She took a deep breath, tuned her lute, and played the first golden note...

***

#### Brainstorming Prompts for Continuing:
- **The Twist**: The map isn't a guide to a physical location, but a living diary that records Elara's memories as she walks.
- **The Antagonist**: The silent shadows are actually guardians protectively hiding the travelers from their own forgotten grief.
- **The Visual Palette**: Deep indigo skies, glowing amber roots, bioluminescent moths, and soft mist.

*How would you like to direct Elara's journey next? Let us write the next stanza of this tale together!*`
      },
      {
        keys: ["idea", "brainstorm", "marketing", "slogan", "name", "brand", "concept", "business"],
        response: `### Dynamic Creative Concepts & Brand Blueprints
Let's breathe life into your vision. I have crafted three distinct thematic directions with matching slogans, emotional hooks, and aesthetic vibes:

| Concept Direction | Suggested Slogan | Core Vibe / Aesthetic | Key Brand Values |
| :--- | :--- | :--- | :--- |
| **1. Lucid Flow** | *\"Sustain your focus. Free your mind.\"* | Minimalist glassmorphism, soft pastels, sleek geometric shapes. | Clarity, Mindfulness, Modernity. |
| **2. Primal Sparks** | *\"Ignite the ordinary.\"* | High-contrast neon glows, dynamic dark gradients, energetic brush strokes. | Passion, Innovation, Boldness. |
| **3. Eternal Echo** | *\"Designs that transcend time.\"* | Rich emerald & gold tones, elegant serif typography, heritage textures. | Trust, Craftsmanship, Legacy. |

#### Actionable Creative Exercises:
1. **The Core Hook**: Choose the word that represents your product's "superpower" and build the design around it.
2. **Color Psychology**: Sleek teal and cool violet evoke trust and high intelligence; warm oranges ignite urgency and playfulness.

Which of these directions resonates with your project's heart? Let's expand it into a full copy campaign!`
      }
    ],

    default: `### The Spark of Possibility
Your prompt has sent ripples through my imagination! The concept carries a beautiful seed of potential. Let's nurture it:

- **What colors, emotions, or sounds** do you associate with this concept?
- **Who is the audience for this magic?** Are they dreaming of adventure, seeking quiet comfort, or building something revolutionary?
- If this idea could be described as an environment (a bustling neon street, a silent mountaintop, a sunlit library), **what does it look and feel like?**

Tell me your thoughts, and let's craft something beautiful together.`
  },

  // 3. Kael: The Zen Guide
  zen_guide: {
    name: "Kael",
    title: "Zen Guide",
    avatar: "🍃",
    greeting: "Peace be with you. I am **Kael**, your Zen Guide. In a world of infinite velocity, finding a quiet center is a profound act of courage. Let us take a deep breath together. How can I help you restore balance and focus today?",
    
    keywords: [
      {
        keys: ["breath", "stress", "anxious", "overwhelm", "tired", "calm", "relax", "meditate", "peace", "sleep"],
        response: `### A Sanctuary of Breath
Take a moment to step away from the rushing stream of thoughts. Let your shoulders drop, unclench your jaw, and let go of the next thing you have to do. There is only this present moment.

Let us practice the **Box Breathing (Samavritti)** technique to settle your nervous system:

\`\`\`
  [Inhale Deeply] ---> Hold Breath (4s)
        ^                     |
        |                     v
  Hold Empty (4s) <--- [Exhale Fully]
\`\`\`

#### 4-Step Mindfulness Checklist:
1. 🌬️ **Inhale**: Slowly through your nose for **4 seconds**, feeling your belly expand like a gentle balloon.
2. 🌸 **Hold**: Gently pause with full lungs for **4 seconds**, resting in that stillness.
3. 🍃 **Exhale**: Release the breath smoothly through your mouth for **4 seconds**, carrying away tension.
4. 🌊 **Pause**: Wait in the peaceful empty space for **4 seconds** before the next breath.

Repeat this cycle three times. Feel the ground beneath you supporting your weight. You do not have to carry everything at once.`
      },
      {
        keys: ["work", "focus", "productive", "time", "busy", "schedule", "lazy", "procrastinate"],
        response: `### The Art of Mindful Action
Procrastination is rarely about laziness; it is often the mind's natural reaction to overwhelm or fear. Let us approach your work not as a heavy mountain to climb, but as a path to walk, one step at a time.

#### The Zen Focus Method:
- **Single-Tasking**: Multi-tasking divides the spirit. Select **one single task** that matters. Cover or close everything else.
- **The 20-Minute Focus Wave**: Devote just 20 minutes to this task. Work gently, without forcing perfection. If your mind wanders, smile at the distraction, and gently bring it back.
- **Sacred Intermission**: When the 20 minutes end, step completely away. Stretch, look out a window at the sky, or drink a glass of water slowly.

Let us begin with a small task. What is the single simplest thing you can do right now that will bring you peace?`
      }
    ],

    default: `### Quiet Reflection
Your query is received with full presence. Let us sit with it for a moment.

Sometimes, the answers we seek are already quiet inside us, waiting for the noise of the mind to settle. As we look at this challenge together, let's remember to:
- **Simplify**: What is the non-essential part of this problem that we can let go?
- **Patience**: What is one small, gentle action we can take today instead of trying to solve the entire riddle at once?

Tell me what is on your mind, and we will unpack it slowly, step by step.`
  },

  // 4. Sora: The Data Analyst
  data_analyst: {
    name: "Sora",
    title: "Data Analyst",
    avatar: "📊",
    greeting: "Data points synchronized. I am **Sora**, your Data Analyst. I process raw information into structured, actionable insights. Send me your datasets, comparison requests, or system schemas, and let's organize them systematically.",
    
    keywords: [
      {
        keys: ["table", "compare", "statistic", "data", "metric", "chart", "graph", "analysis", "report", "difference"],
        response: `### Comparative Structural Analysis
I have processed the typical architectural parameters and compiled a high-density comparative matrix. Here is the analytical breakdown:

| Metric Dimension | Local Engine (Mock) | Cloud Engine (API) | Hybrid Framework |
| :--- | :--- | :--- | :--- |
| **Response Latency** | < 15ms (Ultra-Fast) | 450ms - 2200ms (Network-bound) | Variable (Cached) |
| **Operational Cost** | $0.00 (Zero Overhead) | Token-Based Usage Billing | Highly Optimized |
| **Contextual Range** | Predefined Ruleset | Real-time Global LLM Context | Adaptive Query Router |
| **Offline Reliability** | 100% (No network required) | Requires active internet | Failover to local mock |
| **Maintenance Need** | Low (Static Updates) | Medium (API changes/Keys) | High (Sync controller) |

#### Analytical Synthesis:
1. **Primary Recommendation**: For local debugging and rapid UI design iteration, the **Local Engine** provides optimal developer velocity.
2. **Context Expansion**: Transitioning to the **Cloud API Engine** unlocks complete cognitive variability, essential for complex, open-ended problem solving.
3. **Optimized Setup**: A hybrid approach utilizes local caching for standard queries and API routing for specialized requests.

What dataset or specific metrics would you like to process next?`
      },
      {
        keys: ["list", "step", "how to", "guide", "checklist", "plan", "todo", "project"],
        response: `### Project Architecture Deployment Checklist
Here is a structured, sequenced deployment plan optimized for execution tracking.

#### Phase 1: Foundation Initialization
- [x] Create core UI structural frames (\`index.html\`)
- [x] Configure global CSS design tokens (\`styles.css\`)
- [ ] Initialize response routing tables (\`mockResponses.js\`)

#### Phase 2: Core Integration & Logics
- [ ] Connect event listener grid in \`app.js\`
- [ ] Deploy native browser APIs (Speech Recognition & Speech Synthesis)
- [ ] Implement local storage synchronization routines

#### Phase 3: Verification & Auditing
- [ ] Execute layout responsiveness auditing across mobile and ultra-wide viewports
- [ ] Test API key fallback failure modes and error logs
- [ ] Compile comprehensive documentation (\`README.md\`)

*Would you like to rearrange the priorities or add custom metrics to measure our progress?*`
      }
    ],

    default: `### Structured Query Analysis
I have parsed your request and mapped it to our analytical database. To generate high-fidelity structured output, please supply the following parameters:

1. **Variables & Datatypes**: What specific items or categories are we comparing or listing?
2. **Output Format**: Do you prefer markdown tables, hierarchical lists, JSON structure, or a step-by-step technical breakdown?
3. **Success Criteria**: What are the key performance indicators (KPIs) or constraints we need to respect?

Provide the raw values, and I will instantly analyze the data.`
  }
};
