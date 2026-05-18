import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  Users, 
  Trophy, 
  User, 
  Dumbbell, 
  MapPin, 
  Plus,
  Flame,
  Heart,
  Camera,
  ShoppingCart,
  Zap,
  Globe,
  UtensilsCrossed,
  Moon,
  Sun,
  Bell,
  Target,
  BarChart2,
  CheckCircle,
  Clock,
  Droplets,
  Wind,
  ChevronUp,
  ChevronDown,
  X,
  LogOut,
  Star,
  Award,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

// ─── Types ────────────────────────────────────────────────────────────────────
type View = 'dashboard' | 'workouts' | 'community' | 'ranking' | 'profile' | 'nutrition' | 'sleep' | 'water';
type Mood = 'great' | 'good' | 'meh' | 'bad' | null;
type Theme = 'dark' | 'light' | 'orange' | 'monarch';
type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STEPS_DATA = [
  { day: 'Mon', steps: 8400 },
  { day: 'Tue', steps: 12500 },
  { day: 'Wed', steps: 9200 },
  { day: 'Thu', steps: 15600 },
  { day: 'Fri', steps: 11000 },
  { day: 'Sat', steps: 7800 },
  { day: 'Sun', steps: 10400 },
];

const MOCK_SLEEP_DATA = [
  { day: 'Mon', hours: 7.2 },
  { day: 'Tue', hours: 6.5 },
  { day: 'Wed', hours: 8.1 },
  { day: 'Thu', hours: 5.9 },
  { day: 'Fri', hours: 7.8 },
  { day: 'Sat', hours: 9.0 },
  { day: 'Sun', hours: 7.4 },
];

const MOOD_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  great:  { icon: <Star size={20}/>,   label: 'Great',   color: 'text-emerald-400 bg-emerald-400/10' },
  good:   { icon: <Smile size={20}/>,  label: 'Good',    color: 'text-cyan-400 bg-cyan-400/10' },
  meh:    { icon: <Meh size={20}/>,    label: 'Meh',     color: 'text-amber-400 bg-amber-400/10' },
  bad:    { icon: <Frown size={20}/>,  label: 'Bad',     color: 'text-rose-400 bg-rose-400/10' },
};

// ─── Solo Leveling Helpers ──────────────────────────────────────────────────
function getHunterRank(level: number): string {
  if (level >= 40) return "Shadow Monarch ðŸ‘‘";
  if (level >= 30) return "National Level Hunter ⚡";
  if (level >= 25) return "S-Rank Hunter 🔥";
  if (level >= 20) return "A-Rank Hunter 💀";
  if (level >= 15) return "B-Rank Hunter ⚔️";
  if (level >= 10) return "C-Rank Hunter ðŸ›¡ï¸";
  if (level >= 5)  return "D-Rank Hunter ðŸŽ¯";
  return "E-Rank Hunter 💤";
}

interface ShadowSoldier {
  name: string;
  emoji: string;
  grade: string;
  quest: string;
  desc: string;
  boost: string;
  challengeId: number;
  statsBoost: { strength?: number; agility?: number; vitality?: number; intelligence?: number; perception?: number };
  requiredAvg: number;
}

const SHADOW_SOLDIERS_CONFIG: ShadowSoldier[] = [
  {
    name: 'Tank',
    emoji: 'bear',
    grade: 'Elite Infantry',
    quest: "Reach an average overall stat of 20.0 across all status categories",
    desc: 'An ice bear leader resurrected into a shadow soldier of immense strength.',
    boost: 'Vitality +5, Strength +3',
    challengeId: 1,
    statsBoost: { vitality: 5, strength: 3 },
    requiredAvg: 20.0
  },
  {
    name: 'Iron',
    emoji: 'shield',
    grade: 'Elite Infantry',
    quest: "Reach an average overall stat of 30.0 across all status categories",
    desc: 'A massive shield-wielding knight who taunts enemies and crushes armor.',
    boost: 'Vitality +10, Strength +5',
    challengeId: 5,
    statsBoost: { vitality: 10, strength: 5 },
    requiredAvg: 30.0
  },
  {
    name: 'Tusk',
    emoji: 'shaman',
    grade: 'Elite Shaman',
    quest: "Reach an average overall stat of 50.0 across all status categories",
    desc: 'The High Orc Shaman who uses gravity and fire magic to decimate dungeon fields.',
    boost: 'Intelligence +8, Perception +6',
    challengeId: 4,
    statsBoost: { intelligence: 8, perception: 6 },
    requiredAvg: 50.0
  },
  {
    name: 'Igris',
    emoji: 'knight',
    grade: 'Knight Commander',
    quest: "Reach an average overall stat of 60.0 across all status categories",
    desc: 'The loyal, blood-red knight who rules the battlefield with pure swordsmanship.',
    boost: 'Strength +10, Agility +5',
    challengeId: 3,
    statsBoost: { strength: 10, agility: 5 },
    requiredAvg: 60.0
  },
  {
    name: 'Beru',
    emoji: 'ant',
    grade: 'General',
    quest: "Reach an average overall stat of 70.0 across all status categories",
    desc: 'The Ant King who rules with terrifying speed, healing magic, and sharp claws.',
    boost: 'All Stats +8 (Shadow Monarch Aura)',
    challengeId: 2,
    statsBoost: { strength: 8, agility: 8, vitality: 8, intelligence: 8, perception: 8 },
    requiredAvg: 70.0
  },
  {
    name: 'Bellion',
    emoji: 'star',
    grade: 'Grand Marshal',
    quest: "Reach an average overall stat of 80.0 across all status categories",
    desc: 'The former Grand Marshal of the Shadow Army, born from the fruit of the World Tree.',
    boost: 'All Stats +15 (Grand Marshal Presence Boost)',
    challengeId: 6,
    statsBoost: { strength: 15, agility: 15, vitality: 15, intelligence: 15, perception: 15 },
    requiredAvg: 80.0
  }
];

// ─── Utility: API fetch with error handling ────────────────────────────────
async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Toast System ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded border shadow-xl text-sm font-bold pointer-events-auto cursor-pointer
              ${t.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                t.type === 'error'   ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' :
                                       'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'}`}
            onClick={() => remove(t.id)}
          >
            {t.type === 'success' ? <CheckCircle size={16}/> : t.type === 'error' ? <AlertCircle size={16}/> : <Bell size={16}/>}
            <span className="flex-1">{t.message}</span>
            <X size={14} className="opacity-50"/>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Nav Button ───────────────────────────────────────────────────────────────
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded flex items-center gap-2 transition-all duration-200 ${
        active ? 'bg-[var(--acc-primary)] text-white font-black shadow-lg' : 'text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/5'
      }`}
    >
      {icon}
      {active && <span className="text-[10px] uppercase tracking-tighter font-black">{label}</span>}
    </button>
  );
}

