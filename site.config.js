// ─────────────────────────────────────────────────────────────────────────
//  SITE CONFIG — the one file to edit before the first deploy.
//
//  Everything that identifies the owner lives here: her name, the GitHub
//  repository the site is published from, and the link where it ends up.
//  vite.config.js, index.html, the 404 page, robots.txt, sitemap.xml and
//  the app itself all read from this file, so nothing else needs a find-
//  and-replace.
//
//  Content (projects, timeline, volunteering, contact email, social links)
//  is NOT here — that is edited live from the site's own Editor and stored
//  in src/data/projects.js.
// ─────────────────────────────────────────────────────────────────────────

export const SITE = {
  // Full name, exactly as it should appear in the navbar, preloader & footer.
  // (The hero greets visitors with the first word: "Hi, I'm Tasneem".)
  ownerName: 'Tasneem Mhairat',
  // First name in Arabic, used by the Arabic version of the hero greeting.
  firstNameAr: 'تسنيم',

  // Two letters for the favicon monogram.
  initials: 'TM',

  // Shown on the hero's "museum pass" card.
  role: 'Mechatronics Engineering Student',
  roleAr: 'طالبة هندسة ميكاترونكس',
  school: 'The Hashemite University',
  schoolShort: 'HU',
  schoolAr: 'الجامعة الهاشمية',

  // One line used for search results and link previews.
  tagline: 'Mechatronics engineering student at Hashemite University — robots, gadgets, and everything I build along the way.',

  // GitHub account + repository the site is deployed from. The live Editor
  // commits content changes straight into this repo, and GitHub Pages serves
  // the site at https://<githubOwner>.github.io/<githubRepo>/.
  githubOwner: 'tsneem6',
  githubRepo: 'digital-museum',

  // Gallery filter tabs & the Editor's category dropdown. Rename freely —
  // only categories with at least one project show up as tabs.
  categories: ['Robotics', 'Mechatronics', 'Embedded Systems', 'CAD & Design', 'Programming', 'Research', 'Creative'],

  // Little emoji shown on each category chip and card sticker. Any category
  // without one here gets a ✿.
  categoryIcons: {
    'Robotics': '🤖',
    'Mechatronics': '⚙️',
    'Embedded Systems': '🔌',
    'CAD & Design': '📐',
    'Programming': '💻',
    'Research': '🔬',
    'Creative': '🎨',
  },

  // Status badges a project can carry.
  statuses: ['Completed', 'In Progress', 'Prototype', 'Competition', 'Course Project', 'Published'],

  // Namespace for the ♡ "appreciate" counters on each project card
  // (stored at counterapi.dev — free, no account needed). Must be unique to
  // this site so the hearts don't mix with anyone else's.
  likesNamespace: 'tasneem-mhairat-museum',

  // Year the collection was founded — shown in the hero eyebrow.
  established: '2026',
};

// GitHub Pages serves a project repo under /<repo>/. If the site is deployed
// as a user site (repo named <username>.github.io) or on a custom domain,
// change this to '/'.
export const categoryIcon = (cat) => SITE.categoryIcons?.[cat] || '✿';

export const FIRST_NAME = SITE.ownerName.split(' ')[0];

export const BASE_PATH = `/${SITE.githubRepo}/`;

export const SITE_URL = `https://${SITE.githubOwner.toLowerCase()}.github.io${BASE_PATH}`;
