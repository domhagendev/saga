import { useBookStore } from '@/stores/book'
import type {
  Book,
  Character,
  Location,
  WorldRule,
  StoryPage,
  RollingSummary,
} from '@/stores/book'

const MOCK_BOOK_ID = 'mock-book-001'

const mockBook: Book = {
  bookId: MOCK_BOOK_ID,
  title: 'The Last Cartographer',
  globalGenre: 'Fantasy',
  globalMood: 'Mysterious',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-07-14T14:30:00Z',
}

const mockCharacters: Character[] = [
  {
    charId: 'char-001',
    bookId: MOCK_BOOK_ID,
    name: 'Elara Voss',
    description:
      'A young cartographer who discovers her maps can reshape reality. She carries an old brass compass that belonged to her grandmother.',
    traits: 'Curious, Determined, Cautious',
    motivation:
      'To find the legendary Unmapped Lands before the Cartographers Guild erases them from existence.',
    isActive: true,
  },
  {
    charId: 'char-002',
    bookId: MOCK_BOOK_ID,
    name: 'Theron Ashwick',
    description:
      'A disgraced guild master who once held the title of Grand Cartographer. Now lives in exile, haunted by the maps he destroyed.',
    traits: 'Bitter, Wise, Secretive',
    motivation:
      'To atone for his past by helping Elara succeed where he failed.',
    isActive: true,
  },
  {
    charId: 'char-003',
    bookId: MOCK_BOOK_ID,
    name: 'Sable',
    description:
      'A shape-shifting ink spirit bound to an ancient atlas. Appears as a black fox with constellation markings.',
    traits: 'Playful, Cryptic, Loyal',
    motivation:
      'To protect the Unmapped Lands from being discovered by the wrong hands.',
    isActive: false,
  },
]

const mockLocations: Location[] = [
  {
    locId: 'loc-001',
    bookId: MOCK_BOOK_ID,
    name: 'The Inkwell Library',
    description:
      'A vast underground library where maps are alive — rivers flow across parchment and mountains grow from the pages. The air smells of old ink and cedar.',
    atmosphere: 'Quiet reverence, whispers of turning pages, faint glow of luminescent ink.',
  },
  {
    locId: 'loc-002',
    bookId: MOCK_BOOK_ID,
    name: 'Thornwall Market',
    description:
      'A bustling market town built inside the ruins of an enormous thorn hedge. The streets are narrow and winding, covered by living brambles that bloom with paper-white flowers.',
    atmosphere: 'Lively, chaotic, fragrant with spices and the sweet scent of thorn blossoms.',
  },
  {
    locId: 'loc-003',
    bookId: MOCK_BOOK_ID,
    name: 'The Bleached Expanse',
    description:
      'A vast white desert where the land has been literally erased — no features, no landmarks, just endless pale ground under a colorless sky. The Cartographers Guild\'s greatest act of suppression.',
    atmosphere: 'Eerie silence, disorientation, the faint hum of lost geography trying to return.',
  },
]

const mockWorldRules: WorldRule[] = [
  {
    ruleId: 'rule-001',
    bookId: MOCK_BOOK_ID,
    title: 'Maps Are Power',
    description:
      'In this world, cartography is a form of magic. Drawing an accurate map of a place gives the cartographer influence over it. Erasing a map can unmake terrain.',
  },
  {
    ruleId: 'rule-002',
    bookId: MOCK_BOOK_ID,
    title: 'The Compass Law',
    description:
      'Every cartographer carries a compass. If a compass needle spins freely, the cartographer is in Unmapped territory — land that exists outside known reality.',
  },
  {
    ruleId: 'rule-003',
    bookId: MOCK_BOOK_ID,
    title: 'Ink Spirits',
    description:
      'Ancient maps sometimes give birth to ink spirits — sentient beings made of the cartographer\'s intent. They are bound to their source atlas and cannot travel far from it.',
  },
]

