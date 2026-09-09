// Groups of interchangeable terms. If a search word matches
// anything in a group, all words in that group are searched.
const SYNONYM_GROUPS = [
  // Home services / trades
  ["plumber", "loodgieter", "geyser", "pipes", "pype", "drain", "leak", "lek", "burst pipe", "gebarste pyp", "water leak"],
  ["electrician", "elektrisiën", "elektrisien", "wiring", "power", "krag", "aircon repairs", "solar installation", "appliance repairs", "emergency electrical"],
  ["handyman", "klusman", "repairs", "herstelwerk", "maintenance", "onderhoud", "property maintenance"],
  ["construction", "bouwerk", "building", "bou", "steelwork", "renovations", "aanbouings", "bricklayer", "messelaar"],
  ["security", "sekuriteit", "alarm monitoring", "armed response", "cctv installation", "panic systems", "gewapende reaksie"],
  ["electric fence", "elektriese heining", "gate motor", "hekmotor", "nemtek", "centurion gate motors", "security installation"],
  ["cleaning", "skoonmaak", "domestic", "huishulp", "housekeeper", "huiswerker", "office cleaning"],
  ["garden", "tuin", "landscaping", "lawn", "gras", "gardener", "tuinier", "tuindienste"],
  ["irrigation", "besproeiing", "water pumps", "water tanks", "pump repairs", "sprinklers"],
  ["tree felling", "boomkappery", "tree trimming", "stump removal", "chainsaw repairs", "chain sharpening", "boom snoei"],
  ["pest control", "plaagbeheer", "fumigation", "termite treatment", "rat control"],
  ["locksmith", "slotmaker", "keys", "sleutels", "lock repair"],
  ["trailer hire", "sleepwa huur", "utility trailers", "trailer rental"],
  ["towing", "insleep", "insleepdiens", "breakdown", "wegsleep", "sleepwa", "vehicle recovery", "long distance towing"],

  // Automotive
  ["mechanic", "werktuigkundige", "car repair", "motor", "gearbox", "brakes", "remme", "engine", "enjin", "mechanical workshop", "vehicle servicing", "diagnostic repairs", "engine overhaul"],
  ["panelbeater", "paneelklopper", "dent", "duik", "spray paint", "panel beating", "auto wiring"],
  ["car wash", "wasgeriewe", "car detailing", "interior cleaning", "paint correction", "ceramic coating"],
  ["tyres", "bande", "wheel alignment", "tyre fitment", "puncture repair", "wielbalansering"],
  ["batteries", "batterye", "car batteries", "motorcycle batteries", "gate motor batteries", "battery replacement"],
  ["driving school", "bestuurskool", "driving lessons", "learners lessons", "drivers test", "k53"],
  ["farm vehicle repairs", "plaasvoertuig herstel", "tractor repairs", "trekker herstel"],
  ["spitronics", "car diagnostics", "auto electrical"],

  // Beauty & spa
  ["hair", "hare", "salon", "kapper", "haircut", "hairstyle", "blow dry", "hair colour", "highlights", "hairdresser"],
  ["nails", "naels", "manicure", "pedicure", "nail treatments"],
  ["spa", "massage", "beauty", "skoonheid", "facials", "microneedling", "waxing", "skoonheidsalon"],
  ["barber", "haarkapper vir mans", "mens haircut", "beard trim", "baard sny"],
  ["makeup", "grimering", "makeup artist", "bridal makeup"],
  ["tattoo", "tatoeëring", "piercing"],

  // Health & medical
  ["doctor", "dokter", "gp", "clinic", "kliniek", "medical practice"],
  ["pharmacy", "apteek", "medicine", "medisyne", "chemist"],
  ["dentist", "tandarts", "teeth", "tande", "dental care"],
  ["vet", "veearts", "animal", "dier", "pet", "troeteldier", "animal clinic"],
  ["chiropractor", "chiropraktisyn", "back pain", "neck pain", "sports injuries", "dry needling", "spinal adjustment"],
  ["physiotherapist", "fisioterapeut", "physio", "rehabilitation"],
  ["optometrist", "oogkundige", "eye test", "spectacles", "brille"],
  ["psychologist", "sielkundige", "counselling", "berading", "therapy"],
  ["ambulance", "noodgevalle", "emergency medical", "paramedic"],
  ["gym", "fiksheidsentrum", "gym membership", "strength training", "fitness classes", "weight training", "personal trainer"],
  ["firearm training", "vuurwapen opleiding", "firearm competency", "gun safety training", "shooting courses"],

  // Food & dining
  ["restaurant", "eetplek", "food", "kos", "takeaway", "wegneem", "dine in", "sit-down meal"],
  ["butcher", "slaghuis", "meat", "vleis", "fresh meat", "butchery meat"],
  ["bakery", "bakkery", "bread", "brood", "cakes", "koeke", "fresh bread", "pies", "doughnuts"],
  ["biltong", "droewors", "biltong platters", "biltong cakes", "snack gifts","droë wors","woepsies"],
  ["dairy", "suiwel", "milkshakes", "melk", "quick snacks"],
  ["coffee shop", "koffiewinkel", "cafe", "kafee", "breakfast", "ontbyt"],
  ["home cooked meals", "tuisgemaakte kos", "whatsapp orders", "affordable food", "goedkoop kos"],
  ["catering", "spyseniering", "event catering", "function food"],
  ["liquor", "drank", "wine", "wyn", "beer", "bier", "spirits", "mixers", "bottle store", "drankwinkel"],
  ["grocery", "kruideniersware", "spar", "supermarket", "convenience store"],
  ["cakes and treats", "poeierkoek", "cupcakes", "cakesicles", "sweet treats", "birthday treats", "wedding treats"],
  ["spices and sauces", "speserye", "braai supplies", "braai hout", "doringhout", "kaggel hout", "kampvuur hout", "firewood"],

  // Agriculture
  ["farm", "plaas", "agriculture", "landbou", "feed", "voer", "livestock", "vee"],
  ["nursery", "kwekery", "tuin plante", "blomme", "boompies", "blompotte", "garden centre"],
  ["fertiliser", "kunsmis", "seeds", "saad", "farming supplies", "landbou benodigdhede"],

  // Retail & shopping
  ["clothing", "klere", "fashion", "mode", "boutique"],
  ["gift shop", "geskenkwinkel", "gifts", "geskenke", "party hats", "perfume", "party supplies"],
  ["crafts", "handwerk", "handmade crafts", "diy projects", "unique gifts", "art supplies", "crochet toys", "custom crochet"],
  ["wool", "wol", "yarn", "garing", "knitting", "brei", "crochet", "haaknaalde"],
  ["hardware", "yster", "tools", "gereedskap", "building supplies", "bou benodigdhede"],
  ["stationery", "skryfbehoeftes", "printing", "photocopying", "photocopies", "document binding", "book binding"],
  ["custom printing", "persoonlike drukwerk", "custom mugs", "printed shirts", "personalised gifts", "laser engraving", "personalised printing", "printed gifts", "wall clocks"],
  ["scrap metal", "skroot metaal", "metal recycling", "plastic bottle recycling", "steel recycling"],

  // Professional services
  ["accountant", "rekenmeester", "tax", "belasting", "bookkeeping", "boekhouding"],
  ["lawyer", "prokureur", "attorney", "legal", "regs", "legal advice"],
  ["real estate", "eiendom", "property sales", "property rentals", "sell your home", "estate agent", "eiendomsagent"],
  ["insurance", "versekering", "insurance broker", "life cover", "lewensversekering"],
  ["banking", "bank", "atm", "financial services", "finansiële dienste"],
  ["cv writing", "cv skryf", "cv makeover", "job application", "linkedin cv", "mobile friendly cv"],
  ["marketing", "bemarking", "social media marketing", "graphic design", "branding", "marketing materials", "content design", "logo design", "flyer design", "business cards", "signage design"],
  ["photography", "fotografie", "photographer", "wedding photos", "event photography"],
  ["funeral", "begrafnis", "undertaker", "lykbesorger", "funeral services", "coffins", "doodskiste"],
  ["dstv installation", "openview installation", "tv mounting", "extra view", "hikvision cameras", "satellite tv"],
  ["computer", "rekenaar", "it support", "phone repair", "foon herstel", "laptop repair"],

  // Events & hire
  ["event hire", "geleentheid huur", "table hire", "chair hire", "glassware hire", "cutlery hire", "tablecloth hire", "tent hire"],
  ["florist", "blomiste", "fresh flowers", "wedding flowers", "funeral flowers", "birthday bouquets", "event florals"],

  // Childcare & education
  ["crèche", "kleuterskool", "creche", "toddlers care", "early childhood development", "grade rr", "childcare", "daycare"],
  ["tutoring", "middagstudie", "tuisonderrig", "homeschooling", "extra lessons", "ekstra klasse", "special needs support"],

  // Accommodation & travel
  ["accommodation", "verblyf", "guesthouse", "gastehuis", "bed and breakfast", "b&b", "self catering"],
  ["taxi", "transport", "shuttle service", "lift service", "vervoerdiens"],
];

