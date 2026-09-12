export interface DopamineItem {
  id: string;
  youtubeId: string;
  title: string;
  creator?: string;
  duration?: string;
  description: string;
  category: DopamineCategory;
}

export type DopamineCategory =
  | 'Funny Videos'
  | 'Funny Animals'
  | 'Memes'
  | 'Satisfying Videos'
  | 'Random YouTube Shorts'
  | 'Gaming Clips'
  | 'Weird Internet'
  | 'Interesting Videos'
  | 'Music'
  | 'Random';

export const DOPAMINE_CATEGORIES: DopamineCategory[] = [
  'Funny Videos',
  'Funny Animals',
  'Memes',
  'Satisfying Videos',
  'Random YouTube Shorts',
  'Gaming Clips',
  'Weird Internet',
  'Interesting Videos',
  'Music',
  'Random',
];

export const CATEGORY_ICONS: Record<DopamineCategory, string> = {
  'Funny Videos': '😂',
  'Funny Animals': '🐱',
  'Memes': '🐸',
  'Satisfying Videos': '✨',
  'Random YouTube Shorts': '📱',
  'Gaming Clips': '🎮',
  'Weird Internet': '🌀',
  'Interesting Videos': '🧠',
  'Music': '🎵',
  'Random': '🎲',
};

export const CATEGORY_COLORS: Record<DopamineCategory, string> = {
  'Funny Videos': 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30',
  'Funny Animals': 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
  'Memes': 'from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/30',
  'Satisfying Videos': 'from-cyan-500/20 to-sky-500/10 text-cyan-300 border-cyan-500/30',
  'Random YouTube Shorts': 'from-red-500/20 to-orange-500/10 text-red-300 border-red-500/30',
  'Gaming Clips': 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30',
  'Weird Internet': 'from-fuchsia-500/20 to-purple-500/10 text-fuchsia-300 border-fuchsia-500/30',
  'Interesting Videos': 'from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30',
  'Music': 'from-violet-500/20 to-indigo-500/10 text-violet-300 border-violet-500/30',
  'Random': 'from-lime-500/20 to-emerald-500/10 text-lime-300 border-lime-500/30',
};

