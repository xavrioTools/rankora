// Centralized Content Moderation & Safety Guard Utility
// Supports English, Urdu, Roman Urdu, URL detection, Adult content, Hate speech, and XSS prevention.

// Comprehensive URL and domain detection regex patterns
const URL_REGEX_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|org|net|edu|gov|mil|io|co|me|info|biz|xyz|online|site|tech|pro|club|top|ru|uk|ca|au|de|fr|jp|cn|in|br|it|es|nl|se|no|fi|dk|pl|gr|tr|za|mx|ar|cl|co|ve|pe|ua|ro|cz|hu|pt|gr|il|sg|hk|tw|kr|vn|th|my|id|ph|nz)\b[^\s]*/i,
  /\b[a-z0-9-]+\s*\[\s*(?:dot|period|point)\s*\]\s*[a-z0-9-]+\b/i,
  /\b[a-z0-9-]+\s*\(\s*(?:dot|period|point)\s*\)\s*[a-z0-9-]+\b/i,
  /\b[a-z0-9-]+\s+dot\s+[a-z0-9-]+\b/i,
];

// Multilingual profanity, abuse, insults, and harassment dictionary (English, Urdu, Roman Urdu)
const PROFANITY_AND_ABUSE_WORDS = [
  'fuck', 'fuk', 'f*ck', 'fxck', 'fck', 'fucker', 'motherfucker', 'shit', 'sh*t', 'shyt', 'bullshit',
  'asshole', 'ass', 'bitch', 'btch', 'b*tch', 'bastard', 'cunt', 'dick', 'cock', 'pussy', 'whore',
  'slut', 'piss', 'crap', 'damn', 'bloody', 'idiot', 'moron', 'stupid', 'retard', 'loser', 'suck',
  'choot', 'chutiya', 'chootiya', 'madarchod', 'bhenchod', 'bhosdike', 'bhosdi', 'harami', 'haramzada',
  'kameena', 'kaminey', 'kutta', 'kutte', 'kutti', 'kamina', 'randi', 'randy', 'gandu', 'gaandu',
  'suar', 'ullu', 'haraam', 'haraami', 'behuda', 'badtameez', 'lanti', 'laanti', 'kanjar', 'hijra',
  'chakkha', 'chakka', 'tatti', 'ghatia',
];

// Adult and Sexual Content / Solicitation dictionary
const ADULT_CONTENT_WORDS = [
  'sex', 'sexual', 'porn', 'porno', 'xxx', 'horny', 'nude', 'naked', 'escort', 'hookup', 'hook up',
  'adult chat', 'hot girls', 'webcam', 'onlyfans', 'telegram sex', 'whatsapp sex', 'sugar daddy',
  'sugar baby', 'fetish', 'orgasm', 'masturbat', 'prostitute', 'prostitution', 'erotic', 'lingerie',
];

// Romantic and Dating-related content
const ROMANTIC_DATING_TERMS = [
  'dating', 'date me', 'girlfriend', 'boyfriend', 'flirting', 'flirty', 'romance',
  'romantic', 'couple chat', 'love chat', 'meet girls', 'meet boys', 'find a girlfriend',
  'find a boyfriend', 'relationship chat', 'hot girl', 'hot girls', 'hot boy', 'hot boys',
  'sexy girl', 'sexy girls', 'sexy boy', 'sexy boys', 'sex chat', 'ladki', 'ladka', 'sexy'
];

// Hate speech and discriminatory slurs
const HATE_SPEECH_WORDS = [
  'nigger', 'nigga', 'faggot', 'fag', 'tranny', 'retard', 'kike', 'spic', 'chink', 'wetback',
  'kill yourself', 'kys', 'die in a fire', 'hope you die', 'terrorist', 'racist scum',
];

// Normalize text for robust matching (removes repeated characters, punctuation substitutions)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/[1!]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[0]/g, 'o')
    .replace(/[$]/g, 's')
    .replace(/(.)\1{2,}/g, '$1$1') // collapse 3+ repeated chars (e.g. fuuuuck -> fuuck)
    .replace(/[^a-z0-9\s]/gi, ' ');
}

export function detectUrls(text: string): boolean {
  if (!text) return false;
  // Check standard patterns
  for (const pattern of URL_REGEX_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  // Check for email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  if (emailRegex.test(text)) return true;

  return false;
}

export function detectProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  for (const word of words) {
    if (PROFANITY_AND_ABUSE_WORDS.includes(word)) return true;
  }

  // Also check substring matches for severe profanity
  for (const profane of PROFANITY_AND_ABUSE_WORDS) {
    if (profane.length > 3 && normalized.includes(profane)) return true;
  }

  return false;
}

export function detectAdultContent(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);

  for (const term of ADULT_CONTENT_WORDS) {
    if (normalized.includes(term)) return true;
  }

  return false;
}

export function detectRomanticDatingContent(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);

  for (const term of ROMANTIC_DATING_TERMS) {
    if (normalized.includes(term)) return true;
  }
  return false;
}

export function detectHateSpeech(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);

  for (const term of HATE_SPEECH_WORDS) {
    if (normalized.includes(term)) return true;
  }

  return false;
}

export function moderateReview(text: string): { valid: boolean; error?: string } {
  if (!text || !text.trim()) {
    return { valid: false, error: 'Review text cannot be empty.' };
  }

  if (text.length > 2000) {
    return { valid: false, error: 'Review is too long (maximum 2000 characters).' };
  }

  // 1. Check URLs / Links
  if (detectUrls(text)) {
    return {
      valid: false,
      error: 'Links are not allowed in reviews. Please remove all URLs.',
    };
  }

  // 2. Check Hate Speech
  if (detectHateSpeech(text)) {
    return {
      valid: false,
      error: 'Hate speech and discriminatory content are not allowed.',
    };
  }

  // 3. Check Adult Content
  if (detectAdultContent(text)) {
    return {
      valid: false,
      error: 'Sexually explicit or adult chat content is not permitted in reviews.',
    };
  }

  // 4. Check Romantic / Dating / Inappropriate Content
  if (detectRomanticDatingContent(text)) {
    return {
      valid: false,
      error: 'Romantic, dating, adult, and inappropriate content is not allowed in reviews.',
    };
  }

  // 5. Check Profanity & Abusive Language
  if (detectProfanity(text)) {
    return {
      valid: false,
      error: 'Your review contains abusive or offensive language. Please use respectful language.',
    };
  }

  return { valid: true };
}

// XSS Sanitizer for safe rendering
export function sanitizeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