// ─── Exercise Animation ───────────────────────────────────────────────────────
function ExerciseAnimation({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    squat: (
      <div className="relative w-full h-24 flex items-end justify-center pb-4">
        <motion.div animate={{ scaleY: [1,0.5,1], y:[0,10,0] }} transition={{ repeat: Infinity, duration: 2, ease:'easeInOut' }}
          className="w-12 h-16 bg-cyan-400/30 border border-cyan-400/50 rounded-t origin-bottom"/>
        <div className="absolute bottom-4 w-16 h-1 bg-white/10 rounded"/>
      </div>
    ),
    pushup: (
      <div className="relative w-full h-24 flex items-center justify-center">
        <motion.div animate={{ rotate:[-15,-5,-15], y:[0,10,0] }} transition={{ repeat: Infinity, duration: 1.5, ease:'easeInOut' }}
          className="w-24 h-4 bg-cyan-400/30 border border-cyan-400/50 rounded"/>
      </div>
    ),
    jumping_jacks: (
      <div className="relative w-full h-24 flex items-center justify-center">
        <div className="flex gap-2">
          <motion.div animate={{ rotate:[0,45,0], x:[0,-5,0] }} transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-12 bg-cyan-400/30 border border-cyan-400/50 rounded origin-top"/>
          <div className="w-6 h-14 bg-cyan-400/20 border border-cyan-400/20 rounded"/>
          <motion.div animate={{ rotate:[0,-45,0], x:[0,5,0] }} transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-12 bg-cyan-400/30 border border-cyan-400/50 rounded origin-top"/>
        </div>
      </div>
    ),
    plank: (
      <div className="relative w-full h-24 flex items-center justify-center">
        <motion.div animate={{ x:[-1,1,-1], opacity:[0.8,1,0.8] }} transition={{ repeat: Infinity, duration: 0.1 }}
          className="w-24 h-5 bg-cyan-400/40 border border-cyan-400/50 rounded-lg"/>
      </div>
    ),
  };
  return <>{map[type] ?? <div className="w-full h-24 flex items-center justify-center"><Activity size={32} className="opacity-20"/></div>}</>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [authMode, setAuthMode]       = useState<'login'|'signup'>('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [name, setName]               = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Solo Leveling RPG Stats System
  const [stats, setStats] = useState<{strength:number; agility:number; vitality:number; intelligence:number; perception:number}>(() => {
    const saved = localStorage.getItem('aura_stats');
    return saved ? JSON.parse(saved) : { strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 };
  });
  const [statPoints, setStatPoints] = useState<number>(() => {
    const saved = localStorage.getItem('aura_stat_points');
    return saved ? Number(saved) : 5;
  });
  const [shadows, setShadows] = useState<string[]>(() => {
    const saved = localStorage.getItem('aura_shadows');
    return saved ? JSON.parse(saved) : [];
  });
  const [ariseCinematicShadow, setAriseCinematicShadow] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aura_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('aura_stat_points', String(statPoints));
  }, [statPoints]);

  useEffect(() => {
    localStorage.setItem('aura_shadows', JSON.stringify(shadows));
  }, [shadows]);

  // Core data
  const [steps, setSteps]             = useState(10432);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hubs, setHubs]               = useState<any[]>([]);
  const [ranking, setRanking]         = useState<any[]>([]);
  const [selectedHunter, setSelectedHunter] = useState<any>(null);
  const [feed, setFeed]               = useState<any[]>([]);
  const [challenges, setChallenges]   = useState<any[]>([]);
  const [tutorials, setTutorials]     = useState<any[]>([]);
  const [theme, setTheme]             = useState<Theme>('monarch');
  const [isLoading, setIsLoading]     = useState(true);
  const [networkError, setNetworkError] = useState(false);

  // Workout / AI
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [generatedWorkout, setGeneratedWorkout]       = useState<string|null>(null);
  const [travelMode, setTravelMode]                   = useState(false);
  const [equipmentFallback, setEquipmentFallback]     = useState(false);
  const [mood, setMood]                               = useState<Mood>(null);

  // Community
  const [isPosting, setIsPosting]         = useState(false);
  const [showPostForm, setShowPostForm]   = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab]         = useState<'hubs'|'feed'|'competitions'>('hubs');
  const [likedPosts, setLikedPosts]       = useState<Set<number>>(new Set());

  // Intra-Hub Chat states
  const [activeChatHub, setActiveChatHub] = useState<any>(null);
  const [newHubMessageText, setNewHubMessageText] = useState('');
  const [hubMessages, setHubMessages] = useState<{ [key: number]: any[] }>({
    1: [
      { user: "Alex Johnson", content: "Morning runners, who is up for a 10K gate raid today? 🏃‍♂️", time: "9:15 AM" },
      { user: "David Chen", content: "Count me in! Setting off from downtown park at 10 AM.", time: "9:20 AM" },
      { user: "Sarah Miller", content: "Just completed my morning warm-up. Let's conquer this daily threshold! ⚡", time: "9:35 AM" }
    ],
    2: [
      { user: "Emma Miller", content: "Stretching sequence complete. Core stats leveled up! 🧘", time: "8:05 AM" },
      { user: "James Park", content: "Recovery yoga is highly recommended after yesterday's sprint gate.", time: "8:42 AM" }
    ],
    3: [
      { user: "Sarah Park", content: "Heavy squat set today. 140kg for reps! 🔥", time: "11:15 AM" },
      { user: "Alex Johnson", content: "Absolute beast strength. Shadow Army material! ⚔️", time: "11:30 AM" }
    ],
    4: [
      { user: "James Chen", content: "Water temperature is perfect today. Hydration stats peaking!", time: "7:30 AM" }
    ]
  });

  // Competitions state
  const [competitions, setCompetitions] = useState<any[]>([
    { id: 1, title: "Monarch Marathon Gate", type: "Marathon", scope: "Inter-Hub Competition", reward: "2,500 XP", participants: 412, daysLeft: 4, joined: false, icon: "🏃‍♂️" },
    { id: 2, title: "Iron Bodybuilder Duel", type: "Bodybuilding", scope: "Intra-Hub Tournament", reward: "4,000 XP", participants: 189, daysLeft: 7, joined: false, icon: "💪" },
    { id: 3, title: "Shadow Step Vanguard", type: "Step Streak Gate", scope: "Inter-Hub Challenge", reward: "1,500 XP", participants: 720, daysLeft: 2, joined: true, icon: "⚡" },
    { id: 4, title: "Cardio Monarch Arena", type: "HIIT Endurance", scope: "Intra-Hub Clash", reward: "3,000 XP", participants: 94, daysLeft: 5, joined: false, icon: "🫁" }
  ]);

  // Marketplace & Inventory states
  const [activeVouchers, setActiveVouchers] = useState<any[]>(() => {
    const saved = localStorage.getItem('aura_active_vouchers');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', name: "A-Rank Guild Discount (50% Off Merch)", code: "ARANK50", type: "Merch", discount: 50 },
      { id: 'v2', name: "S-Rank Monarch Elixir (100% Off Protein)", code: "MONARCH100", type: "Fuel", discount: 100 }
    ];
  });

  // Real Orders and Checkout states
  const [activeOrders, setActiveOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('aura_active_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  
  // Shipping details form
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('aura_active_vouchers', JSON.stringify(activeVouchers));
  }, [activeVouchers]);

  useEffect(() => {
    localStorage.setItem('aura_active_orders', JSON.stringify(activeOrders));
  }, [activeOrders]);

  // Nutrition
  const [mealAnalysis, setMealAnalysis]   = useState<any>(null);
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [groceryList, setGroceryList]     = useState<string|null>(null);
  const [cheatPlan, setCheatPlan]         = useState<string|null>(null);
  const [gymCrowd, setGymCrowd]           = useState<any>(null);

  // Water tracker (NEW)
  const [waterGlasses, setWaterGlasses]   = useState(0);
  const WATER_GOAL = 8;

  // Sleep tracker (NEW)
  const [sleepHours, setSleepHours]       = useState(7.5);
  const [sleepQuality, setSleepQuality]   = useState<'poor'|'fair'|'good'|'great'>('good');

  // Notifications (NEW)
  const [notifications, setNotifications] = useState<{id:number; text:string; read:boolean}[]>([
    { id:1, text:'You hit 10,000 steps! 🔥', read:false },
    { id:2, text:'New challenge available: Iron Lungs', read:false },
    { id:3, text:'Alex Johnson liked your post', read:true },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Timer (NEW)
  const [timerActive, setTimerActive]   = useState(false);
  const [timerSec, setTimerSec]         = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  // ── Solo Leveling: Daily Quest System ─────────────────────────────────────
  const [showDailyQuest, setShowDailyQuest] = useState(false);
  const [activeMotionTracking, setActiveMotionTracking] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Daily quest items with progress tracking
  const [dailyQuestProgress, setDailyQuestProgress] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('aura_daily_quest');
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('aura_daily_quest_date');
    // Reset quest at midnight
    if (savedDate !== today) return { pushups: 0, situps: 0, squats: 0, running: 0, reading: 0, sleep: 0 };
    return saved ? JSON.parse(saved) : { pushups: 0, situps: 0, squats: 0, running: 0, reading: 0, sleep: 0 };
  });

  // Save quest progress
  useEffect(() => {
    localStorage.setItem('aura_daily_quest', JSON.stringify(dailyQuestProgress));
    localStorage.setItem('aura_daily_quest_date', new Date().toDateString());
  }, [dailyQuestProgress]);

  // Daily quest countdown timer (time remaining until midnight)
  const [questCountdown, setQuestCountdown] = useState('00:00:00');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setQuestCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeMotionTracking) return;

    let stream: MediaStream | null = null;
    let animationId: number;
    let lastFrameData: Uint8ClampedArray | null = null;
    let motionHistory: number[] = [];
    let state = 'up';
    let cooldown = 0;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        addToast("THE SYSTEM: Camera activation failed. Grant permissions.", "error");
        setActiveMotionTracking(null);
      }
    };

    startCamera();

    const detectMotion = () => {
      if (!videoRef.current || !canvasRef.current) {
        animationId = requestAnimationFrame(detectMotion);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;

        if (lastFrameData) {
          let totalDiff = 0;
          for (let i = 0; i < data.length; i += 16) {
            const rDiff = Math.abs(data[i] - lastFrameData[i]);
            const gDiff = Math.abs(data[i+1] - lastFrameData[i+1]);
            const bDiff = Math.abs(data[i+2] - lastFrameData[i+2]);
            if (rDiff + gDiff + bDiff > 35) {
              totalDiff++;
            }
          }

          const motionValue = Math.min((totalDiff / (canvas.width * canvas.height / 4)) * 400, 100);
          motionHistory.push(motionValue);
          if (motionHistory.length > 20) motionHistory.shift();

          if (cooldown > 0) {
            cooldown--;
          } else {
            if (state === 'up' && motionValue > 18) {
              state = 'going_down';
            } else if (state === 'going_down' && motionValue < 8) {
              state = 'down';
            } else if (state === 'down' && motionValue > 18) {
              state = 'going_up';
            } else if (state === 'going_up' && motionValue < 8) {
              state = 'up';
              incrementQuest(activeMotionTracking, 1);
              addToast(`REP DETECTED! +1 ${activeMotionTracking.toUpperCase()} ⚡`, 'success');
              confetti({
                particleCount: 15,
                spread: 40,
                colors: ['#22d3ee', '#3b82f6']
              });
              cooldown = 15;
            }
          }
        }

        lastFrameData = data;
      } catch (e) {
        // Catch gracefully
      }

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(15, 30); ctx.lineTo(15, 15); ctx.lineTo(30, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width - 15, 30); ctx.lineTo(canvas.width - 15, 15); ctx.lineTo(canvas.width - 30, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, canvas.height - 30); ctx.lineTo(15, canvas.height - 15); ctx.lineTo(30, canvas.height - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width - 15, canvas.height - 30); ctx.lineTo(canvas.width - 15, canvas.height - 15); ctx.lineTo(canvas.width - 30, canvas.height - 15);
      ctx.stroke();

      // Dotted body scanner alignment guide outline
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      
      // Draw head guide circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 70, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Draw skeleton wireframe guide
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 90); ctx.lineTo(canvas.width / 2, 160); // Torso/Spine
      ctx.moveTo(canvas.width / 2 - 35, 105); ctx.lineTo(canvas.width / 2 + 35, 105); // Shoulders
      ctx.moveTo(canvas.width / 2 - 20, 160); ctx.lineTo(canvas.width / 2 + 20, 160); // Pelvis
      // Left leg
      ctx.moveTo(canvas.width / 2 - 20, 160); ctx.lineTo(canvas.width / 2 - 30, 195); ctx.lineTo(canvas.width / 2 - 25, 230);
      // Right leg
      ctx.moveTo(canvas.width / 2 + 20, 160); ctx.lineTo(canvas.width / 2 + 30, 195); ctx.lineTo(canvas.width / 2 + 25, 230);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Stand back warning text
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ STAND BACK: ALIGN BODY WITH SCANNERS', canvas.width / 2, 38);
      ctx.textAlign = 'left';

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(15, canvas.height - 40, canvas.width - 30, 25);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < motionHistory.length; i++) {
        const x = 15 + (i * (canvas.width - 30) / 20);
        const y = canvas.height - 15 - (motionHistory[i] * 20 / 100);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('TARGET LOCK: HUNTER SURAJ', 20, 18);
      ctx.fillText(`MOTION DETECTOR: ACTIVE [${state.toUpperCase()}]`, 20, 26);
      
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`COUNTING: ${activeMotionTracking.toUpperCase()}`, canvas.width - 160, canvas.height - 48);

      animationId = requestAnimationFrame(detectMotion);
    };

    detectMotion();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationId);
    };
  }, [activeMotionTracking]);

  const DAILY_QUEST_ITEMS = [
    { key: 'pushups', label: 'Push-ups', target: 15, unit: '' },
    { key: 'situps', label: 'Sit-ups', target: 15, unit: '' },
    { key: 'squats', label: 'Squats', target: 15, unit: '' },
    { key: 'running', label: 'Running', target: 1.5, unit: 'km' },
  ];

  const DAILY_QUEST_EXTRAS = [
    { key: 'reading', label: 'Chapter Reading', target: 1.5, unit: '' },
    { key: 'sleep', label: 'Proper Last Night Sleep', target: 1, unit: '' },
  ];

  const incrementQuest = (key: string, amount: number = 1) => {
    setDailyQuestProgress(prev => ({ ...prev, [key]: Math.min((prev[key] || 0) + amount, 999) }));
  };

  const isDailyQuestComplete = [...DAILY_QUEST_ITEMS, ...DAILY_QUEST_EXTRAS].every(
    q => (dailyQuestProgress[q.key] || 0) >= q.target
  );

  const handleCompleteDailyQuest = () => {
    if (!isDailyQuestComplete) {
      addToast('THE SYSTEM: Complete all objectives before quest submission.', 'error');
      return;
    }
    setStatPoints(prev => prev + 10);
    addToast('DAILY QUEST COMPLETE! +10 Stat Points + 500 XP! ⚡', 'success');
    confetti({ particleCount: 200, spread: 100, colors: ['#4a6fa5', '#8ab4f8', '#c8d8f0', '#ffffff'] });
    setShowDailyQuest(false);
  };

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Pedometer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setSteps(prev => {
        const next = prev + Math.floor(Math.random() * 5);
        if (isLoggedIn && next % 50 === 0) {
          fetch('/api/user/sync-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steps: next }),
          }).catch(() => {});
        }
        // Reward 1 Stat Point every 2,000 steps
        if (isLoggedIn && next > 0 && next % 2000 === 0) {
          setStatPoints(pts => pts + 1);
          addToast("THE SYSTEM: Completed 2,000 steps! +1 Stat Point rewarded. ⚡", "success");
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, addToast]);

  // Monitor for Level-ups to grant +5 Stat Points and confetti
  const lastLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (userProfile?.level) {
      if (lastLevelRef.current !== null && userProfile.level > lastLevelRef.current) {
        const diff = userProfile.level - lastLevelRef.current;
        setStatPoints(prev => prev + diff * 5);
        addToast(`HUNTER RANK UP! You reached Hunter Level ${userProfile.level}. +${diff * 5} STAT POINTS! ⚡`, 'success');
        
        confetti({
          particleCount: 150,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#22d3ee', '#3b82f6', '#c084fc']
        });
      }
      lastLevelRef.current = userProfile.level;
    }
  }, [userProfile?.level, addToast]);

  // ── Workout timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    setNetworkError(false);
    try {
      const [profileData, hubsData, rankData, feedData, chalData, tutData] = await Promise.all([
        apiFetch('/api/user/profile'),
        apiFetch('/api/community/hubs'),
        apiFetch('/api/community/ranking'),
        apiFetch('/api/community/feed'),
        apiFetch('/api/challenges'),
        apiFetch('/api/tutorials'),
      ]);
      setUserProfile(profileData);
      setTheme(profileData.theme || 'dark');
      setHubs(hubsData);
      setRanking(rankData);
      setFeed(feedData);
      setChallenges(chalData);
      setTutorials(tutData);
    } catch (err) {
      setNetworkError(true);
      addToast('Connection lost. Showing cached data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, addToast]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    if (!isLoggedIn) return;
    apiFetch('/api/gym/predict').then(setGymCrowd).catch(() => {});
  }, [isLoggedIn]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);

    // FIX: Proper email validation instead of silently appending @gmail.com
    const inputEmail = email.toLowerCase().trim();
    const normalizedEmail = inputEmail === 'monarch' ? 'monarch@gmail.com' : (inputEmail.includes('@') ? inputEmail : `${inputEmail}@gmail.com`);
    if (!normalizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      addToast('Please enter a valid email address.', 'error');
      setAuthLoading(false);
      return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = authMode === 'login'
      ? { email: normalizedEmail, password }
      : { email: normalizedEmail, password, name };

    // FIX: Validate password length on signup
    if (authMode === 'signup' && password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      setAuthLoading(false);
      return;
    }

    try {
      const data = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (data.success) {
        if (normalizedEmail === 'monarch@gmail.com') {
          // Preload S-Rank Stats + Shadows + Stat points for an epic Solo Leveling demo!
          const demoStats = { strength: 80, agility: 75, vitality: 80, intelligence: 75, perception: 80 };
          localStorage.setItem('aura_stats', JSON.stringify(demoStats));
          localStorage.setItem('aura_shadows', JSON.stringify(['Tank', 'Iron', 'Tusk', 'Igris', 'Beru']));
          localStorage.setItem('aura_stat_points', '50');
          setStats(demoStats);
          setShadows(['Tank', 'Iron', 'Tusk', 'Igris', 'Beru']);
          setStatPoints(50);
        } else if (authMode === 'signup') {
          // Wipe all cached progress so new accounts start fresh
          localStorage.removeItem('aura_stats');
          localStorage.removeItem('aura_stat_points');
          localStorage.removeItem('aura_shadows');
          localStorage.removeItem('aura_active_vouchers');
          localStorage.removeItem('aura_active_orders');
          localStorage.removeItem('aura_daily_quest');
          localStorage.removeItem('aura_daily_quest_date');
          setStats({ strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 });
          setStatPoints(5);
          setShadows([]);
          setActiveVouchers([]);
          setActiveOrders([]);
          setDailyQuestProgress({ pushups: 0, situps: 0, squats: 0, running: 0, reading: 0, sleep: 0 });
        }
        // Clear stale profile before loading fresh data
        setUserProfile(null);
        setIsLoggedIn(true);
        
        // Immediately fetch fresh data from server for this user
        try {
          const [profileData, hubsData, rankData, feedData, chalData, tutData] = await Promise.all([
            apiFetch('/api/user/profile'),
            apiFetch('/api/community/hubs'),
            apiFetch('/api/community/ranking'),
            apiFetch('/api/community/feed'),
            apiFetch('/api/challenges'),
            apiFetch('/api/tutorials'),
          ]);
          setUserProfile(profileData);
          setTheme(profileData.theme || 'dark');
          setHubs(hubsData);
          setRanking(rankData);
          setFeed(feedData);
          setChallenges(chalData);
          setTutorials(tutData);
        } catch {}
        
        addToast(`Welcome${authMode === 'login' ? ' back' : ''}, ${data.user?.name || 'Athlete'}! \u{1F680}`, 'success');
      } else {
        addToast(data.error || 'Authentication failed', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to connect. Try again.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setCurrentView('dashboard');
    setGeneratedWorkout(null);
    setMealAnalysis(null);
    setEmail('');
    setPassword('');
    setName('');
    // Wipe all localStorage so different users don't share progress
    localStorage.removeItem('aura_stats');
    localStorage.removeItem('aura_stat_points');
    localStorage.removeItem('aura_shadows');
    localStorage.removeItem('aura_active_vouchers');
    localStorage.removeItem('aura_active_orders');
    localStorage.removeItem('aura_daily_quest');
    localStorage.removeItem('aura_daily_quest_date');
    // Reset React states to defaults
    setStats({ strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 });
    setStatPoints(5);
    setShadows([]);
    setActiveVouchers([]);
    setActiveOrders([]);
    setDailyQuestProgress({ pushups: 0, situps: 0, squats: 0, running: 0, reading: 0, sleep: 0 });
    // Clear community/server states so next login starts fresh
    setHubs([]);
    setChallenges([]);
    setFeed([]);
    setRanking([]);
    addToast('Signed out successfully.', 'info');
  };

  // ── Challenge ──────────────────────────────────────────────────────────────
  const handleCompleteChallenge = async (challengeId: number) => {
    try {
      const data = await apiFetch('/api/user/complete-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      if (data.success) {
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isCompleted: true } : c));
        const profile = await apiFetch('/api/user/profile');
        setUserProfile(profile);
        setStatPoints(prev => prev + 3);
        const chalName = challenges.find(c => c.id === challengeId)?.title || "Gate";
        addToast(`DUNGEON GATE CLEARED: '${chalName}'! +${challenges.find(c=>c.id===challengeId)?.xp || 0} XP & +3 STAT POINTS! ðŸŽ¯`, 'success');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // ── Follow ─────────────────────────────────────────────────────────────────
  const handleFollow = async (targetName: string) => {
    try {
      await apiFetch('/api/user/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetName }),
      });
      const [rankRes, profileRes] = await Promise.all([
        apiFetch('/api/community/ranking'),
        apiFetch('/api/user/profile'),
      ]);
      setRanking(rankRes);
      setUserProfile(profileRes);
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // ── Hub ────────────────────────────────────────────────────────────────────
  const handleJoinHub = async (hubId: number) => {
    try {
      const data = await apiFetch('/api/community/join-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hubId }),
      });
      const profile = await apiFetch('/api/user/profile');
      setUserProfile(profile);
      addToast(data.joined ? 'Joined hub! +100 XP' : 'Left hub.', data.joined ? 'success' : 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // ── Post ───────────────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    // FIX: Character limit validation
    if (newPostContent.length > 280) {
      addToast('Post must be under 280 characters.', 'error');
      return;
    }
    setIsPosting(true);
    try {
      const post = await apiFetch('/api/community/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent }),
      });
      setFeed(prev => [post, ...prev]);
      setNewPostContent('');
      setShowPostForm(false);
      const profile = await apiFetch('/api/user/profile');
      setUserProfile(profile);
      addToast('Post published! +75 XP ðŸ“£', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsPosting(false);
    }
  };

  // ── Like ───────────────────────────────────────────────────────────────────
  const handleLike = async (postId: number) => {
    // FIX: Prevent double-liking (optimistic update)
    if (likedPosts.has(postId)) {
      addToast('Already liked!', 'info');
      return;
    }
    setLikedPosts(prev => new Set([...prev, postId]));
    setFeed(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    try {
      await apiFetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
    } catch {
      // Rollback optimistic update
      setLikedPosts(prev => { const s = new Set(prev); s.delete(postId); return s; });
      setFeed(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    }
  };

  // ── Workout Gen ────────────────────────────────────────────────────────────
  const handleGenerateWorkout = async () => {
    if (!mood) {
      addToast('Pick a mood first so AI can tailor your workout!', 'info');
      return;
    }
    setIsGeneratingWorkout(true);
    setGeneratedWorkout(null);
    try {
      const data = await apiFetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'Weight Loss & Strength',
          fitnessLevel: 'Intermediate',
          availableEquipment: 'Dumbbells and Yoga Mat',
          travelMode,
          equipmentFallback,
          mood,
          dailyStatus: {
            steps,
            completedChallenges: userProfile?.completedChallenges?.length || 0,
          },
        }),
      });
      setGeneratedWorkout(data.workout);
      const profile = await apiFetch('/api/user/profile');
      setUserProfile(profile);
      addToast('Workout plan generated! +150 XP 💪', 'success');
    } catch (err: any) {
      addToast(err.message || 'AI Coach unavailable.', 'error');
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // ── Nutrition ──────────────────────────────────────────────────────────────
  const handleMealAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // FIX: File type & size validation
    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Image must be under 10MB.', 'error');
      return;
    }
    setIsAnalyzingMeal(true);
    setMealAnalysis(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const data = await fetch('/api/nutrition/analyze', { method: 'POST', body: formData }).then(r => r.json());
      setMealAnalysis(data);
      addToast('Meal scanned! Macros extracted ðŸ¥—', 'success');
    } catch {
      addToast('Failed to analyze meal.', 'error');
    } finally {
      setIsAnalyzingMeal(false);
    }
  };

  const handleGroceryGenerate = async () => {
    try {
      const data = await apiFetch('/api/nutrition/grocery', { method: 'POST' });
      setGroceryList(data.list);
    } catch { addToast('Failed to generate list.', 'error'); }
  };

  const handleCheatPlanGenerate = async () => {
    try {
      const data = await apiFetch('/api/nutrition/cheat-planner', { method: 'POST' });
      setCheatPlan(data.strategy);
    } catch { addToast('Failed to generate plan.', 'error'); }
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  const handleUpdateTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await apiFetch('/api/user/update-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch {}
  };

  // ── Moderation ─────────────────────────────────────────────────────────────
  const handleModerate = async (postId: number, action: 'flag'|'remove'|'approve') => {
    try {
      const data = await apiFetch('/api/community/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action }),
      });
      if (data.success) {
        const feedRes = await apiFetch('/api/community/feed');
        setFeed(feedRes);
        addToast(`Post ${action}d.`, 'success');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // ── Water tracker ──────────────────────────────────────────────────────────
  const addWater = () => {
    if (waterGlasses >= WATER_GOAL) { addToast('Goal reached! 💧', 'success'); return; }
    const next = waterGlasses + 1;
    setWaterGlasses(next);
    if (next === WATER_GOAL) addToast('Hydration goal achieved! ðŸŽ‰', 'success');
  };

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const formatTimer = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ----------------------------------------------------
  // RENDER: Auth
  // ----------------------------------------------------
  const renderAuth = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center justify-center min-h-[80vh] p-8 space-y-10">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/40 rotate-12">
          <Activity size={48} className="text-black"/>
        </div>
        <h1 className="text-5xl font-black font-display tracking-tighter uppercase leading-none">AURA<br/><span className="text-[var(--acc-primary)]">FIT</span></h1>
        <p className="text-[var(--text-dim)] text-xs font-black uppercase tracking-[0.3em]">Neural Athlete Protocol</p>
      </div>

      <div className="glass-card p-8 w-full max-w-sm space-y-6">
        <div className="flex gap-1 p-1 bg-white/5 rounded">
          {(['login','signup'] as const).map(m => (
            <button key={m} onClick={() => setAuthMode(m)}
              className={`flex-1 py-2 rounded text-[11px] font-black uppercase tracking-widest transition-all ${authMode===m ? 'bg-[var(--acc-primary)] text-black shadow' : 'text-[var(--text-dim)]'}`}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] px-1">Full Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name"
                className="w-full bg-white/5 border border-[var(--border-color)] p-4 rounded text-sm font-medium focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none" required/>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] px-1">Email</label>
            <input type="text" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email or username"
              className="w-full bg-white/5 border border-[var(--border-color)] p-4 rounded text-sm font-medium focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none" required/>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] px-1">Password {authMode==='signup' && <span className="text-[var(--text-dim)] normal-case">(min 6 chars)</span>}</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-white/5 border border-[var(--border-color)] p-4 rounded text-sm font-medium focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none" required/>
          </div>
          <button type="submit" disabled={authLoading}
            className="w-full bg-[var(--acc-primary)] text-black font-black py-4 rounded uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {authLoading ? <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}><RefreshCw size={16}/></motion.div> : null}
            {authLoading ? 'Please wait…' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Dashboard
  // ----------------------------------------------------
  const renderDashboard = () => (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-lg font-black text-black">
              {(userProfile?.name || 'U').substring(0,2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight uppercase">
              Good {new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'}, {userProfile?.name?.split(' ')[0] || 'Athlete'}
            </h1>
            <p className="text-[var(--text-dim)] text-[10px] uppercase tracking-widest font-bold">
              {new Date().toDateString()} • 🔥 12-Day Streak
            </p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="bg-white/5 border border-[var(--border-color)] p-2.5 rounded relative">
            <Bell size={18}/>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded text-[9px] font-black flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                className="absolute right-0 top-12 w-72 glass-card p-4 space-y-2 z-50 shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">Notifications</span>
                  <button onClick={() => { setNotifications(p=>p.map(n=>({...n,read:true}))); setShowNotifs(false); }}
                    className="text-[9px] text-[var(--acc-primary)] font-black uppercase">Mark all read</button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} onClick={() => setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}
                    className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-all ${n.read?'opacity-50':'bg-white/5'}`}>
                    <div className={`w-2 h-2 rounded mt-1.5 flex-shrink-0 ${n.read?'bg-white/20':'bg-[var(--acc-primary)]'}`}/>
                    <span className="text-[11px] font-medium">{n.text}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pedometer Ring */}
      <div className="glass-card p-8 flex flex-col items-center text-center">
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5"/>
            <motion.circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray="502"
              initial={{ strokeDashoffset:502 }}
              animate={{ strokeDashoffset: 502 - (Math.min(steps,12000)/12000)*502 }}
              className="text-[var(--acc-primary)] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black font-display">{steps.toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-black">Steps</span>
            <span className="text-[9px] text-[var(--acc-primary)] font-bold">{Math.round(steps/12000*100)}% of goal</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label:'Calories', val:'842 kcal' },
            { label:'Distance', val:'6.4 km' },
            { label:'Active Min', val:'48 min' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-[var(--border-color)] rounded p-3">
              <p className="text-[9px] text-[var(--text-dim)] uppercase font-black mb-1">{item.label}</p>
              <p className="text-sm font-black font-display">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Row - NEW */}
      <div className="grid grid-cols-2 gap-3">
        {/* Water Quick View */}
        <button onClick={() => setCurrentView('water')} className="glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-all text-left">
          <div className="p-2 bg-blue-500/20 rounded"><Droplets size={20} className="text-blue-400"/></div>
          <div>
            <p className="text-[9px] text-[var(--text-dim)] uppercase font-black">Hydration</p>
            <p className="text-sm font-black">{waterGlasses}/{WATER_GOAL} <span className="text-[10px] font-normal opacity-50">glasses</span></p>
          </div>
        </button>
        {/* Sleep Quick View */}
        <button onClick={() => setCurrentView('sleep')} className="glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-all text-left">
          <div className="p-2 bg-indigo-500/20 rounded"><Moon size={20} className="text-indigo-400"/></div>
          <div>
            <p className="text-[9px] text-[var(--text-dim)] uppercase font-black">Last Night</p>
            <p className="text-sm font-black">{sleepHours}h <span className="text-[10px] font-normal opacity-50 capitalize">{sleepQuality}</span></p>
          </div>
        </button>
      </div>

      {/* Step Chart */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-1">Movement Analysis</h3>
            <h4 className="text-sm font-black font-display uppercase tracking-tight">Step History (7D)</h4>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-display text-[var(--acc-primary)]">11,240</span>
            <span className="text-[8px] block uppercase font-black text-[var(--text-dim)]/50">Daily Avg</span>
          </div>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_STEPS_DATA} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <YAxis hide domain={[0,'dataMax + 2000']}/>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill:'rgba(255,255,255,0.2)', fontSize:10, fontWeight:900 }} dy={10}/>
              <Tooltip cursor={{ fill:'rgba(255,255,255,0.05)', radius:10 }}
                contentStyle={{ backgroundColor:'rgba(5,6,10,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'8px 12px' }}
                itemStyle={{ color:'#22d3ee', fontWeight:'900', fontSize:'12px' }}
                labelStyle={{ color:'rgba(255,255,255,0.5)', fontSize:'10px', textTransform:'uppercase' }}/>
              <Bar dataKey="steps" radius={[6,6,6,6]} barSize={24}>
                {MOCK_STEPS_DATA.map((_, index) => (
                  <Cell key={index} fill={index===4 ? 'url(#barGrad)' : 'rgba(255,255,255,0.08)'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── SOLO LEVELING: DAILY QUEST TRIGGER ─── */}
      <button 
        onClick={() => setShowDailyQuest(true)}
        className="w-full quest-panel p-5 cursor-pointer group"
      >
        <div className="quest-corner quest-corner--tl"/>
        <div className="quest-corner quest-corner--tr"/>
        <div className="quest-corner quest-corner--bl"/>
        <div className="quest-corner quest-corner--br"/>
        <div className="quest-grid-bg"/>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center border border-[rgba(140,160,200,0.3)] rounded bg-[rgba(30,50,90,0.5)]">
            <Target size={24} className="text-[rgba(180,210,255,0.8)] drop-shadow-[0_0_6px_rgba(100,160,255,0.5)]"/>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[rgba(140,170,220,0.7)] font-mono">
              [Daily Quest: Player Training has arrived.]
            </p>
            <h3 className="text-base font-black uppercase tracking-tight text-[rgba(220,230,255,0.95)] quest-title mt-0.5">
              QUEST INFO
            </h3>
          </div>
          <div className="text-right">
            <span className="quest-timer text-sm font-black">{questCountdown}</span>
            <p className="text-[8px] text-[rgba(140,160,200,0.5)] uppercase font-bold mt-0.5">remaining</p>
          </div>
        </div>
      </button>

      {/* Daily Challenges */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">Active Objectives</h3>
          <span className="text-[9px] font-black text-[var(--acc-primary)]">{challenges.filter(c=>c.isCompleted).length}/{challenges.length} done</span>
        </div>
        {challenges.length === 0 ? (
          <div className="glass-card p-8 text-center text-[var(--text-dim)] text-sm">
            <Target size={32} className="mx-auto mb-2 opacity-30"/>
            <p className="text-[10px] uppercase font-black">No challenges available</p>
          </div>
        ) : challenges.map(challenge => (
          <div key={challenge.id}
            className={`glass-card p-5 flex items-center gap-4 transition-all ${challenge.isCompleted ? 'opacity-40 grayscale' : 'hover:bg-white/10'}`}>
            <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center text-2xl border border-white/5 flex-shrink-0">
              {challenge.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-black text-sm uppercase tracking-tight truncate">{challenge.title}</h4>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ml-2 flex-shrink-0 ${
                  challenge.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                  challenge.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>{challenge.difficulty}</span>
              </div>
              <p className="text-[10px] text-[var(--text-dim)] font-bold leading-relaxed">{challenge.description}</p>
              <p className="text-[9px] text-[var(--acc-primary)] font-black mt-1">+{challenge.xp} XP</p>
            </div>
            {challenge.isCompleted
              ? <CheckCircle size={20} className="text-emerald-400 flex-shrink-0"/>
              : <button onClick={() => handleCompleteChallenge(challenge.id)}
                  className="w-10 h-10 rounded bg-cyan-500/20 flex items-center justify-center text-[var(--acc-primary)] hover:bg-[var(--acc-primary)] hover:text-black transition-all flex-shrink-0">
                  <Plus size={20}/>
                </button>
            }
          </div>
        ))}
      </div>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Workouts
  // ----------------------------------------------------
  const renderWorkouts = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase">AI Coach</h1>
        <div className="flex gap-2">
          <button onClick={() => setTravelMode(!travelMode)}
            className={`p-2 rounded border transition-all ${travelMode ? 'bg-[var(--acc-primary)] text-black border-[var(--acc-primary)]' : 'bg-white/5 text-[var(--text-dim)] border-[var(--border-color)]'}`}
            title="Travel Mode"><Globe size={20}/></button>
          <button onClick={() => setEquipmentFallback(!equipmentFallback)}
            className={`p-2 rounded border transition-all ${equipmentFallback ? 'bg-indigo-400 text-white border-indigo-400' : 'bg-white/5 text-[var(--text-dim)] border-[var(--border-color)]'}`}
            title="No Equipment"><Zap size={20}/></button>
        </div>
      </div>

      {/* Gym Crowd */}
      {gymCrowd && (
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded flex items-center justify-center font-black text-xs ${
              gymCrowd.crowdLevel==='High' ? 'bg-rose-500/20 text-rose-400' :
              gymCrowd.crowdLevel==='Moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>{gymCrowd.crowdLevel[0]}</div>
            <div>
              <h4 className="text-[10px] font-black uppercase text-[var(--text-dim)]">Gym Status</h4>
              <p className="text-sm font-black uppercase tracking-tight">{gymCrowd.crowdLevel} Crowd</p>
            </div>
          </div>
          <p className="text-[9px] font-bold text-[var(--text-dim)] max-w-[140px] text-right">{gymCrowd.recommendation}</p>
        </div>
      )}

      {/* Mood Selector - NEW FEATURE */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">How are you feeling today?</h3>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(MOOD_CONFIG) as Mood[]).map(m => m && (
            <button key={m} onClick={() => setMood(m)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded border transition-all ${
                mood===m ? `${MOOD_CONFIG[m].color} border-[var(--acc-primary)]` : 'bg-white/5 border-[var(--border-color)] opacity-50 hover:opacity-100'
              }`}>
              <span>{MOOD_CONFIG[m].icon}</span>
              <span className="text-[9px] font-black uppercase">{MOOD_CONFIG[m].label}</span>
            </button>
          ))}
        </div>
        {mood && <p className="text-[10px] text-[var(--acc-primary)] font-bold text-center">AI will tailor your workout for your {MOOD_CONFIG[mood].label.toLowerCase()} mood ✨</p>}
      </div>

      {/* Workout Timer - NEW FEATURE */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase text-[var(--text-dim)] mb-1">Workout Timer</h3>
          <span className="text-3xl font-black font-display tabular-nums">{formatTimer(timerSec)}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTimerActive(!timerActive)}
            className={`px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${
              timerActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[var(--acc-primary)] text-black'
            }`}>
            {timerActive ? 'Pause' : timerSec > 0 ? 'Resume' : 'Start'}
          </button>
          {timerSec > 0 && (
            <button onClick={() => { setTimerSec(0); setTimerActive(false); }}
              className="px-3 py-2 rounded font-black text-[10px] uppercase bg-white/5 text-[var(--text-dim)] border border-[var(--border-color)]">
              <X size={14}/>
            </button>
          )}
        </div>
      </div>

      {/* AI Workout Generator */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black font-display uppercase mb-2">AI Engine</h3>
          <p className="text-[var(--text-dim)] text-sm mb-6 font-medium">
            {mood ? `Generating a ${MOOD_CONFIG[mood].label.toLowerCase()}-optimized session…` : 'Pick a mood to personalize your plan.'}
          </p>
          <button onClick={handleGenerateWorkout} disabled={isGeneratingWorkout}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black py-5 rounded transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-70">
            {isGeneratingWorkout
              ? <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}><Activity size={20}/></motion.div>
              : <Dumbbell size={20}/>}
            {isGeneratingWorkout ? 'Generating…' : 'Generate My Workout'}
          </button>
        </div>
        <div className="absolute -top-10 -right-10 opacity-5"><Dumbbell size={200}/></div>
      </div>

      {/* FULLSCREEN QUEST PROTOCOL POPUP (AI WORKOUT) */}
      <AnimatePresence>
        {generatedWorkout && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[140] bg-black/95 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-radial-gradient from-cyan-955/20 via-transparent to-transparent pointer-events-none"/>
            <div className="absolute top-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded blur-[120px] animate-pulse pointer-events-none"/>
            
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-full max-h-[85vh] glass-card p-8 border-2 border-cyan-500/40 relative z-10 flex flex-col items-center overflow-hidden bg-black/85"
            >
              {/* Tactical HUD Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-60"/>
              
              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm shadow-[0_0_5px_rgba(34,211,238,0.5)]"/>
              <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm shadow-[0_0_5px_rgba(34,211,238,0.5)]"/>
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm shadow-[0_0_5px_rgba(34,211,238,0.5)]"/>
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm shadow-[0_0_5px_rgba(34,211,238,0.5)]"/>

              {/* Quest Header */}
              <div className="space-y-1 w-full text-center relative z-10 flex-shrink-0">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.25em] font-mono block">
                  ── SYSTEM: NEW QUEST REGISTERED ──
                </span>
                <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white animate-pulse">
                  QUEST: INSTANCED DUNGEON
                </h2>
                <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto my-2"/>
              </div>

              {/* Scrollable Quest Details */}
              <div className="flex-1 w-full overflow-y-auto text-left relative z-10 py-4 px-2 space-y-4 text-xs scrollbar-thin scrollbar-thumb-cyan-500/20">
                <div className="prose prose-invert max-w-none prose-sm prose-p:text-cyan-100/80 prose-headings:text-cyan-300 prose-headings:uppercase prose-headings:font-display prose-headings:tracking-wider prose-li:text-cyan-100/70">
                  <ReactMarkdown>{generatedWorkout}</ReactMarkdown>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full space-y-2 relative z-10 pt-4 border-t border-cyan-500/20 flex-shrink-0">
                <button
                  onClick={() => { setGeneratedWorkout(null); setTimerSec(0); setTimerActive(true); }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black py-4 rounded uppercase tracking-[0.2em] text-xs shadow-lg shadow-cyan-500/30 cursor-pointer border border-cyan-400/50 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  ⚡ Accept Quest (Start)
                </button>
                <button
                  onClick={() => setGeneratedWorkout(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white font-black py-3 rounded uppercase tracking-widest text-[8px] cursor-pointer transition-all border border-white/5"
                >
                  Postpone Protocol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorials */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] px-1">Movement Library</h3>
        <div className="grid grid-cols-2 gap-4">
          {tutorials.map(tut => (
            <motion.div key={tut.id} whileHover={{ y:-4 }} className="glass-card p-4 space-y-4 flex flex-col">
              <div className="bg-black/20 rounded overflow-hidden border border-white/5">
                <ExerciseAnimation type={tut.type}/>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black uppercase tracking-tight">{tut.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-[var(--text-dim)] uppercase">{tut.muscles}</span>
                  <span className={`text-[8px] font-black ${
                    tut.difficulty==='Easy'?'text-emerald-400':tut.difficulty==='Medium'?'text-amber-400':'text-rose-400'
                  }`}>{tut.difficulty}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Community
  // ----------------------------------------------------
  const renderCommunity = () => {
    // Send a message inside the Hub Channel
    const handleSendHubMessage = (hubId: number) => {
      if (!newHubMessageText.trim()) return;
      const newMsg = {
        user: userProfile?.name || "You",
        content: newHubMessageText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setHubMessages(prev => ({
        ...prev,
        [hubId]: [...(prev[hubId] || []), newMsg]
      }));
      setNewHubMessageText('');
      
      // Fun tactical response bot delay!
      setTimeout(() => {
        const responses = [
          "SYSTEM MONARCH: Outstanding persistence! Keep climbing the leaderboard! ⚡",
          "Alex Johnson: Spot on! We are reclaiming the dungeon clear title today!",
          "SYSTEM: Daily stats synced. Mana recovery coefficient +0.1!",
          "Sarah Miller: Absolute vanguard performance! Let's go! ⚔️"
        ];
        const randomResponse = {
          user: responses[Math.floor(Math.random() * responses.length)].split(':')[0],
          content: responses[Math.floor(Math.random() * responses.length)].split(':').slice(1).join(':').trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHubMessages(prev => ({
          ...prev,
          [hubId]: [...(prev[hubId] || []), randomResponse]
        }));
      }, 1500);
    };

    // Toggle joining a competition gate
    const handleJoinCompetition = (compId: number) => {
      setCompetitions(prev => prev.map(c => {
        if (c.id === compId) {
          if (c.joined) {
            // Already joined -> player is CLAIMING VICTORY!
            setStatPoints(pts => pts + 5);
            setUserProfile(prof => prof ? { ...prof, xp: (prof.xp || 0) + 500 } : null);
            
            // Auto generate victory prize voucher
            const code = "VICTORY" + Math.floor(Math.random() * 9000 + 1000);
            const newVoucher = {
              id: 'v_' + Date.now(),
              name: `Victory Reward Voucher (${c.type} - 50% Off)`,
              code: code,
              type: c.type === 'Marathon' ? 'Merch' : 'Fuel',
              discount: 50
            };
            setActiveVouchers(v => [...v, newVoucher]);
            
            addToast(`RAID CLEAR! Conquered ${c.title}! +5 STAT POINTS, +500 XP, and a Victory Voucher! 🏆`, 'success');
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#22d3ee', '#f59e0b', '#a855f7']
            });
            c.participants -= 1;
            return { ...c, joined: false };
          } else {
            // Registering for raid
            addToast(`SYSTEM REGISTRATION: Joined ${c.title}! Raid protocols active. ⚡`, 'success');
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#a855f7', '#22d3ee']
            });
            c.participants += 1;
            return { ...c, joined: true };
          }
        }
        return c;
      }));
    };

    return (
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black font-display tracking-tighter uppercase">
            {activeTab === 'hubs' ? 'Guild Hubs 🏰' : activeTab === 'feed' ? 'Monarch Feed 📢' : 'Raid Gates ⚔️'}
          </h1>
          {activeTab === 'feed' && (
            <button onClick={() => setShowPostForm(!showPostForm)}
              className={`p-3 rounded transition-all border ${showPostForm ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 hover:bg-white/10 text-[var(--acc-primary)] border-[var(--border-color)]'}`}>
              {showPostForm ? <X size={22}/> : <Plus size={22}/>}
            </button>
          )}
        </div>

        <AnimatePresence>
          {showPostForm && activeTab === 'feed' && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
              <div className="glass-card p-4 space-y-3">
                <textarea value={newPostContent} onChange={e=>setNewPostContent(e.target.value)}
                  placeholder="Share your progress with other hunters…"
                  className="w-full bg-white/5 rounded p-4 text-sm font-medium border border-[var(--border-color)] focus:outline-none focus:border-[var(--acc-primary)] transition-colors h-24 resize-none"/>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${newPostContent.length>260?'text-rose-400':newPostContent.length>200?'text-amber-400':'text-[var(--text-dim)]'}`}>
                    {newPostContent.length}/280
                  </span>
                  <button onClick={handleCreatePost} disabled={isPosting || !newPostContent.trim() || newPostContent.length>280}
                    className="bg-[var(--acc-primary)] text-black font-black py-2 px-5 rounded uppercase tracking-widest text-[10px] disabled:opacity-50">
                    {isPosting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 glass-nav max-w-[340px]">
          {(['hubs','feed','competitions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${
                activeTab===tab ? 'bg-white text-black shadow-lg scale-102 font-black' : 'text-[var(--text-dim)] hover:text-white'
              }`}>
              {tab === 'hubs' ? 'Hubs 🏰' : tab === 'feed' ? 'Feed 📢' : 'Gates ⚔️'}
            </button>
          ))}
        </div>

        {activeTab === 'hubs' ? (
          <div className="space-y-3">
            {hubs.map(hub => {
              const isJoined = userProfile?.joinedHubs?.includes(hub.id);
              return (
                <div key={hub.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.05] transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-violet-500/5 via-transparent to-transparent pointer-events-none"/>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded flex items-center justify-center border border-[var(--border-color)] group-hover:scale-110 transition-transform flex-shrink-0">
                      <MapPin className="text-indigo-400 w-6 h-6"/>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-sm uppercase tracking-tight truncate text-white">{hub.name}</h4>
                      <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-wider">{hub.members + (isJoined?1:0)} members • {hub.distance}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button onClick={e=>{ e.stopPropagation(); handleJoinHub(hub.id); }}
                      className={`px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all flex-shrink-0 border ${
                        isJoined ? 'bg-white/5 text-[var(--text-dim)] border-white/5' : 'bg-[var(--acc-primary)] text-black border-cyan-400/50 shadow-lg hover:scale-105 active:scale-95'
                      }`}>
                      {isJoined ? 'Joined' : 'Join Guild'}
                    </button>
                    {isJoined && (
                      <button onClick={e => { e.stopPropagation(); setActiveChatHub(hub); }}
                        className="px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest bg-violet-900/40 text-violet-300 border border-violet-500/45 hover:bg-violet-600 hover:text-white transition-all shadow-md shadow-violet-500/10 active:scale-95">
                        💬 CHAT ROOM
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'feed' ? (
          <div className="space-y-4">
            {feed.length === 0 && (
              <div className="glass-card p-12 text-center">
                <Users size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="text-[10px] uppercase font-black text-[var(--text-dim)]">No posts yet. Be the first!</p>
              </div>
            )}
            {feed.map(post => (
              <div key={post.id}
                className={`glass-card p-6 border-[var(--border-color)] transition-all ${
                  post.moderationStatus==='flagged' ? 'border-amber-500/50 bg-amber-500/5' :
                  post.moderationStatus==='removed' ? 'opacity-40 grayscale' : ''
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--acc-primary)]/20 rounded flex items-center justify-center font-black text-[10px] text-[var(--acc-primary)] border border-[var(--acc-primary)]/20">
                      {post.user.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-tight text-white">{post.user}</span>
                        {post.moderationStatus==='flagged' && <span className="text-[7px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">Flagged</span>}
                      </div>
                      <span className="text-[9px] text-[var(--text-dim)] uppercase font-black tracking-widest">2h ago</span>
                    </div>
                  </div>
                  {userProfile?.isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleModerate(post.id, post.moderationStatus==='active'?'flag':'approve')}
                        className={`p-2 rounded border transition-all ${post.moderationStatus==='active' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'}`}>
                        <Activity size={14}/>
                      </button>
                      <button onClick={() => handleModerate(post.id,'remove')} className="p-2 rounded border bg-rose-500/10 text-rose-500 border-rose-500/10">
                        <X size={14}/>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm leading-relaxed mb-4 font-medium text-white/80">{post.content}</p>
                <div className="flex items-center gap-6">
                  <button onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors group/like ${
                      likedPosts.has(post.id) ? 'text-rose-400' : 'text-[var(--text-dim)] hover:text-rose-400'
                    }`}>
                    <Heart size={16} className={likedPosts.has(post.id) ? 'fill-rose-500 text-rose-500' : 'opacity-40 group-hover/like:opacity-100'}/>
                    {post.likes}
                  </button>
                  <button className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest hover:text-[var(--text-main)]">Reply</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* COMPETITIONS GATES LISTING */
          <div className="space-y-4">
            {competitions.map(comp => (
              <div key={comp.id} 
                className={`p-5 rounded border transition-all flex flex-col gap-4 relative overflow-hidden ${
                  comp.joined
                    ? 'bg-cyan-950/15 border-cyan-500/35 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                }`}>
                
                {/* Visual side glow tag */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${comp.joined ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-white/10'}`}/>
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/5 border border-white/10 rounded flex items-center justify-center text-2xl">
                      {comp.icon}
                    </div>
                    <div>
                      <span className="text-[7px] font-black uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/25 tracking-widest">
                        {comp.scope}
                      </span>
                      <h4 className="font-black text-sm uppercase tracking-tight text-white mt-1">{comp.title}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest block">Reward XP</span>
                    <span className="text-xs font-black text-white">{comp.reward}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-[var(--text-dim)] font-black uppercase border-t border-b border-white/5 py-2.5">
                  <span className="flex items-center gap-1">👥 {comp.participants} Registered Hunters</span>
                  <span className="text-rose-400">⏳ {comp.daysLeft} Days Left</span>
                </div>

                <button onClick={() => handleJoinCompetition(comp.id)}
                  className={`w-full font-black py-3 rounded uppercase tracking-widest text-[9px] transition-all border active:scale-98 ${
                    comp.joined
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/20'
                      : 'bg-cyan-500 text-black border-cyan-400/50 shadow-md shadow-cyan-500/10 hover:scale-[1.01] hover:shadow-cyan-500/20'
                  }`}>
                  {comp.joined ? '🛡️ RAID IN PROGRESS (ACTIVE)' : '⚔️ REGISTER FOR RAID'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INTRA-GUILD HUB CHAT OVERLAY */}
        <AnimatePresence>
          {activeChatHub && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setActiveChatHub(null)}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ scale:0.92, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.92, opacity:0, y:20 }}
                onClick={e=>e.stopPropagation()}
                className="quest-panel w-full max-w-md max-h-[85vh] flex flex-col monarch-glow bg-black border border-violet-500/30">
                
                {/* Metallic decorative elements */}
                <div className="quest-corner quest-corner--tl"/>
                <div className="quest-corner quest-corner--tr"/>
                <div className="quest-corner quest-corner--bl"/>
                <div className="quest-corner quest-corner--br"/>
                <div className="quest-side-clip quest-side-clip--left"/>
                <div className="quest-side-clip quest-side-clip--right"/>
                <div className="quest-grid-bg"/>
                <div className="quest-top-bar"/>

                {/* Close Button */}
                <button className="quest-close-btn" onClick={() => setActiveChatHub(null)}>X</button>

                {/* Chat Header */}
                <div className="p-5 border-b border-white/10 flex items-center gap-3 relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 bg-violet-500/20 border border-violet-500/30 rounded flex items-center justify-center text-violet-300">
                    💬
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tight text-white">{activeChatHub.name}</h3>
                    <p className="text-[9px] text-violet-400 font-bold uppercase tracking-widest">Intra-Guild Comms Link • Secure 🟢</p>
                  </div>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-violet-500/25">
                  {(hubMessages[activeChatHub.id] || []).map((msg, idx) => {
                    const isMe = msg.user === (userProfile?.name || "You");
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className={`text-[7px] font-black uppercase tracking-wider mb-1 ${isMe ? 'text-violet-300':'text-[var(--text-dim)]'}`}>
                          {msg.user}
                        </span>
                        <div className={`p-3 rounded max-w-[85%] border text-xs leading-relaxed font-medium ${
                          isMe 
                            ? 'bg-violet-950/40 border-violet-500/35 text-white rounded-br-none shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
                            : msg.user.startsWith('SYSTEM')
                              ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 rounded-bl-none shadow-[0_0_10px_rgba(34,211,238,0.15)] animate-pulse'
                              : 'bg-white/5 border-white/10 text-white/95 rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[6px] text-white/30 uppercase font-black mt-1">{msg.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <div className="p-4 border-t border-white/10 relative z-10 flex-shrink-0 bg-black/60 backdrop-blur-md">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newHubMessageText} 
                      onChange={e => setNewHubMessageText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendHubMessage(activeChatHub.id); }}
                      placeholder="Type tactical message data..."
                      className="flex-1 bg-white/5 rounded px-4 py-3 text-xs font-semibold text-white border border-white/10 focus:outline-none focus:border-violet-500 transition-colors placeholder-white/20"
                    />
                    <button 
                      onClick={() => handleSendHubMessage(activeChatHub.id)}
                      disabled={!newHubMessageText.trim()}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-black px-4 rounded uppercase tracking-widest text-[9px] border border-violet-400/50 shadow-md shadow-violet-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      Transmit ⚡
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };  const renderRanking = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
      <h1 className="text-3xl font-black font-display tracking-tighter uppercase text-center">Leaderboard</h1>

      {/* Podium */}
      <div className="flex justify-center items-end gap-3 pb-4 px-4">
        {[ranking[1], ranking[0], ranking[2]].map((user, i) => {
          if (!user) return null;
          const heights = ['h-28','h-40','h-20'];
          const sizes = ['w-14 h-14','w-20 h-20','w-14 h-14'];
          const labels = ['#2','#1','#3'];
          const isFirst = i===1;
          return (
            <div key={user.rank} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedHunter(user)}>
              {isFirst && <Trophy className="text-[var(--acc-primary)] w-8 h-8 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"/>}
              <div className={`${sizes[i]} rounded ${isFirst ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/40' : 'bg-white/5 border border-[var(--border-color)]'} flex items-center justify-center font-black ${isFirst?'text-black text-xl':'text-sm'} mb-2`}>
                {user.avatar}
              </div>
              <p className="text-[9px] font-black uppercase tracking-tight text-center mb-2 max-w-[60px] truncate">{user.name.split(' ')[0]}</p>
              <div className={`${heights[i]} w-20 bg-white/5 backdrop-blur-xl rounded-t border-t border-l border-r border-[var(--border-color)] flex flex-col justify-end p-3 ${isFirst?'relative':''}`}>
                {isFirst && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded"/>}
                <span className={`text-center font-black text-lg uppercase ${isFirst?'text-[var(--acc-primary)]':'text-[var(--text-dim)]'}`}>{labels[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* WEEKLY GUILD RANKING REWARDS */}
      <div className="glass-card p-6 border border-cyan-500/25 relative overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-300 text-[8px] font-black uppercase px-3 py-1 rounded-bl border-l border-b border-cyan-500/20">
          Rank Status: Active
        </div>
        <h3 className="text-sm font-black font-display uppercase text-white mb-1 flex items-center gap-2">
          🏆 GUILD RANK REWARDS
        </h3>
        <p className="text-[9px] text-[var(--text-dim)] uppercase font-semibold leading-relaxed mb-4">
          Maintain your rank in the hunter guilds to claim weekly prize vouchers! Rewards scale based on your tier.
        </p>
        
        <div className="bg-white/5 border border-white/10 p-4 rounded flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎫</span>
            <div>
              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest block">Active Hunter Tier</span>
              <h4 className="font-black text-xs uppercase tracking-tight text-white mt-0.5">A-Rank Weekly Hunter Pack</h4>
              <p className="text-[8px] text-[var(--text-dim)] font-medium">Grants: 1x A-Rank Gear Voucher (50% Off Merchandise)</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              const code = "ARANK" + Math.floor(Math.random() * 9000 + 1000);
              const newVoucher = {
                id: 'v_' + Date.now(),
                name: "A-Rank Guild Rank reward (50% Off)",
                code: code,
                type: "Merch",
                discount: 50
              };
              setActiveVouchers(prev => [...prev, newVoucher]);
              addToast("REWARD SECURED: Claimed A-Rank Weekly Pack! Gear Voucher active! ⚡", "success");
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.75 },
                colors: ['#22d3ee', '#a855f7']
              });
            }}
            className="w-full md:w-auto px-5 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[9px] shadow-lg shadow-cyan-500/10 active:scale-95 transition-all border border-cyan-400/50"
          >
            Claim Weekly Reward 🎁
          </button>
        </div>
      </div>

      {/* Full List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-[var(--border-color)]">
          {ranking.map(user => (
            <div key={user.rank} className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedHunter(user)}>
              <span className="w-7 text-center font-black text-[var(--text-dim)] italic text-sm">{user.rank}</span>
              <div className="w-11 h-11 bg-white/10 rounded flex items-center justify-center font-black text-xs border border-[var(--border-color)]">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm uppercase tracking-tight truncate">{user.name}</div>
                <div className="text-[10px] text-[var(--acc-primary)] font-bold uppercase">{user.points.toLocaleString()} XP</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleFollow(user.name); }}
                className={`px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                  user.isFollowed ? 'bg-white/5 text-[var(--text-dim)] border border-[var(--border-color)]' : 'bg-white text-black shadow-lg hover:scale-105'
                }`}>{user.isFollowed ? 'Following' : 'Follow'}</button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Profile
  // ----------------------------------------------------
  // ——— Awake/summon shadow helper ——————————————————————————————————————————————————————————————————————
  const handleAriseSummon = (shadowName: string) => {
    // Play a massive gold/purple/cyan confetti explosion!
    const end = Date.now() + (2 * 1000);
    const interval = setInterval(function() {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#a855f7', '#c084fc', '#22d3ee', '#1e1b4b']
      });
    }, 200);

    // Apply stats boosts permanently!
    const config = SHADOW_SOLDIERS_CONFIG.find(s => s.name === shadowName);
    if (config?.statsBoost) {
      setStats(prev => {
        const next = { ...prev };
        Object.entries(config.statsBoost).forEach(([k, v]) => {
          next[k as keyof typeof stats] += v;
        });
        return next;
      });
    }

    setShadows(prev => [...prev, shadowName]);
    setAriseCinematicShadow(null);
    addToast(`SHADOW EXTRACTED: ${shadowName} has joined your Shadow Army! ðŸ‘‘`, 'success');
  };

  // ----------------------------------------------------
  // RENDER: Profile
  // ----------------------------------------------------
  const renderProfile = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-tr from-violet-500 to-cyan-400 rounded p-1 shadow-2xl shadow-violet-500/20">
            <div className="w-full h-full bg-black/40 backdrop-blur-xl rounded flex items-center justify-center">
              <User size={52} className="text-violet-300"/>
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-white rounded p-1.5 border-4 border-[var(--bg-primary)]">
            <Camera size={14} className="text-black"/>
          </div>
        </div>
        <div className="text-center mt-5">
          <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white">{userProfile?.name || 'Athlete'}</h2>
          <p className="text-violet-400 text-xs font-black uppercase tracking-widest mt-1">
            ⚔️ {getHunterRank(userProfile?.level || 1)} • LVL {userProfile?.level || 1}
          </p>
          <div className="flex gap-2 justify-center mt-2 flex-wrap">
            {(() => {
              // Deduplicate and clean shadow names to prevent duplicates from corrupted historical states
              const uniqueCleanShadows = Array.from(new Set(
                shadows.map((sh: any) => {
                  // Keep only plain letters for shadow names
                  return sh.replace(/[^a-zA-Z]/g, '').trim();
                }).filter(Boolean)
              ));

              return uniqueCleanShadows.map((sh: any, i: number) => (
                <span key={i} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-md border border-violet-500/30">
                  <User size={8} className="text-violet-400" />
                  {sh}
                </span>
              ));
            })()}
            {(() => {
              // Clean up and deduplicate standard quest badges
              const rawBadges = userProfile?.badges || [];
              const uniqueCleanBadges = Array.from(new Set(
                rawBadges.map((b: any) => {
                  // Keep letters and spaces, strip all weird double-byte characters
                  return b.replace(/[^a-zA-Z\s]/g, '').trim();
                }).filter(Boolean)
              ));

              // Filter out badges that might correspond to shadow names
              const cleanShadowNames = shadows.map((sh: any) => sh.replace(/[^a-zA-Z]/g, '').toLowerCase().trim());
              const filteredBadges = uniqueCleanBadges.filter((badge: any) => {
                const cleanBadgeName = badge.toLowerCase().trim();
                return !cleanShadowNames.includes(cleanBadgeName);
              });

              return filteredBadges.map((badge: any, i: number) => (
                <span key={i} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-md border border-cyan-500/25">
                  <Trophy size={8} className="text-yellow-500" />
                  {badge}
                </span>
              ));
            })()}
          </div>
          <div className="mt-4 px-10">
            <div className="h-1.5 w-full bg-white/5 rounded overflow-hidden border border-white/5">
              <motion.div initial={{ width:0 }} animate={{ width:`${((userProfile?.xp||0) % 1000)/10}%` }}
                className="h-full bg-violet-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"/>
            </div>
            <div className="flex justify-between mt-1 text-[8px] font-black uppercase text-[var(--text-dim)]">
              <span>{(userProfile?.xp||0) % 1000} XP</span>
              <span>1000 XP to next level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-around glass-card p-6">
        {[
          { label:'Hunter Rank', val: getHunterRank(userProfile?.level||1).split(' ')[0] },
          { label:'Shadow Army', val: shadows.length },
          { label:'Dungeons Cleared', val: challenges.filter(c=>c.isCompleted).length },
        ].map((s, i) => (
          <React.Fragment key={s.label}>
            {i>0 && <div className="w-px h-10 bg-[var(--border-color)]"/>}
            <div className="text-center">
              <div className="font-black text-xl font-display text-white">{s.val}</div>
              <div className="text-[9px] text-[var(--text-dim)] uppercase font-black tracking-tighter">{s.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* THE SYSTEM: STATUS BOARD */}
      <div className="glass-card p-6 space-y-4 border border-violet-500/20 monarch-glow">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <div>
            <h3 className="text-xs font-black text-violet-400 font-display uppercase tracking-widest">THE SYSTEM</h3>
            <h4 className="text-[10px] text-[var(--text-dim)] uppercase font-bold">Status Window</h4>
          </div>
          <div className="bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded text-right">
            <span className="text-[9px] font-black uppercase text-violet-300">Points: </span>
            <span className="text-[11px] font-black text-white">{statPoints}</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { id: 'strength',     abbr: 'STR', label: 'Strength',     val: stats.strength,     desc: 'Power & training potential (+STR)' },
            { id: 'agility',      abbr: 'AGI', label: 'Agility',      val: stats.agility,      desc: 'Speed & step efficiency (+AGI)' },
            { id: 'vitality',     abbr: 'VIT', label: 'Vitality',     val: stats.vitality,     desc: 'Sleep recovery & wellness (+VIT)' },
            { id: 'intelligence', abbr: 'INT', label: 'Intelligence', val: stats.intelligence, desc: 'Focus & meditation capacity (+INT)' },
            { id: 'perception',   abbr: 'SEN', label: 'Sense',        val: stats.perception,   desc: 'Hydration & physical awareness (+SEN)' },
          ].map(stat => (
            <div key={stat.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded border border-white/5 hover:border-violet-500/20 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-violet-400 w-8">{stat.abbr}</span>
                  <span className="text-xs font-bold text-white">{stat.label}</span>
                </div>
                <p className="text-[8px] text-[var(--text-dim)] font-medium">{stat.desc}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-black font-display text-white w-6 text-center">{stat.val}</span>
                <button
                  disabled={statPoints <= 0}
                  onClick={() => {
                    if (statPoints <= 0) return;
                    setStats(prev => ({ ...prev, [stat.id]: prev[stat.id as keyof typeof stats] + 1 }));
                    setStatPoints(prev => prev - 1);
                    addToast(`Stat Leveled Up: +1 ${stat.abbr}! ⚡`, 'success');
                    confetti({
                      particleCount: 25,
                      spread: 40,
                      origin: { y: 0.8 },
                      colors: ['#a855f7', '#c084fc']
                    });
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm border transition-all ${
                    statPoints > 0 
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500 hover:text-black cursor-pointer' 
                      : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHADOW ARMY PORTAL */}
      <div className="glass-card p-6 space-y-4 border border-violet-500/10">
        <div>
          <h3 className="text-xs font-black text-violet-400 font-display uppercase tracking-widest">SHADOW ARMY</h3>
          <h4 className="text-[10px] text-[var(--text-dim)] uppercase font-bold">Monarch Summoning Gates</h4>
        </div>

        <div className="space-y-4">
          {SHADOW_SOLDIERS_CONFIG.map(s => {
            const isExtracted = shadows.includes(s.name);
            const avgStats = (stats.strength + stats.agility + stats.vitality + stats.intelligence + stats.perception) / 5;
            const isAvailable = !isExtracted && avgStats >= s.requiredAvg;
            const isLocked = !isExtracted && avgStats < s.requiredAvg;

            return (
              <div 
                key={s.name} 
                className={`p-4 rounded border transition-all flex flex-col gap-3 ${
                  isExtracted 
                    ? 'bg-violet-950/15 border-violet-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : isAvailable 
                      ? 'bg-violet-500/10 border-violet-400 border-dashed animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                      : 'bg-white/5 border-white/5 opacity-55'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded flex items-center justify-center text-3xl border ${
                    isExtracted 
                      ? 'bg-violet-500/20 border-violet-500/45 text-violet-300' 
                      : 'bg-white/5 border-white/5 text-[rgba(255,255,255,0.25)]'
                  }`}>
                    {(() => {
                      if (!isExtracted) return <span className="text-xl">🔒</span>;
                      const cleanName = s.name.toLowerCase();
                      if (cleanName.includes('tank')) return <Flame className="text-cyan-400 animate-pulse" size={24} />;
                      if (cleanName.includes('igris')) return <Target className="text-red-500 animate-pulse" size={24} />;
                      if (cleanName.includes('iron')) return <Dumbbell className="text-blue-400" size={24} />;
                      if (cleanName.includes('tusk')) return <Zap className="text-yellow-400" size={24} />;
                      if (cleanName.includes('beru')) return <Award className="text-violet-400 animate-pulse" size={24} />;
                      if (cleanName.includes('bellion')) return <Trophy className="text-amber-400 animate-bounce" size={24} />;
                      return <Star className="text-white" size={24} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-black text-sm uppercase tracking-tight ${isExtracted ? 'text-white' : 'text-[var(--text-dim)]'}`}>{s.name}</h4>
                      <span className="text-[7px] font-black uppercase bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">
                        {s.grade}
                      </span>
                    </div>
                    <p className="text-[9px] text-[var(--text-dim)] font-medium leading-relaxed mt-0.5">
                      {isExtracted ? s.desc : `Required Avg Stat: ${s.requiredAvg.toFixed(1)} overall (Current: ${avgStats.toFixed(1)})`}
                    </p>
                  </div>
                </div>

                {isExtracted && (
                  <div className="flex items-center justify-between bg-violet-950/30 border border-violet-500/20 px-3 py-1.5 rounded">
                    <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">Active Monarch Boost</span>
                    <span className="text-[9px] font-black text-white">{s.boost}</span>
                  </div>
                )}

                {isAvailable && (
                  <button 
                    onClick={() => {
                      setAriseCinematicShadow(s.name);
                      confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.5 },
                        colors: ['#a855f7', '#120224']
                      });
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-3 rounded uppercase tracking-widest text-[10px] shadow-lg shadow-violet-500/20 cursor-pointer transition-all border border-violet-400 active:scale-95 flex items-center justify-center gap-2"
                  >
                    🌌 Extract Shadow ("ARISE")
                  </button>
                )}

                {isLocked && (
                  <div className="w-full bg-white/5 border border-white/5 text-[9px] text-[var(--text-dim)] font-black uppercase text-center py-2.5 rounded tracking-widest">
                    🔒 LOCKED — NEED AVG {s.requiredAvg.toFixed(1)} OVERALL STATS
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme selector */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">App Theme</h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id:'monarch' as Theme, bg:'bg-violet-950/40 border-violet-500/30', label:'Monarch', icon:<Flame size={14} className="text-violet-400 animate-pulse"/> },
            { id:'dark' as Theme, bg:'bg-zinc-900', label:'Dark Code', icon:<Moon size={14} className="text-cyan-400"/> },
            { id:'light' as Theme, bg:'bg-white', label:'Light', icon:<Sun size={14} className="text-orange-500"/> },
            { id:'orange' as Theme, bg:'bg-orange-500', label:'Amber', icon:<Flame size={14} className="text-white"/> },
          ]).map(t => (
            <button key={t.id} onClick={() => handleUpdateTheme(t.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded border-2 transition-all ${
                theme===t.id ? 'border-[var(--acc-primary)] scale-105 shadow-lg' : 'border-white/10 opacity-50'
              } ${t.bg}`}>
              <span>{t.icon}</span>
              <span className={`text-[8px] font-black uppercase ${theme==='light'?'text-black':'text-white'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Preferences</h3>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
          <span className="text-[10px] font-black uppercase">Biometric Sync</span>
          <div className="w-10 h-5 bg-[var(--acc-primary)] rounded relative">
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded"/>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
          <span className="text-[10px] font-black uppercase">Push Notifications</span>
          <div className="w-10 h-5 bg-[var(--acc-primary)] rounded relative">
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded"/>
          </div>
        </div>
      </div>

      <button onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 py-4 font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-rose-500/20 transition-all">
        <LogOut size={16}/> Sign Out
      </button>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Nutrition
  // ----------------------------------------------------
  const renderNutrition = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
      <h1 className="text-3xl font-black font-display tracking-tighter uppercase">Fuel Matrix</h1>

      {/* Meal Scanner */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black font-display uppercase">Meal Scanner</h3>
          <label className="cursor-pointer bg-[var(--acc-primary)] text-black px-4 py-2 rounded font-black tracking-widest text-[10px] uppercase flex items-center gap-2 hover:scale-105 transition-all">
            <Camera size={16}/>
            Snap Meal
            <input type="file" accept="image/*" className="hidden" onChange={handleMealAnalysis}/>
          </label>
        </div>

        {isAnalyzingMeal ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <motion.div animate={{ scale:[1,1.2,1], opacity:[0.3,1,0.3] }} transition={{ repeat:Infinity, duration:1.5 }}
              className="w-16 h-16 bg-[var(--acc-primary)]/20 rounded flex items-center justify-center">
              <UtensilsCrossed size={32} className="text-[var(--acc-primary)]"/>
            </motion.div>
            <p className="text-[10px] font-black uppercase text-[var(--text-dim)] tracking-widest animate-pulse">Analyzing macros…</p>
          </div>
        ) : mealAnalysis ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label:'CAL', val:mealAnalysis.calories, unit:'', color:'text-white' },
                { label:'PRO', val:mealAnalysis.protein, unit:'g', color:'text-indigo-400' },
                { label:'CHO', val:mealAnalysis.carbs, unit:'g', color:'text-emerald-400' },
                { label:'FAT', val:mealAnalysis.fats, unit:'g', color:'text-amber-400' },
              ].map(m => (
                <div key={m.label} className="bg-white/5 rounded p-3 text-center border border-white/5">
                  <span className="text-[8px] font-black text-[var(--text-dim)] uppercase block mb-1">{m.label}</span>
                  <span className={`text-sm font-black ${m.color}`}>{m.val}{m.unit}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[var(--acc-primary)]/10 rounded border border-[var(--acc-primary)]/20">
              <p className="text-[10px] text-[var(--acc-primary)] font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <Zap size={12}/> Tip
              </p>
              <p className="text-xs text-white/80 font-medium leading-relaxed">{mealAnalysis.tip}</p>
            </div>
            <button onClick={() => setMealAnalysis(null)} className="text-[10px] font-black text-[var(--text-dim)] uppercase hover:text-[var(--text-main)]">
              Clear
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded border border-dashed border-white/10 opacity-40">
            <UtensilsCrossed size={36} className="mb-2"/>
            <p className="text-[10px] font-black uppercase text-center">Snap a photo to analyze macros</p>
          </div>
        )}
      </div>

      {/* Grocery & Cheat Planner */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={handleGroceryGenerate} className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-all border-none">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded"><ShoppingCart size={24}/></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Grocery List</span>
        </button>
        <button onClick={handleCheatPlanGenerate} className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-all border-none">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded"><Trophy size={24}/></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Cheat Day Plan</span>
        </button>
      </div>

      {/* FULLSCREEN QUEST PROTOCOL POPUP (NUTRITION / FUEL) */}
      <AnimatePresence>
        {(groceryList || cheatPlan) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[140] bg-black/95 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-radial-gradient from-amber-955/20 via-transparent to-transparent pointer-events-none"/>
            <div className="absolute top-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded blur-[120px] animate-pulse pointer-events-none"/>
            
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-full max-h-[85vh] glass-card p-8 border-2 border-amber-500/40 relative z-10 flex flex-col items-center overflow-hidden bg-black/85"
            >
              {/* Tactical HUD Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.04)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-60"/>
              
              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-sm shadow-[0_0_5px_rgba(245,158,11,0.5)]"/>
              <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-sm shadow-[0_0_5px_rgba(245,158,11,0.5)]"/>
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-sm shadow-[0_0_5px_rgba(245,158,11,0.5)]"/>
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-sm shadow-[0_0_5px_rgba(245,158,11,0.5)]"/>

              {/* Quest Header */}
              <div className="space-y-1 w-full text-center relative z-10 flex-shrink-0">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.25em] font-mono block">
                  ── SYSTEM: NUTRITION STRATEGY ──
                </span>
                <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white animate-pulse">
                  {groceryList ? 'INVENTORY PROVISIONS' : 'CHEAT DAY STRATEGY'}
                </h2>
                <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto my-2"/>
              </div>

              {/* Scrollable Quest Details */}
              <div className="flex-1 w-full overflow-y-auto text-left relative z-10 py-4 px-2 space-y-4 text-xs scrollbar-thin scrollbar-thumb-amber-500/20">
                <div className="prose prose-invert max-w-none prose-sm prose-p:text-amber-100/80 prose-headings:text-amber-300 prose-headings:uppercase prose-headings:font-display prose-headings:tracking-wider prose-li:text-amber-100/70">
                  {groceryList ? (
                    <div>
                      <h4 className="text-xs font-black text-amber-400 uppercase">Weekly Inventory List</h4>
                      <ReactMarkdown>{groceryList}</ReactMarkdown>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-black text-amber-400 uppercase">Cheat Recovery Parameters</h4>
                      <ReactMarkdown>{cheatPlan}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="w-full space-y-2 relative z-10 pt-4 border-t border-amber-500/20 flex-shrink-0">
                <button
                  onClick={() => { setGroceryList(null); setCheatPlan(null); }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black py-4 rounded uppercase tracking-[0.2em] text-xs shadow-lg shadow-amber-500/30 cursor-pointer border border-amber-400/50 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  ⚡ Synthesize Inventory Data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏬 GUILD REAL SUPPLY MARKETPLACE (INR/USD E-COMMERCE DEPT) */}
      <div className="glass-card p-6 space-y-5 border border-cyan-500/20 monarch-glow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xs font-black text-cyan-400 font-display uppercase tracking-widest">GUILD SUPPLY DEPT</h3>
            <h4 className="text-[10px] text-[var(--text-dim)] uppercase font-bold">Real-World Gear & Fuels</h4>
          </div>
          <div className="bg-cyan-500/10 text-cyan-300 text-[8px] font-black uppercase px-2.5 py-1 rounded border border-cyan-500/25 tracking-widest">
            {activeVouchers.length} Ranking Vouchers Active
          </div>
        </div>

        <div className="p-3 bg-white/5 border border-white/5 rounded text-[9px] text-[var(--text-dim)] font-black uppercase tracking-wider leading-relaxed">
          💡 Use your Leaderboard Reward Vouchers during checkout to claim discounts up to 100% off gym gear, shirts, and protein bars!
        </div>

        {/* Real Marketplace Items Catalog */}
        <div className="space-y-4">
          {[
            { id: 'm1', name: "Monarch Elixir Protein Bar", priceInr: 250, priceUsd: 2.99, type: "Fuel", icon: "🍫", desc: "Pure high-protein isolate bar. Real delivery to your home." },
            { id: 'm2', name: "Beru's Shadow Shake (Pack of 6)", priceInr: 1200, priceUsd: 14.99, type: "Fuel", icon: "🥤", desc: "Premium chocolate whey blend. Perfect post-workout recovery." },
            { id: 'm3', name: "Ahjin Guild Oversized Tee", priceInr: 1800, priceUsd: 21.99, type: "Merch", icon: "👕", desc: "100% heavy combat cotton pump cover. Official Ahjin Guild Crest." },
            { id: 'm4', name: "Igris's Combat lifting Straps", priceInr: 990, priceUsd: 11.99, type: "Merch", icon: "🏋️‍♂️", desc: "Heavy-duty lifting straps. Boost your physical grip strength." },
            { id: 'm5', name: "Iron's Weightlifting Belt", priceInr: 3200, priceUsd: 38.99, type: "Merch", icon: "🥋", desc: "Full-grain thick leather belt. Provides absolute core security." }
          ].map(item => {
            const usableVoucher = activeVouchers.find(v => v.type === item.type || v.type === 'Merch' && item.type === 'Merch');
            const discount = usableVoucher ? usableVoucher.discount : 0;
            
            const finalInr = Math.max(0, Math.floor(item.priceInr * (1 - discount / 100)));
            const finalUsd = Number(Math.max(0, item.priceUsd * (1 - discount / 100)).toFixed(2));

            return (
              <div key={item.id} className="p-4 bg-white/5 rounded border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-cyan-500/20 transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-white/5 border border-white/5 rounded p-2 flex items-center justify-center w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform">{item.icon}</span>
                  <div>
                    <h5 className="text-xs font-black uppercase text-white tracking-tight">{item.name}</h5>
                    <p className="text-[9px] text-[var(--text-dim)] font-medium mt-0.5">{item.desc}</p>
                    {usableVoucher && (
                      <span className="text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-1 inline-block">
                        Voucher Active: {usableVoucher.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[8px] font-black text-[var(--text-dim)] uppercase block">Price</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      {usableVoucher && (
                        <span className="text-[9px] line-through text-[var(--text-dim)]">₹{item.priceInr} / ${item.priceUsd}</span>
                      )}
                      <span className="text-xs font-black text-cyan-400">₹{finalInr} / ${finalUsd}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutItem({
                        ...item,
                        finalInr,
                        finalUsd,
                        appliedVoucher: usableVoucher
                      });
                      setShippingName(userProfile?.name || '');
                    }}
                    className="px-5 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[9px] shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-95 transition-all border border-cyan-400/50 w-full md:w-auto text-center"
                  >
                    🛒 Purchase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📦 ACTIVE CARGO DISPATCHES (DELIVERY TRACKING MODULE) */}
      <div className="glass-card p-6 space-y-4 border border-violet-500/20">
        <div>
          <h3 className="text-xs font-black text-violet-400 font-display uppercase tracking-widest">📦 ACTIVE CARGO DISPATCHES</h3>
          <h4 className="text-[10px] text-[var(--text-dim)] uppercase font-bold">Real-World Order & Delivery Tracker</h4>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-8 bg-white/5 rounded border border-dashed border-white/5 text-center text-[var(--text-dim)] uppercase font-black text-[9px] tracking-widest">
            No active shipments in transit. Acquire supplies to initiate cargo dispatches!
          </div>
        ) : (
          <div className="space-y-5">
            {activeOrders.map((order, idx) => (
              <div key={order.orderId} className="p-4 bg-violet-950/15 border border-violet-500/25 rounded relative overflow-hidden space-y-4">
                <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                  <div>
                    <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest block">Cargo ID</span>
                    <h5 className="font-black text-xs text-white">{order.orderId}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-[var(--text-dim)] uppercase block">Expected Arrival</span>
                    <span className="font-black text-[10px] text-cyan-400">{order.eta}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">{order.icon}</span>
                  <div>
                    <h6 className="font-black text-xs text-white uppercase">{order.name}</h6>
                    <p className="text-[8px] text-[var(--text-dim)] font-medium">Recipient Address: {order.address}, {order.city}</p>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-[7px] font-black uppercase text-[var(--text-dim)]">
                    <span className={order.statusIndex >= 0 ? "text-violet-300 font-bold" : ""}>Synthesized 🟢</span>
                    <span className={order.statusIndex >= 1 ? "text-violet-300 font-bold" : ""}>In Transit 🚚</span>
                    <span className={order.statusIndex >= 2 ? "text-violet-300 font-bold" : ""}>Out for Delivery 🏠</span>
                    <span className={order.statusIndex >= 3 ? "text-emerald-400 font-bold animate-pulse" : ""}>Deposited 🎁</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      style={{ width: `${(order.statusIndex + 1) * 25}%` }}
                    />
                  </div>
                  <p className="text-[8px] text-violet-400 font-black uppercase text-center tracking-widest animate-pulse mt-1">
                    Status: {order.statusText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🛒 REAL-WORLD ORDER CHECKOUT MODAL */}
      <AnimatePresence>
        {checkoutItem && (
          <motion.div 
            initial={{ opacity:0 }} 
            animate={{ opacity:1 }} 
            exit={{ opacity:0 }}
            style={{ background: 'rgba(0,0,0,0.85)' }} 
            onClick={() => setCheckoutItem(null)}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale:0.92, opacity:0, y:20 }} 
              animate={{ scale:1, opacity:1, y:0 }} 
              exit={{ scale:0.92, opacity:0, y:20 }}
              onClick={e => e.stopPropagation()}
              className="quest-panel w-full max-w-md max-h-[85vh] flex flex-col monarch-glow bg-black border border-cyan-500/30"
            >
              <div className="quest-corner quest-corner--tl"/>
              <div className="quest-corner quest-corner--tr"/>
              <div className="quest-corner quest-corner--bl"/>
              <div className="quest-corner quest-corner--br"/>
              <div className="quest-side-clip quest-side-clip--left"/>
              <div className="quest-side-clip quest-side-clip--right"/>
              <div className="quest-grid-bg"/>
              <div className="quest-top-bar"/>

              {/* Close Button */}
              <button className="quest-close-btn" onClick={() => setCheckoutItem(null)}>X</button>

              <div className="p-6 border-b border-white/10 flex items-center gap-3 relative z-10 flex-shrink-0">
                <span className="text-3xl">{checkoutItem.icon}</span>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight text-white">{checkoutItem.name}</h3>
                  <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest">Guild Checkout Gateway • Secure 🔒</p>
                </div>
              </div>

              {/* Scrollable Order Details & Shipping Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-cyan-500/25">
                
                {/* Product Summary */}
                <div className="bg-white/5 p-4 rounded border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span className="text-[var(--text-dim)] uppercase">Subtotal:</span>
                    <span>₹{checkoutItem.priceInr} / ${checkoutItem.priceUsd}</span>
                  </div>
                  {checkoutItem.appliedVoucher && (
                    <div className="flex justify-between text-xs font-bold text-emerald-400">
                      <span className="uppercase">Voucher Discount ({checkoutItem.appliedVoucher.discount}%):</span>
                      <span>-₹{Math.floor(checkoutItem.priceInr * (checkoutItem.appliedVoucher.discount / 100))} / -${(checkoutItem.priceUsd * (checkoutItem.appliedVoucher.discount / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-cyan-300 border-t border-white/10 pt-2.5 mt-2">
                    <span className="uppercase">Total Payable Amount:</span>
                    <span>₹{checkoutItem.finalInr} / ${checkoutItem.finalUsd}</span>
                  </div>
                </div>

                {/* Shipping Details Title */}
                <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mt-4">📋 ENTER SHIPPING ADDRESS DETAILS</h4>
                
                {/* Form fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-dim)] uppercase block">Recipient Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={shippingName} 
                      onChange={e => setShippingName(e.target.value)}
                      placeholder="e.g. Hunter Sung Jin-Woo"
                      className="w-full bg-white/5 rounded px-3 py-2.5 text-xs text-white border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors placeholder-white/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-[var(--text-dim)] uppercase block">Street Address</label>
                    <input 
                      type="text" 
                      required
                      value={shippingAddress} 
                      onChange={e => setShippingAddress(e.target.value)}
                      placeholder="e.g. 12/B Ahjin Tower, Guild Street"
                      className="w-full bg-white/5 rounded px-3 py-2.5 text-xs text-white border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors placeholder-white/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-dim)] uppercase block">City</label>
                      <input 
                        type="text" 
                        required
                        value={shippingCity} 
                        onChange={e => setShippingCity(e.target.value)}
                        placeholder="e.g. Seoul / Bangalore"
                        className="w-full bg-white/5 rounded px-3 py-2.5 text-xs text-white border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors placeholder-white/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-[var(--text-dim)] uppercase block">Zip / Postal Code</label>
                      <input 
                        type="text" 
                        required
                        value={shippingZip} 
                        onChange={e => setShippingZip(e.target.value)}
                        placeholder="e.g. 560001"
                        className="w-full bg-white/5 rounded px-3 py-2.5 text-xs text-white border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors placeholder-white/20"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Complete Secure Checkout Action */}
              <div className="p-4 border-t border-white/10 relative z-10 flex-shrink-0 bg-black/60 backdrop-blur-md">
                <button
                  disabled={!shippingName.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingZip.trim()}
                  onClick={() => {
                    const orderId = "#AHJ-" + Math.floor(Math.random() * 90000 + 10000);
                    
                    const etaDate = new Date();
                    etaDate.setDate(etaDate.getDate() + 4);
                    const formattedEta = etaDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                    const newOrder = {
                      orderId,
                      name: checkoutItem.name,
                      icon: checkoutItem.icon,
                      eta: formattedEta,
                      address: shippingAddress,
                      city: shippingCity,
                      statusIndex: 0,
                      statusText: "Synthesized & Registered in Dispatch Grid 🟢"
                    };

                    setActiveOrders(prev => [newOrder, ...prev]);
                    setCheckoutItem(null);
                    
                    if (checkoutItem.appliedVoucher) {
                      setActiveVouchers(prev => prev.filter(v => v.id !== checkoutItem.appliedVoucher.id));
                    }

                    setShippingAddress('');
                    setShippingCity('');
                    setShippingZip('');

                    addToast(`SYSTEM ORDER PLACED! ${checkoutItem.name} purchased successfully! Tracking ID: ${orderId} 🚚`, 'success');
                    confetti({
                      particleCount: 150,
                      spread: 90,
                      origin: { y: 0.7 },
                      colors: ['#22d3ee', '#3b82f6', '#ffffff']
                    });

                    // Simulated dispatch steps
                    setTimeout(() => {
                      setActiveOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, statusIndex: 1, statusText: "Handed over to Courier Guild (In Transit) 🚚" } : o));
                    }, 5000);

                    setTimeout(() => {
                      setActiveOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, statusIndex: 2, statusText: "Arrived at Local Hub (Out for Delivery) 🏠" } : o));
                    }, 12000);

                    setTimeout(() => {
                      setActiveOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, statusIndex: 3, statusText: "Deposited Securely at Destination 🎁" } : o));
                    }, 22000);
                  }}
                  className={`w-full font-black py-4 rounded uppercase tracking-[0.2em] text-[10px] border transition-all flex items-center justify-center gap-1.5 ${
                    (shippingName.trim() && shippingAddress.trim() && shippingCity.trim() && shippingZip.trim())
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400/50 shadow-lg shadow-cyan-500/25 active:scale-98 cursor-pointer'
                      : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                >
                  💳 AUTHORIZE DISPATCH (₹{checkoutItem.finalInr} / ${checkoutItem.finalUsd})
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Water Tracker (NEW)
  // ----------------------------------------------------
  const renderWater = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setCurrentView('dashboard')} className="p-2 bg-white/5 rounded border border-[var(--border-color)]">
          <Activity size={18}/>
        </button>
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase">Hydration</h1>
      </div>

      <div className="glass-card p-8 flex flex-col items-center space-y-6">
        <Droplets size={64} className={`transition-all ${waterGlasses>=WATER_GOAL ? 'text-blue-400' : 'text-[var(--text-dim)]'}`}/>
        <div className="text-center">
          <span className="text-6xl font-black font-display">{waterGlasses}</span>
          <span className="text-2xl font-black text-[var(--text-dim)]">/{WATER_GOAL}</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mt-1">glasses today</p>
        </div>

        {/* Glass grid */}
        <div className="grid grid-cols-4 gap-3 w-full">
          {Array.from({length: WATER_GOAL}).map((_,i) => (
            <div key={i} className={`aspect-square rounded border-2 flex items-center justify-center transition-all ${
              i < waterGlasses ? 'bg-blue-400/20 border-blue-400 text-blue-400' : 'bg-white/5 border-[var(--border-color)] text-[var(--text-dim)] opacity-40'
            }`}>
              <Droplets size={20}/>
            </div>
          ))}
        </div>

        <div className="w-full h-2 bg-white/5 rounded overflow-hidden">
          <motion.div animate={{ width:`${(waterGlasses/WATER_GOAL)*100}%` }} className="h-full bg-blue-400 rounded"/>
        </div>

        <button onClick={addWater}
          className="w-full bg-blue-400 text-black font-black py-4 rounded uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus size={20}/> Add Glass
        </button>
        {waterGlasses > 0 && (
          <button onClick={() => setWaterGlasses(Math.max(0,waterGlasses-1))}
            className="text-[10px] font-black text-[var(--text-dim)] uppercase hover:text-[var(--text-main)]">Undo last</button>
        )}
      </div>

      <div className="glass-card p-5 space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Why hydration matters</h3>
        <p className="text-xs leading-relaxed text-[var(--text-dim)] font-medium">
          Drinking enough water boosts metabolism, aids muscle recovery, improves focus, and regulates body temperature during exercise. Aim for 8 glasses (â‰ˆ2L) daily.
        </p>
      </div>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Sleep Tracker (NEW)
  // ----------------------------------------------------
  const renderSleep = () => (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setCurrentView('dashboard')} className="p-2 bg-white/5 rounded border border-[var(--border-color)]">
          <Activity size={18}/>
        </button>
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase">Sleep</h1>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setSleepHours(h => Math.max(0,+(h-0.5).toFixed(1)))} className="w-12 h-12 bg-white/5 rounded flex items-center justify-center hover:bg-white/10">
            <ChevronDown size={20}/>
          </button>
          <div className="text-center">
            <span className="text-6xl font-black font-display">{sleepHours}</span>
            <span className="text-2xl font-black text-[var(--text-dim)]">h</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mt-1">last night</p>
          </div>
          <button onClick={() => setSleepHours(h => Math.min(12,+(h+0.5).toFixed(1)))} className="w-12 h-12 bg-white/5 rounded flex items-center justify-center hover:bg-white/10">
            <ChevronUp size={20}/>
          </button>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-3">Sleep Quality</p>
          <div className="grid grid-cols-4 gap-2">
            {(['poor','fair','good','great'] as const).map(q => (
              <button key={q} onClick={() => setSleepQuality(q)}
                className={`py-2 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                  sleepQuality===q ? 'bg-indigo-400/20 border-indigo-400 text-indigo-400' : 'bg-white/5 border-[var(--border-color)] text-[var(--text-dim)] opacity-50'
                }`}>{q}</button>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded border flex items-start gap-3 ${
          sleepHours < 6 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
          sleepHours < 7 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
          <p className="text-[11px] font-medium">
            {sleepHours < 6 ? 'You\'re sleep-deprived. Aim for 7–9h for optimal recovery and performance.' :
             sleepHours < 7 ? 'Slightly below optimal. An extra hour can significantly boost your workouts.' :
             'Great sleep! Your body is primed for high performance today.'}
          </p>
        </div>
      </div>

      {/* 7-day sleep chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-black font-display uppercase tracking-tight mb-4">7-Day Sleep History</h3>
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_SLEEP_DATA} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill:'rgba(255,255,255,0.2)', fontSize:10, fontWeight:900 }} dy={10}/>
              <YAxis hide domain={[0,10]}/>
              <Tooltip contentStyle={{ backgroundColor:'rgba(5,6,10,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }}
                itemStyle={{ color:'#818cf8', fontWeight:'900', fontSize:'12px' }}
                labelStyle={{ color:'rgba(255,255,255,0.5)', fontSize:'10px' }}/>
              <Area type="monotone" dataKey="hours" stroke="#818cf8" fill="url(#sleepGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );

  // ----------------------------------------------------
  // RENDER: Router
  // ----------------------------------------------------
  const renderView = () => {
    if (isLoading && currentView !== 'water' && currentView !== 'sleep') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <motion.div animate={{ rotate:360 }} transition={{ duration:1.2, repeat:Infinity, ease:'linear' }}>
            <Activity size={40} className="text-[var(--acc-primary)]"/>
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Loading your data…</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'workouts':  return renderWorkouts();
      case 'community': return renderCommunity();
      case 'ranking':   return renderRanking();
      case 'profile':   return renderProfile();
      case 'nutrition': return renderNutrition();
      case 'water':     return renderWater();
      case 'sleep':     return renderSleep();
      default: return null;
    }
  };

  // ----------------------------------------------------
  // MAIN RENDER
  // ----------------------------------------------------
  return (
    <div className={`max-w-md mx-auto min-h-screen relative flex flex-col font-sans overflow-hidden theme-${theme}`}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[var(--bg-primary)]">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-cyan-500/10 rounded blur-[100px]"/>
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-violet-600/10 rounded blur-[120px]"/>
      </div>

      {/* Network Error Banner */}
      {networkError && isLoggedIn && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-500/20 border-b border-rose-500/30 px-4 py-2 flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest max-w-md mx-auto">
          <WifiOff size={12}/> Offline — showing cached data
          <button onClick={fetchAllData} className="ml-auto"><RefreshCw size={12}/></button>
        </div>
      )}

      {/* Toast */}
      <ToastContainer toasts={toasts} remove={removeToast}/>

      {/* Scrollable Content */}
      <div className={`flex-1 p-6 pb-28 overflow-y-auto relative z-10 ${networkError && isLoggedIn ? 'pt-12' : ''}`}>
        <AnimatePresence mode="wait">
          {!isLoggedIn ? renderAuth() : renderView()}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      {isLoggedIn && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] glass-nav p-2 flex items-center justify-around z-50 shadow-2xl">
          <NavButton active={currentView==='dashboard'} onClick={() => setCurrentView('dashboard')} icon={<Activity size={20}/>} label="Stats"/>
          <NavButton active={currentView==='workouts'}  onClick={() => setCurrentView('workouts')}  icon={<Dumbbell size={20}/>} label="AI"/>
          <NavButton active={currentView==='nutrition'} onClick={() => setCurrentView('nutrition')} icon={<UtensilsCrossed size={20}/>} label="Fuel"/>
          <NavButton active={currentView==='community'} onClick={() => setCurrentView('community')} icon={<Users size={20}/>} label="Social"/>
          <NavButton active={currentView==='ranking'}   onClick={() => setCurrentView('ranking')}   icon={<Trophy size={20}/>} label="Ranks"/>
          <NavButton active={currentView==='profile'}   onClick={() => setCurrentView('profile')}   icon={<User size={20}/>} label="Me"/>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
           SOLO LEVELING — DAILY QUEST INFO PANEL (FULLSCREEN MODAL)
           ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDailyQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: -25 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="quest-panel w-full max-w-sm max-h-[90vh] flex flex-col"
            >
              {/* Metallic corner clips */}
              <div className="quest-corner quest-corner--tl"/>
              <div className="quest-corner quest-corner--tr"/>
              <div className="quest-corner quest-corner--bl"/>
              <div className="quest-corner quest-corner--br"/>
              
              {/* Side metallic bracket clips */}
              <div className="quest-side-clip quest-side-clip--left"/>
              <div className="quest-side-clip quest-side-clip--right"/>
              
              {/* Grid background */}
              <div className="quest-grid-bg"/>
              
              {/* Scanning laser line */}
              <div className="quest-scanner"/>
              
              {/* Close button (red X) */}
              <button className="quest-close-btn" onClick={() => setShowDailyQuest(false)}>X</button>
              
              {/* Top decorative bar */}
              <div className="quest-top-bar"/>
              
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto relative z-10 p-6 space-y-4">
                
                {/* Quest Title */}
                <div className="text-center space-y-2 pt-2">
                  <h1 className="quest-title text-2xl font-black uppercase tracking-wider text-[rgba(220,230,255,0.95)]">
                    QUEST INFO
                  </h1>
                  <p className="text-[11px] text-[rgba(150,175,220,0.8)] font-medium tracking-wider">
                    [Daily Quest: Player Training has arrived]
                  </p>
                </div>
                
                <div className="quest-divider"/>
                
                {/* GOAL label */}
                <div className="text-center">
                  <span className="inline-block text-sm font-black uppercase tracking-[0.2em] text-[rgba(200,215,245,0.9)] border-b-2 border-[rgba(140,160,200,0.4)] pb-1 px-4">
                    GOAL
                  </span>
                </div>
                
                <div className="quest-divider"/>

                {activeMotionTracking && (
                  <div className="space-y-2 bg-black/40 p-3 rounded border border-cyan-500/35 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping"/>
                        SYSTEM CAM: {activeMotionTracking.toUpperCase()} ACTIVE
                      </span>
                      <button 
                        onClick={() => setActiveMotionTracking(null)}
                        className="text-[9px] text-red-400 hover:text-red-300 uppercase font-black tracking-widest"
                      >
                        [DEACTIVATE]
                      </button>
                    </div>
                    
                    <div className="relative aspect-video rounded overflow-hidden border border-cyan-500/20 bg-black">
                      <video 
                        ref={videoRef} 
                        style={{ display: 'none' }} 
                        width="320" 
                        height="240" 
                        playsInline 
                        muted
                      />
                      <canvas 
                        ref={canvasRef} 
                        width="320" 
                        height="240" 
                        className="w-full h-full block"
                      />
                    </div>
                    
                    <p className="text-[9px] text-[var(--text-dim)] text-center italic">
                      Stand back so your body is visible in the scanner feed. Perform reps to auto-increment progress!
                    </p>
                  </div>
                )}
                
                <div className="quest-divider"/>
                
                {/* Main quest items */}
                <div className="space-y-0">
                  {DAILY_QUEST_ITEMS.map(q => (
                    <div key={q.key} className="quest-row flex items-center justify-between py-3 px-2">
                      <span className="text-[13px] text-[rgba(200,215,240,0.85)] font-medium">{q.label}</span>
                      <div className="flex items-center gap-2">
                        {(q.key === 'squats' || q.key === 'pushups') && (
                          <button
                            onClick={() => setActiveMotionTracking(activeMotionTracking === q.key ? null : q.key)}
                            className={`px-2 py-1 rounded transition-all text-[9px] font-black uppercase flex items-center gap-1 ${
                              activeMotionTracking === q.key
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                                : 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20'
                            }`}
                            title="Activate System Camera Tracking"
                          >
                            <Camera size={10} />
                            {activeMotionTracking === q.key ? 'Tracking' : 'Cam'}
                          </button>
                        )}
                        <span className="text-[13px] text-[rgba(160,180,215,0.7)] font-mono font-bold ml-1">
                          [{dailyQuestProgress[q.key] || 0}/{q.target}{q.unit}]
                        </span>
                        <button 
                          className="quest-plus-btn"
                          onClick={() => incrementQuest(q.key, q.key === 'running' ? 0.5 : 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="quest-divider"/>
                
                {/* Extra quest items */}
                <div className="space-y-0">
                  {DAILY_QUEST_EXTRAS.map(q => (
                    <div key={q.key} className="quest-row flex items-center justify-between py-3 px-2">
                      <span className="text-[13px] text-[rgba(200,215,240,0.85)] font-medium">{q.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] text-[rgba(160,180,215,0.7)] font-mono font-bold">
                          [{dailyQuestProgress[q.key] || 0}/{q.target}{q.unit}]
                        </span>
                        <button 
                          className="quest-plus-btn"
                          onClick={() => incrementQuest(q.key, q.key === 'reading' ? 0.5 : 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="quest-divider"/>
                
                {/* Preview Rewards + Complete Quest row */}
                <div className="flex items-center justify-between px-2 py-2">
                  <button className="flex items-center gap-2 text-[11px] text-[rgba(150,175,220,0.7)] hover:text-[rgba(200,220,255,0.9)] transition-colors">
                    <span className="text-base">ðŸŽ</span>
                    <span className="font-medium">Preview Rewards</span>
                  </button>
                  <button 
                    className={`quest-complete-btn ${isDailyQuestComplete ? 'opacity-100' : 'opacity-50'}`}
                    onClick={handleCompleteDailyQuest}
                  >
                    COMPLETE QUEST ⚔️
                  </button>
                </div>
                
                <div className="quest-divider"/>
                
                {/* Warning text */}
                <div className="quest-warning px-2">
                  <p>
                    <strong>WARNING</strong>: Failure to complete the daily quest will result in an appropriate <span className="penalty">penalty</span>.
                  </p>
                </div>
                
                {/* Countdown timer */}
                <div className="text-center py-4">
                  <span className="quest-timer text-4xl font-black">
                    {questCountdown}
                  </span>
                </div>
                
              </div>
              
              {/* Bottom decorative bar */}
              <div className="quest-top-bar"/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN ARISE CINEMATIC MODAL */}
      <AnimatePresence>
        {ariseCinematicShadow && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
          >
            {/* Ambient Shadow energy waves */}
            <div className="absolute inset-0 bg-radial-gradient from-violet-950/30 via-transparent to-transparent pointer-events-none"/>
            <div className="absolute top-1/4 w-[350px] h-[350px] bg-violet-600/15 rounded blur-[120px] animate-pulse pointer-events-none"/>
            <div className="absolute bottom-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded blur-[120px] animate-pulse pointer-events-none"/>
            
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              className="w-full glass-card p-8 border-2 border-violet-500/40 monarch-glow relative z-10 space-y-6 flex flex-col items-center overflow-hidden bg-black/85"
            >
              {/* Tactical HUD Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.04)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-60"/>
              
              {/* Animated HUD Scanline */}
              <motion.div 
                animate={{ y: ['-100%', '300%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none"
              />

              {/* HUD Corner Brackets */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-violet-400 rounded-tl-sm shadow-[0_0_5px_rgba(168,85,247,0.5)]"/>
              <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-violet-400 rounded-tr-sm shadow-[0_0_5px_rgba(168,85,247,0.5)]"/>
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-violet-400 rounded-bl-sm shadow-[0_0_5px_rgba(168,85,247,0.5)]"/>
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-violet-400 rounded-br-sm shadow-[0_0_5px_rgba(168,85,247,0.5)]"/>

              {/* S-Rank Summoning Magic Matrix */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 bg-violet-500/10 rounded blur-2xl animate-pulse"/>
                <svg className="w-36 h-36 text-violet-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" viewBox="0 0 100 100">
                  {/* Rotating outer runic circle */}
                  <motion.g
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="origin-center"
                  >
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
                    <polygon points="50,8 62,38 92,50 62,62 50,92 38,62 8,50 38,38" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                  </motion.g>

                  {/* Rotating inner magic matrix */}
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="origin-center"
                  >
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" opacity="0.8"/>
                    <polygon points="50,20 76,65 24,65" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5"/>
                    <polygon points="50,80 76,35 24,35" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5"/>
                  </motion.g>

                  {/* Central pulsing core */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="7"
                    fill="currentColor"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-violet-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                  />
                </svg>
              </div>

              {/* Alert & Instructions */}
              <div className="space-y-3 relative z-10">
                <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.3em] font-mono block">
                  ── SYSTEM ALERT: EXTRACTION SEQUENCE ──
                </span>
                <h2 className="text-3xl font-black font-display uppercase tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  ARISE PROTOCOL
                </h2>
                <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent mx-auto my-2"/>
                <p className="text-[10px] text-violet-200/70 font-semibold leading-relaxed tracking-wider uppercase">
                  Subject for Extraction: <span className="text-violet-300 font-black">{ariseCinematicShadow}</span>
                </p>
                <p className="text-[9px] text-[var(--text-dim)] font-medium leading-relaxed max-w-[280px] mx-auto normal-case">
                  resurrecting this soul binds their power to the shadow monarch. clear the gate to activate the permanent attribute multiplier.
                </p>
              </div>

              {/* Actions */}
              <div className="w-full space-y-3 relative z-10">
                <button
                  onClick={() => handleAriseSummon(ariseCinematicShadow)}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-4 rounded uppercase tracking-[0.25em] text-xs shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 cursor-pointer border border-violet-400/50 hover:scale-[1.03] active:scale-95 transition-all duration-300"
                >
                  ⚡ Execute Awakening ("ARISE")
                </button>
                <button
                  onClick={() => setAriseCinematicShadow(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-violet-300 hover:text-white font-black py-3 rounded uppercase tracking-widest text-[8px] cursor-pointer transition-all duration-300 border border-white/5"
                >
                  Cancel Protocol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUNTER PROFILE MODAL */}
      <AnimatePresence>
        {selectedHunter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[170] flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setSelectedHunter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="quest-panel w-full max-w-sm max-h-[85vh] flex flex-col monarch-glow"
            >
              {/* Metallic corner clips */}
              <div className="quest-corner quest-corner--tl"/>
              <div className="quest-corner quest-corner--tr"/>
              <div className="quest-corner quest-corner--bl"/>
              <div className="quest-corner quest-corner--br"/>

              {/* Side metallic bracket clips */}
              <div className="quest-side-clip quest-side-clip--left"/>
              <div className="quest-side-clip quest-side-clip--right"/>

              {/* Grid background */}
              <div className="quest-grid-bg"/>

              {/* Top decorative bar */}
              <div className="quest-top-bar"/>

              <button className="quest-close-btn" onClick={() => setSelectedHunter(null)}>X</button>

              <div className="flex-1 overflow-y-auto relative z-10 p-6 space-y-5">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-4xl mb-4 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    {selectedHunter.avatar}
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-[rgba(220,230,255,0.95)] font-display text-center">
                    {selectedHunter.name}
                  </h2>
                  <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mt-1">
                    Rank: {selectedHunter.rank === 1 ? 'S-Rank (National Level)' : selectedHunter.rank <= 5 ? 'A-Rank' : 'B-Rank'}
                  </p>
                </div>

                <div className="quest-divider"/>

                <div>
                  <h3 className="text-[10px] font-black text-[rgba(140,160,200,0.8)] uppercase tracking-widest mb-3 text-center">Status Window</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <p className="text-[9px] uppercase text-[var(--text-dim)]">Class</p>
                      <p className="text-sm font-black text-white">{selectedHunter.rank === 1 ? 'Fighter' : 'Assassin'}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <p className="text-[9px] uppercase text-[var(--text-dim)]">Guild</p>
                      <p className="text-sm font-black text-white">{selectedHunter.rank === 1 ? 'Ahjin' : 'Hunters'}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <p className="text-[9px] uppercase text-[var(--text-dim)]">Level</p>
                      <p className="text-sm font-black text-white">{Math.floor(selectedHunter.points / 1000) + 10}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <p className="text-[9px] uppercase text-[var(--text-dim)]">Total XP</p>
                      <p className="text-sm font-black text-[var(--acc-primary)]">{selectedHunter.points.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="quest-divider"/>

                <div>
                  <h3 className="text-[10px] font-black text-[rgba(140,160,200,0.8)] uppercase tracking-widest mb-3 text-center">Achievements</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                      <span className="text-lg">🔥</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[rgba(220,230,255,0.9)]">Demon Castle Conqueror</p>
                        <p className="text-[9px] text-[var(--text-dim)]">Cleared 100 floors without dying</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                      <span className="text-lg">⚔️</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[rgba(220,230,255,0.9)]">Shadow Extraction</p>
                        <p className="text-[9px] text-[var(--text-dim)]">Successfully extracted 50 shadows</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                      <span className="text-lg">🏃</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[rgba(220,230,255,0.9)]">Daily Quest Master</p>
                        <p className="text-[9px] text-[var(--text-dim)]">Completed the daily penalty quest 30 times in a row</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div className="quest-top-bar"/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