export const DOPAMINE_VAULT: Record<DopamineCategory, DopamineItem[]> = {
  'Funny Videos': [
    {
      id: 'fv-1',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      creator: 'Rick Astley',
      duration: '3:32',
      description: 'The undeniable crown jewel of the digital distraction realm.',
      category: 'Funny Videos',
    },
    {
      id: 'fv-2',
      youtubeId: 'FzRH3iTQPrk',
      title: 'Sneezing Baby Panda',
      creator: 'Jim Henson',
      duration: '0:17',
      description: 'The sneeze that startled an entire nation of mother pandas.',
      category: 'Funny Videos',
    },
    {
      id: 'fv-3',
      youtubeId: 'k1-TrAvp_xs',
      title: 'Charlie Bit My Finger - Again!',
      creator: 'HDCYT',
      duration: '0:56',
      description: 'An ancient artifact of pre-algorithmic YouTube.',
      category: 'Funny Videos',
    },
    {
      id: 'fv-4',
      youtubeId: 'sa0U3XmPZc0',
      title: 'Dramatic Chipmunk',
      creator: 'Magnificant',
      duration: '0:05',
      description: 'Five seconds of pure, unadulterated prairie dog cinema.',
      category: 'Funny Videos',
    },
  ],
  'Funny Animals': [
    {
      id: 'fa-1',
      youtubeId: 'tntOCGkgt98',
      title: 'Cat Jumps to Sail by AWOLNATION',
      creator: 'Animals Being Derps',
      duration: '0:34',
      description: 'Calculated the jump with physics. Forgot to factor in friction.',
      category: 'Funny Animals',
    },
    {
      id: 'fa-2',
      youtubeId: 'QH2-TGUlwu4',
      title: 'Nyan Cat [original]',
      creator: 'saraj00n',
      duration: '3:37',
      description: 'Pastry cat floating through cosmos on pure dopamine fuel.',
      category: 'Funny Animals',
    },
    {
      id: 'fa-3',
      youtubeId: 'Awf45u6zrP0',
      title: 'Fenton! Fenton! Jesus Christ, Fenton!',
      creator: 'Ali Banat',
      duration: '0:47',
      description: 'A dog chasing deer through Richmond Park in chaotic defiance.',
      category: 'Funny Animals',
    },
    {
      id: 'fa-4',
      youtubeId: 'J---aiyznGQ',
      title: 'Keyboard Cat! - The Original',
      creator: 'Keyboard Cat',
      duration: '0:54',
      description: 'Play him off, Fatso. No task can survive this piano solo.',
      category: 'Funny Animals',
    },
  ],
  'Memes': [
    {
      id: 'mm-1',
      youtubeId: '9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
      creator: 'officialpsy',
      duration: '4:12',
      description: 'The video that literally broke YouTube view count integer limits.',
      category: 'Memes',
    },
    {
      id: 'mm-2',
      youtubeId: 'ZZ5LpwO-An4',
      title: 'HEYYEYAAEYAAAEYAEYAA',
      creator: 'Slackcircus',
      duration: '2:07',
      description: 'He-Man delivers supreme existential clarity in 4 Non Blondes style.',
      category: 'Memes',
    },
    {
      id: 'mm-3',
      youtubeId: '2Z4m4lnjxkY',
      title: 'Trololo Sing Along with Eduard Khil',
      creator: 'RealEduardKhil',
      duration: '2:41',
      description: 'The vocalization that permanently suspended global productivity in 2010.',
      category: 'Memes',
    },
    {
      id: 'mm-4',
      youtubeId: 'jofNR_WkoCE',
      title: 'What Does The Fox Say? - Ylvis',
      creator: 'TVNorge',
      duration: '3:45',
      description: 'Answering life’s most pressing zoological mystery instead of working.',
      category: 'Memes',
    },
  ],
  'Satisfying Videos': [
    {
      id: 'sv-1',
      youtubeId: '7X8II6J-6mU',
      title: 'Kinetic Sand Slicing ASMR Compilation',
      creator: 'Sand Tagious',
      duration: '10:02',
      description: 'Gentle, hypnotic crunching of pristine geometric sand cubes.',
      category: 'Satisfying Videos',
    },
    {
      id: 'sv-2',
      youtubeId: 'u4YQ4i1m50g',
      title: 'Hydraulic Press Crushing Bowling Balls & Diamonds',
      creator: 'Hydraulic Press Channel',
      duration: '4:30',
      description: 'Extremely dangerous crushing pressure turning solid matter into dust.',
      category: 'Satisfying Videos',
    },
    {
      id: 'sv-3',
      youtubeId: 'L_LUpnjgPso',
      title: 'Pottery Wheel Centering & Trimming ASMR',
      creator: 'Old Forge Creations',
      duration: '8:15',
      description: 'Perfect rotational clay symmetry guaranteed to lower resting heart rate.',
      category: 'Satisfying Videos',
    },
  ],
  'Random YouTube Shorts': [
    {
      id: 'rs-1',
      youtubeId: 'M7lc1UVf-VE',
      title: 'Short Cinematic Glitch - YouTube Player Demo',
      creator: 'YouTube Creators',
      duration: '0:30',
      description: 'Rapid vertical dopamine burst designed for modern attention spans.',
      category: 'Random YouTube Shorts',
    },
    {
      id: 'rs-2',
      youtubeId: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito Micro Hook',
      creator: 'Luis Fonsi',
      duration: '0:45',
      description: 'Catchy rhythmic loop that erases memory of deadlines.',
      category: 'Random YouTube Shorts',
    },
    {
      id: 'rs-3',
      youtubeId: 'hT_nvWreIhg',
      title: 'OneRepublic - Counting Stars Live Snippet',
      creator: 'OneRepublic',
      duration: '0:50',
      description: 'Counting stars instead of counting remaining work hours.',
      category: 'Random YouTube Shorts',
    },
  ],
  'Gaming Clips': [
    {
      id: 'gc-1',
      youtubeId: 'LHY8NKj3RKs',
      title: 'LEEEEROY JENKINS!!! (Original WoW Classic)',
      creator: 'Pals4Life',
      duration: '2:50',
      description: 'At least he has chicken. The most historic tactical miscalculation.',
      category: 'Gaming Clips',
    },
    {
      id: 'gc-2',
      youtubeId: 'JzU_ETnJtPU',
      title: 'Daigo Parry - EVO Moment #37',
      creator: 'EVO Championship Series',
      duration: '1:12',
      description: 'Full parry of Chun-Li super art with 1 pixel of health remaining.',
      category: 'Gaming Clips',
    },
    {
      id: 'gc-3',
      youtubeId: 'V1bFr2SWP1I',
      title: 'Portal Speedrun in 7 Minutes',
      creator: 'Speedrun Legends',
      duration: '7:07',
      description: 'Defying spatial geometry to save minutes that will be spent loafing.',
      category: 'Gaming Clips',
    },
  ],
  'Weird Internet': [
    {
      id: 'wi-1',
      youtubeId: 'FavUpD_IjVY',
      title: 'Salad Fingers 1: Spoons',
      creator: 'David Firth',
      duration: '1:47',
      description: 'A gentleman who enjoys touching rusty spoons. Unsettling yet magnetic.',
      category: 'Weird Internet',
    },
    {
      id: 'wi-2',
      youtubeId: 'wZZ7oFKsKzY',
      title: 'Badger Badger Badger (Original Mushroom Snake)',
      creator: 'Weebl',
      duration: '1:29',
      description: 'Badger badger badger badger mushroom mushroom! A SNAKE, A SNAKE!',
      category: 'Weird Internet',
    },
    {
      id: 'wi-3',
      youtubeId: 'q6EoRBvdVPQ',
      title: 'Don\'t Hug Me I\'m Scared',
      creator: 'Blink Industries',
      duration: '3:25',
      description: 'What is creativity? Green is not a creative color.',
      category: 'Weird Internet',
    },
  ],
  'Interesting Videos': [
    {
      id: 'iv-1',
      youtubeId: 'bBC-nXj3Ng4',
      title: 'Kurzgesagt – The Egg: A Short Story',
      creator: 'Kurzgesagt – In a Nutshell',
      duration: '8:03',
      description: 'Andy Weir’s poetic story about reincarnation and universal connection.',
      category: 'Interesting Videos',
    },
    {
      id: 'iv-2',
      youtubeId: '0JGHI4TAC5U',
      title: 'Veritasium: The Riddle That Seems Impossible Even If You Know The Answer',
      creator: 'Veritasium',
      duration: '12:44',
      description: '100 prisoners and 100 boxes. Probability paradoxes over spreadsheets.',
      category: 'Interesting Videos',
    },
    {
      id: 'iv-3',
      youtubeId: 'G1IbRujko-A',
      title: 'Mark Rober – World\'s Largest Jell-O Pool',
      creator: 'Mark Rober',
      duration: '11:28',
      description: 'NASA engineer spends months filling an Olympic swimming pool with Jell-O.',
      category: 'Interesting Videos',
    },
  ],
  'Music': [
    {
      id: 'mu-1',
      youtubeId: 'jfKfPfyJRdk',
      title: 'Lofi Hip Hop Radio - Beats to Relax/Study/Procrastinate To',
      creator: 'Lofi Girl',
      duration: 'Live',
      description: 'The girl has been writing that single essay since 2017. True solidarity.',
      category: 'Music',
    },
    {
      id: 'mu-2',
      youtubeId: 'fJ9rUzIMcZQ',
      title: 'Queen – Bohemian Rhapsody (Official Video)',
      creator: 'Queen Official',
      duration: '5:59',
      description: 'Scaramouche, Scaramouche, will you do the Fandango?',
      category: 'Music',
    },
    {
      id: 'mu-3',
      youtubeId: 'BaW_jenozKc',
      title: 'Pharrell Williams - Happy',
      creator: 'Pharrell Williams',
      duration: '4:06',
      description: 'Clap along if you feel like productivity is not for you.',
      category: 'Music',
    },
  ],
  'Random': [
    {
      id: 'rd-1',
      youtubeId: 'jNQXAC9IVRw',
      title: 'Me at the zoo (The Very First YouTube Video Ever)',
      creator: 'jawed',
      duration: '0:19',
      description: 'April 23, 2005. The elephants have really, really long trunks. Historic.',
      category: 'Random',
    },
    {
      id: 'rd-2',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Pure Random Surrender',
      creator: 'The Universe',
      duration: '3:32',
      description: 'You pressed Random. The universe has delivered its inevitable truth.',
      category: 'Random',
    },
    {
      id: 'rd-3',
      youtubeId: 'FzRH3iTQPrk',
      title: 'Quantum Vacuum Fluctuations in High Definition',
      creator: 'Procrastination Lab',
      duration: '0:17',
      description: 'Simulating zero ambition particles interacting in vacuum.',
      category: 'Random',
    },
  ],
};