const mockPages: StoryPage[] = [
  {
    bookId: MOCK_BOOK_ID,
    pageNr: 1,
    content: `The compass needle spun.

Elara held her breath, watching the brass instrument tremble in her palm. Around her, the Inkwell Library hummed with its usual quiet magic — rivers of luminescent ink flowing through glass channels in the walls, casting rippling blue light across the endless stacks of living maps.

But the compass. The compass wasn't supposed to spin. Not here, not in the most thoroughly mapped place in the known world.

"Grandmother," she whispered to no one, "what did you find?"

She set the compass on the reading desk and unrolled the map she'd discovered tucked inside her grandmother's old atlas — a map drawn on paper so fine it was almost translucent. The ink was silver, not the standard black or blue of Guild-approved cartography, and the landforms depicted on it matched nothing in any registry she'd ever studied.

Mountains shaped like open hands. Rivers that flowed in spirals. A forest labeled only with a single word in her grandmother's careful script: *Remember.*

The compass needle snapped to attention, pointing directly at the center of the silver map.

Elara's heart hammered. She glanced around the reading alcove. The Library's keeper-lights — small floating orbs that monitored the collection — drifted lazily between the shelves, their amber glow steady and unsuspicious.

She rolled the map carefully, tucked it inside her coat, and stood.

Whatever her grandmother had found, the Cartographers' Guild had tried to erase it. The Bleached Expanse — that vast white nothing to the north — was proof enough of what the Guild did to places they wanted forgotten.

But you can't erase what someone remembers.

And Elara remembered her grandmother's stories.`,
    userNote: 'Opening scene, establish Elara and the mystery',
    targetMood: 'Mysterious, Intriguing',
    orderIndex: 1,
  },
  {
    bookId: MOCK_BOOK_ID,
    pageNr: 2,
    content: `The night air hit her like a splash of cold water as she emerged from the Library's eastern tunnel. Thornwall Market was still alive with activity — it always was, the thorn-hedge canopy blocking out any sense of day or night, leaving the residents to keep whatever hours suited them.

Elara pulled her coat tighter and wove through the narrow streets, the silver map pressed against her ribs like a secret heartbeat. Paper-white flowers drooped from the living walls overhead, their petals drifting down like snow.

"You're out late, little mapmaker."

She froze. The voice had come from a doorway she'd just passed — a crooked frame half-swallowed by brambles, leading into what looked like a tea house. A man sat in the shadow just inside, his face lit only by the ember of a pipe.

"Theron Ashwick," she said, recognizing the sharp profile, the silver-streaked hair pulled back with a leather cord. Once the youngest Grand Cartographer in Guild history. Now a ruin of a man who sold hand-drawn novelty maps to tourists.

"Elara Voss," he replied, and the way he said her surname — with weight, with history — told her he knew exactly who her grandmother was. "You have her walk. Purposeful. Slightly reckless."

"I need your help."

He laughed, a dry sound like crumpling paper. "Everyone who says that to me ends up worse than when they started."

But she was already unrolling the silver map on his tea-stained table, and when the compass needle spun again — right there, in the middle of Thornwall's most mapped district — she watched Theron Ashwick's face drain of color.

"Where did you get this?" he whispered.

"My grandmother's atlas. Hidden compartment."

He stared at the map for a long, silent moment. Then he set down his pipe and looked at her with eyes that had gone sharp again, focused, the way they must have looked twenty years ago when he'd held the Guild's highest seat.

"We need to leave. Tonight. Before the keeper-lights report what your compass just did."`,
    userNote: 'Introduce Theron, raise stakes',
    targetMood: 'Tense, Conspiratorial',
    orderIndex: 2,
  },
]

const mockSummary: RollingSummary = {
  bookId: MOCK_BOOK_ID,
  rollingSummary:
    'Elara Voss, a young cartographer, discovers a hidden silver map in her grandmother\'s atlas inside the Inkwell Library. The map depicts unknown landforms and causes her compass to spin — indicating Unmapped territory. She escapes the Library and finds Theron Ashwick, a disgraced former Grand Cartographer, in Thornwall Market. Upon seeing the map, Theron recognizes its significance and urges immediate flight before the Guild\'s keeper-lights report the compass anomaly.',
  lastPageIndex: 2,
}

export function loadMockData(): void {
  const bookStore = useBookStore()

  bookStore.books = [mockBook]
  bookStore.currentBook = mockBook
  bookStore.characters = [...mockCharacters]
  bookStore.locations = [...mockLocations]
  bookStore.worldRules = [...mockWorldRules]
  bookStore.pages = [...mockPages]
  bookStore.summary = { ...mockSummary }
}

export { MOCK_BOOK_ID }