// Words we strip out so "waar kan ek wol koop" reduces to just "wol".
const STOPWORDS = new Set([
  "waar", "kan", "ek", "koop", "vind", "is", "daar", "n", "die", "wie",
  "wat", "hoe", "julle", "jy", "het", "om", "na", "by", "vir", "van",
  "op", "in", "en", "of", "my", "asseblief", "asb", "iemand", "wil",
  "soek", "plek", "iewers", "gaan", "ons", "hulle", "sal", "moet",
  "kry", "gee", "sien", "weet", "dink", "goed",
  "where", "can", "i", "buy", "find", "the", "a", "an", "who", "what",
  "is", "there", "to", "get", "does", "do", "sell", "someone", "please",
  "need", "want", "looking", "for", "how", "you", "your", "me", "this",
  "that", "some", "any", "go", "shop", "know", "help", "good", "best",
  "close", "near", "nearby", "open", "hours",
]);

export function tokenize(input) {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-zà-ÿ]+/i)
    .filter(Boolean);
}

// Very light stemming so "haircuts" matches "haircut", "manicures" matches "manicure", etc.
export function stem(word) {
  const w = word.toLowerCase();
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function tokenMatchesGroupWord(tok, groupWord) {
  const stemmedTok = stem(tok);
  return groupWord
    .toLowerCase()
    .split(/\s+/)
    .some((w) => stem(w) === stemmedTok);
}

export function expandQuery(term) {
  const rawTokens = tokenize(term);
  if (rawTokens.length === 0) return [];

  let meaningfulTokens = rawTokens.filter(
    (w) => !STOPWORDS.has(w) && w.length > 1
  );
  if (meaningfulTokens.length === 0) meaningfulTokens = rawTokens;

  const expanded = new Set();
  meaningfulTokens.forEach((tok) => {
    expanded.add(tok);
    const group = SYNONYM_GROUPS.find((g) =>
      g.some((word) => tokenMatchesGroupWord(tok, word))
    );
    if (group) group.forEach((w) => expanded.add(w));
  });

  return Array.from(expanded);
}