/**
 * Select a dopamine category and item based on randomness setting.
 */
export function selectRandomDopamine(randomness: 'LOW' | 'MEDIUM' | 'CHAOTIC'): {
  category: DopamineCategory;
  item: DopamineItem;
  url: string;
} {
  let categoryPool = [...DOPAMINE_CATEGORIES];

  if (randomness === 'LOW') {
    // Favors standard lighthearted categories
    categoryPool = [
      'Funny Videos',
      'Funny Animals',
      'Memes',
      'Satisfying Videos',
      'Funny Videos',
      'Funny Animals',
    ];
  } else if (randomness === 'CHAOTIC') {
    // Heavy bias towards weird internet, random shorts, meme singularity
    categoryPool = [
      'Weird Internet',
      'Weird Internet',
      'Random YouTube Shorts',
      'Memes',
      'Gaming Clips',
      'Random',
      'Random',
      'Funny Videos',
      'Music',
      'Interesting Videos',
    ];
  }

  const chosenCategory = categoryPool[Math.floor(Math.random() * categoryPool.length)] as DopamineCategory;
  const items = DOPAMINE_VAULT[chosenCategory] || DOPAMINE_VAULT['Funny Videos'];
  const chosenItem = items[Math.floor(Math.random() * items.length)];

  // Canonical YouTube Watch URL
  const url = `https://www.youtube.com/watch?v=${chosenItem.youtubeId}`;

  return {
    category: chosenCategory,
    item: chosenItem,
    url,
  };
}
