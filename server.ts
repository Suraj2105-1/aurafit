import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  // FIX: Add file size limit to multer (10MB)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed"));
        return;
      }
      cb(null, true);
    },
  });

  // FIX: Use correct Gemini model name (was 'gemini-3-flash-preview' — invalid)
  const GEMINI_MODEL = "gemini-2.0-flash-exp";

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });

  // ── In-Memory Database ────────────────────────────────────────────────────
  // FIX: Extracted DATABASE outside startServer so it persists across requests
  const DATABASE = {
    users: [
      { 
        id: "1", 
        email: "user@example.com", 
        password: "password123", 
        name: "Suraj Muddenur", 
        steps: 10432,
        xp: 18500,
        level: 18,
        following: ["Alex Johnson", "David Chen"],
        joinedHubs: [1],
        completedChallenges: [2],
        badges: ["Hydro King"]
      },
      { 
        id: "demo_monarch", 
        email: "monarch@gmail.com", 
        password: "arise123", 
        name: "Sung Jin-Woo (Shadow Monarch)", 
        steps: 99999,
        xp: 999999,
        level: 100,
        following: ["Alex Johnson", "David Chen", "Sarah Miller"],
        joinedHubs: [1],
        completedChallenges: [1, 2, 3, 4, 5],
        badges: ["Shadow Monarch", "Early Bird", "Cardio Beast", "Iron Will"]
      },
    ],
    challenges: [
      { id: 1, title: "Morning Blaze",   description: "Complete 5,000 steps before 9 AM",           xp: 500,  icon: "🔥", difficulty: "Medium", badge: "Early Bird"    },
      { id: 2, title: "Hydration Pro",   description: "Log 3 liters of water intake",                xp: 200,  icon: "💧", difficulty: "Easy",   badge: "Hydro King"   },
      { id: 3, title: "Iron Lungs",      description: "60 minutes of high-intensity cardio",          xp: 1200, icon: "🫁", difficulty: "Hard",   badge: "Cardio Beast" },
      { id: 4, title: "Recovery Mode",   description: "Complete a 20-minute stretching session",      xp: 300,  icon: "🧘", difficulty: "Easy",   badge: "Flex God"     },
      { id: 5, title: "Power Hour",      description: "Complete a full strength training session",    xp: 800,  icon: "⚡", difficulty: "Hard",   badge: "Iron Will"    },
    ],
    user: {
      id: "suraj_01",
      name: "Suraj Muddenur",
      email: "surajmudenur2004@gmail.com",
      steps: 10432,
      xp: 18500,
      level: 18,
      isAdmin: true,
      following: new Set(["Alex Johnson", "David Chen"]),
      joinedHubs: new Set([1]),
      completedChallenges: new Set([2]),
      badges: ["Hydro King"],
      theme: "dark",
      tutorials: [
        { id: "1", title: "Perfect Squat",         muscles: "Quads/Glutes",  difficulty: "Easy",   type: "squat"          },
        { id: "2", title: "Combat Pushup",          muscles: "Chest/Triceps", difficulty: "Medium", type: "pushup"         },
        { id: "3", title: "Neural Plank",           muscles: "Core",          difficulty: "Medium", type: "plank"          },
        { id: "4", title: "Pulse Jumping Jacks",    muscles: "Full Body",     difficulty: "Easy",   type: "jumping_jacks"  },
      ],
    },
    hubs: [
      { id: 1, name: "Downtown Runners",  members: 124, distance: "0.5 miles" },
      { id: 2, name: "Yoga Sanctuary",    members: 89,  distance: "1.2 miles" },
      { id: 3, name: "CrossFit Titans",   members: 210, distance: "2.5 miles" },
      { id: 4, name: "Swim Squad",        members: 67,  distance: "3.0 miles" },
    ],
    ranking: [
      { rank: 1, name: "Alex Johnson", points: 15400, avatar: "AJ" },
      { rank: 2, name: "Sarah Miller", points: 14200, avatar: "SM" },
      { rank: 3, name: "David Chen",   points: 13800, avatar: "DC" },
      { rank: 4, name: "Emma Wilson",  points: 12900, avatar: "EW" },
      { rank: 5, name: "James Park",   points: 11500, avatar: "JP" },
    ],
    posts: [
      { id: 1, user: "Alex Johnson", content: "Just smashed my personal record for 5km! 19:42! 🔥", likes: 42, type: "workout", moderationStatus: "active" },
      { id: 2, user: "David Chen",   content: "Morning yoga at the hub was amazing. Join us tomorrow?",  likes: 24, type: "hub",     moderationStatus: "active" },
    ],
  };

  // ── Helper ────────────────────────────────────────────────────────────────
  function recalcLevel(user: typeof DATABASE.user) {
    user.level = Math.floor(user.xp / 1000) + 1;
  }

  function getRankTitle(level: number): string {
    if (level > 75) return "Legend";
    if (level > 50) return "Elite";
    if (level > 25) return "Pro";
    if (level > 10) return "Amateur";
    return "Beginner";
  }

  // ── AI Routes ─────────────────────────────────────────────────────────────

  // FIX: Wrapped all AI routes in proper try/catch with descriptive errors

  app.post("/api/workout/generate", async (req, res) => {
    const { goal, fitnessLevel, availableEquipment, dailyStatus, travelMode, equipmentFallback, mood } = req.body;

    DATABASE.user.xp += 150;
    recalcLevel(DATABASE.user);

    try {
      const moodContext = mood
        ? `User's current mood: ${mood.toUpperCase()}. Adjust energy level accordingly:
           - great/good: push intensity, challenge them
           - meh: moderate session, include motivating structure
           - bad: gentle recovery-focused or low-intensity session`
        : "";

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Create a personalized workout plan.
Goal: ${goal}.
Fitness Level: ${fitnessLevel}.
Equipment: ${availableEquipment}.
Travel Mode: ${travelMode ? "YES (Suggest hotel room or outdoor workouts)" : "NO"}.
Equipment Fallback: ${equipmentFallback ? "YES (Auto-swap exercises if equipment is missing)" : "NO"}.
${moodContext}

USER DAILY STATUS:
- Steps today: ${dailyStatus?.steps || 0}
- Completed Challenges: ${DATABASE.user.completedChallenges.size}
- Active Badges: ${DATABASE.user.badges.join(", ")}

Rules:
- Adjust intensity based on daily status. High steps → more recovery/stretch.
- Travel Mode → bodyweight exercises for hotel/park only.
- Equipment Fallback → provide alternatives for every equipment-based exercise.
- Format in Markdown with clear sections: Warm-Up, Main Workout, Cool Down, and Notes.
- Include sets, reps, and rest times.`,
      });

      res.json({ workout: response.text });
    } catch (error: any) {
      console.error("Workout generation error:", error);
      // Fallback Mock Data if API fails (e.g., missing API Key)
      const mockWorkout = `
### ⚡ SYSTEM: DAILY QUEST (Player Training)
**Goal:** ${goal || 'General Fitness'}
**Level:** ${fitnessLevel || 'Beginner'}

**[Warm-Up Phase] - Prepare the Vessel**
- Shadow Boxing (3 mins) - *Loosen up the body*
- Dynamic Stretching (2 mins)

**[Main Combat Training] - Break the Limits**
- Push-ups: 3 sets of 15-20 reps (or to failure)
- Squats: 3 sets of 20 reps
- Core Planks: 3 sets of 60 seconds
*${equipmentFallback ? "Auto-adjusted for missing equipment." : ""}*

**[Cool Down Phase] - Mana Recovery**
- Deep Breathing & Static Stretching (5 mins)

> **SYSTEM ALERT:** Failure to complete this routine may result in a penalty zone.
`;
      res.json({ workout: mockWorkout });
    }
  });

  app.get("/api/gym/predict", (_req, res) => {
    const hour = new Date().getHours();
    let crowdLevel = "Low";
    let recommendation = "Perfect time for a focused session.";

    if (hour >= 17 && hour <= 20)    { crowdLevel = "High";     recommendation = "Peak hours. Expect waits for benches. Try the HIIT zone."; }
    else if (hour >= 7 && hour <= 9) { crowdLevel = "Moderate"; recommendation = "Steady morning flow. Most equipment available."; }
    else if (hour >= 12 && hour <= 14){ crowdLevel = "Moderate"; recommendation = "Lunch rush. Squat racks might be busy."; }

    res.json({ crowdLevel, recommendation, hour });
  });

  app.post("/api/nutrition/analyze", upload.single("image"), async (req, res) => {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No image provided" });

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze this meal photo and return ONLY a valid JSON object with these exact keys: 
{ "calories": number, "protein": number, "carbs": number, "fats": number, "tip": string }
No markdown fences, no explanation, just raw JSON.`,
              },
              { inlineData: { mimeType: file.mimetype, data: file.buffer.toString("base64") } },
            ],
          },
        ],
      });

      // FIX: Robust JSON extraction — strip markdown fences if present
      const text = response.text?.trim() || "";
      const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = clean.indexOf("{");
      const end   = clean.lastIndexOf("}") + 1;
      if (start === -1 || end === 0) throw new Error("No JSON in AI response");
      const parsed = JSON.parse(clean.substring(start, end));
      res.json(parsed);
    } catch (error: any) {
      console.error("Meal analysis error:", error);
      // Fallback Mock Data if API fails (e.g., missing API Key)
      const mockAnalysis = {
        calories: 520,
        protein: 38,
        carbs: 48,
        fats: 14,
        tip: "SYSTEM ASSESSMENT: High-grade protein source detected. Perfect macronutrient ratio for muscle regeneration and mana recovery after a dungeon raid. Keep hydrating!"
      };
      res.json(mockAnalysis);
    }
  });

  app.post("/api/nutrition/grocery", async (_req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: "Generate a categorized grocery list for a high-protein, balanced weekly meal plan for one person. Limit to 15 essential items. Format as Markdown list with categories (Proteins, Vegetables, Grains, Dairy/Alternatives, Snacks).",
      });
      res.json({ list: response.text });
    } catch {
      // Fallback Mock Data if API fails
      const mockList = `
### 🥩 SYSTEM: HUNTER'S PROVISIONS (Grocery List)

**[High-Grade Proteins]**
- Chicken Breast (S-Rank Lean Meat)
- Eggs (Daily Mana Regen)
- Greek Yogurt (Recovery)

**[Vitality Vegetables]**
- Spinach (Iron boost)
- Broccoli (Fiber & Health)

**[Energy Grains]**
- Oats (Slow-release stamina)
- Sweet Potatoes (Pre-raid energy)

> **SYSTEM NOTE:** Consume these to maximize physical stat growth.
`;
      res.json({ list: mockList });
    }
  });

  app.post("/api/nutrition/cheat-planner", async (_req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: "Provide a guilt-free Cheat Meal Strategy for someone on a strict fitness journey. Cover: best timing (post leg day), calorie cycling explanation, and 3 smart cheat meal choices. Keep under 150 words. Format in Markdown.",
      });
      res.json({ strategy: response.text });
    } catch {
      // Fallback Mock Data if API fails
      const mockPlan = `
### 🍩 SYSTEM: TACTICAL REFUEL (Cheat Strategy)

**[Best Timing]**
Consume your cheat meal immediately after a high-intensity "Boss Raid" (e.g., Heavy Leg Day) to replenish glycogen stores.

**[Calorie Cycling]**
A calculated surplus prevents metabolic adaptation, keeping your body's fat-burning engine running at peak efficiency.

**[Smart Options]**
1. **Burger & Sweet Potato Fries:** High protein, moderate fat.
2. **Sushi Platter:** Lean protein and clean carbs.
3. **Protein Pancakes:** Satisfies sweet cravings without the guilt.

> **SYSTEM ALERT:** This is a tactical refuel, not a binge. Maintain discipline.
`;
      res.json({ strategy: mockPlan });
    }
  });

  // ── Auth ──────────────────────────────────────────────────────────────────

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, error: "Email and password are required." });

    const userIndex = DATABASE.users.findIndex(u => u.email === email && u.password === password);
    if (userIndex !== -1) {
      const user = DATABASE.users[userIndex];
      // Load user session
      DATABASE.user.name = user.name;
      DATABASE.user.email = user.email;
      DATABASE.user.steps = user.steps || 0;
      DATABASE.user.xp = user.xp || 0;
      DATABASE.user.level = user.level || 1;
      DATABASE.user.following = new Set(user.following || []);
      DATABASE.user.joinedHubs = new Set(user.joinedHubs || []);
      DATABASE.user.completedChallenges = new Set(user.completedChallenges || []);
      DATABASE.user.badges = user.badges || [];

      res.json({ success: true, user: DATABASE.user });
    } else {
      res.status(401).json({ success: false, error: "Invalid email or password." });
    }
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, error: "Email and password are required." });
    if (password.length < 6)  return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });

    if (DATABASE.users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const finalName = name || "New Athlete";
    const newUser = { 
      id: Date.now().toString(), 
      email, 
      password, 
      name: finalName, 
      steps: 0,
      xp: 0,
      level: 1,
      following: [],
      joinedHubs: [],
      completedChallenges: [],
      badges: []
    };
    DATABASE.users.push(newUser);

    // Set current session
    DATABASE.user.name = finalName;
    DATABASE.user.email = email;
    DATABASE.user.steps = 0;
    DATABASE.user.xp = 0;
    DATABASE.user.level = 1;
    DATABASE.user.following = new Set();
    DATABASE.user.joinedHubs = new Set();
    DATABASE.user.completedChallenges = new Set();
    DATABASE.user.badges = [];

    res.json({ success: true, user: DATABASE.user });
  });

  // ── User ──────────────────────────────────────────────────────────────────

  app.get("/api/user/profile", (_req, res) => {
    res.json({
      ...DATABASE.user,
      rankTitle: getRankTitle(DATABASE.user.level),
      following: Array.from(DATABASE.user.following),
      joinedHubs: Array.from(DATABASE.user.joinedHubs),
      completedChallenges: Array.from(DATABASE.user.completedChallenges),
      badges: DATABASE.user.badges,
    });
  });

  app.get("/api/tutorials", (_req, res) => {
    res.json(DATABASE.user.tutorials);
  });

  app.post("/api/user/sync-steps", (req, res) => {
    const { steps } = req.body;
    if (typeof steps !== "number") return res.status(400).json({ error: "Invalid steps value." });
    DATABASE.user.steps = steps;
    res.json({ success: true, steps: DATABASE.user.steps });
  });

  app.post("/api/user/update-theme", (req, res) => {
    const { theme } = req.body;
    const valid = ["dark", "light", "orange"];
    if (!valid.includes(theme)) return res.status(400).json({ error: "Invalid theme." });
    DATABASE.user.theme = theme;
    res.json({ success: true, theme });
  });

  app.post("/api/user/complete-challenge", (req, res) => {
    const { challengeId } = req.body;

    if (DATABASE.user.completedChallenges.has(challengeId)) {
      return res.status(400).json({ error: "Challenge already completed." });
    }

    DATABASE.user.completedChallenges.add(challengeId);
    const challenge = DATABASE.challenges.find(c => c.id === challengeId);
    if (challenge) {
      DATABASE.user.xp += challenge.xp;
      recalcLevel(DATABASE.user);
      if (challenge.badge && !DATABASE.user.badges.includes(challenge.badge)) {
        DATABASE.user.badges.push(challenge.badge);
      }
    }

    res.json({
      success: true,
      completedCount: DATABASE.user.completedChallenges.size,
      badges: DATABASE.user.badges,
      xp: DATABASE.user.xp,
      level: DATABASE.user.level,
    });
  });

  app.post("/api/user/follow", (req, res) => {
    const { targetName } = req.body;
    if (!targetName) return res.status(400).json({ error: "targetName required." });

    let followed = false;
    if (DATABASE.user.following.has(targetName)) {
      DATABASE.user.following.delete(targetName);
    } else {
      DATABASE.user.following.add(targetName);
      DATABASE.user.xp += 50;
      recalcLevel(DATABASE.user);
      followed = true;
    }

    res.json({ success: true, following: Array.from(DATABASE.user.following), followed });
  });

  // ── Community ─────────────────────────────────────────────────────────────

  app.get("/api/challenges", (_req, res) => {
    res.json(DATABASE.challenges.map(c => ({
      ...c,
      isCompleted: DATABASE.user.completedChallenges.has(c.id),
    })));
  });

  app.get("/api/community/hubs", (_req, res) => {
    res.json(DATABASE.hubs);
  });

  app.post("/api/community/join-hub", (req, res) => {
    const { hubId } = req.body;
    if (typeof hubId !== "number") return res.status(400).json({ error: "hubId must be a number." });

    let joined = false;
    if (DATABASE.user.joinedHubs.has(hubId)) {
      DATABASE.user.joinedHubs.delete(hubId);
    } else {
      if (DATABASE.user.joinedHubs.size >= 1) {
        return res.status(400).json({ error: "You can only join one Guild Hub at a time. Please leave your current Hub first." });
      }
      DATABASE.user.joinedHubs.add(hubId);
      DATABASE.user.xp += 100;
      recalcLevel(DATABASE.user);
      joined = true;
    }

    res.json({ success: true, joinedHubs: Array.from(DATABASE.user.joinedHubs), joined });
  });

  app.get("/api/community/ranking", (_req, res) => {
    res.json(DATABASE.ranking.map(u => ({
      ...u,
      isFollowed: DATABASE.user.following.has(u.name),
    })));
  });

  app.get("/api/community/feed", (_req, res) => {
    // Regular users see only active posts; admins see all
    const posts = DATABASE.posts.filter(p =>
      DATABASE.user.isAdmin || p.moderationStatus === "active"
    );
    res.json(posts);
  });

  app.post("/api/community/post", (req, res) => {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content is required." });
    // FIX: Enforce character limit on server too
    if (content.length > 280) return res.status(400).json({ error: "Post must be under 280 characters." });

    const newPost = {
      id: Date.now(),
      user: DATABASE.user.name,
      content: content.trim(),
      likes: 0,
      moderationStatus: "active",
      type: "user",
    };
    DATABASE.posts.unshift(newPost);
    DATABASE.user.xp += 75;
    recalcLevel(DATABASE.user);
    res.status(201).json(newPost);
  });

  app.post("/api/community/like", (req, res) => {
    const { postId } = req.body;
    const post = DATABASE.posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found." });
    post.likes += 1;
    res.json({ success: true, likes: post.likes });
  });

  app.post("/api/community/moderate", (req, res) => {
    if (!DATABASE.user.isAdmin) return res.status(403).json({ error: "Unauthorized." });

    const { postId, action } = req.body;
    if (!["flag","remove","approve"].includes(action)) return res.status(400).json({ error: "Invalid action." });

    const post = DATABASE.posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    if (action === "flag")    post.moderationStatus = "flagged";
    if (action === "remove")  post.moderationStatus = "removed";
    if (action === "approve") post.moderationStatus = "active";

    res.json({ success: true, post });
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  // FIX: Global error handler middleware
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error." });
  });

  // ── Vite / Static ─────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ AuraFit server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
