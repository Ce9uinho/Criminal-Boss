import { Activity, Resource, SmugglingZone, Equipment, EquipmentSlot, CombatStats } from '@/types/game';

export const RESOURCES: Record<string, Resource> = {
  // Drug Factory Core Ingredients (7-8 basic items)
  chemical: { id: 'chemical', name: 'Chemical', icon: '🧪', value: 3, description: 'Industrial-grade chemistry for the discerning entrepreneur. No questions asked, no receipts given. Perfect for those midnight experiments your grandmother warned you about.' },
  solvent: { id: 'solvent', name: 'Solvent', icon: '🧴', value: 2, description: 'Dissolves problems and evidence with equal efficiency. The janitor of the criminal world - cleans up messes you never want to explain to the authorities.' },
  plant_matter: { id: 'plant_matter', name: 'Plant Matter', icon: '🌿', value: 2, description: 'Nature\'s gift to the pharmaceutical industry. Organic, locally sourced, and completely off the books. Your customers will thank you, the DEA won\'t.' },
  paper: { id: 'paper', name: 'Paper', icon: '📄', value: 1, description: 'The humble wrapper that turns amateur hour into professional packaging. Because presentation matters, even in the underworld. First impressions kill... sometimes literally.' },
  catalyst: { id: 'catalyst', name: 'Catalyst', icon: '⚗️', value: 4, description: 'Speeds up reactions and business deals alike. The difference between a slow burn and explosive profits. Handle with care - both your product and your reputation depend on it.' },
  substrate: { id: 'substrate', name: 'Substrate', icon: '🧫', value: 3, description: 'The foundation of greatness, or at least profitable mediocrity. Like a good alibi, it supports everything you build on top of it.' },
  binder: { id: 'binder', name: 'Binder', icon: '🔗', value: 2, description: 'Holds your operation together when everything else falls apart. The glue that keeps your empire from crumbling - and your secrets from spilling.' },
  
  // Premium Drug Factory Ingredients (for advanced recipes)
  premium_chemical: { id: 'premium_chemical', name: 'Premium Chemical', icon: '💎', value: 15, description: 'The Rolls Royce of questionable chemistry. When your clientele demands the finest, you deliver the finest. Expensive, exclusive, and worth every blood diamond.' },
  premium_solvent: { id: 'premium_solvent', name: 'Premium Solvent', icon: '✨', value: 10, description: 'Dissolves problems with the elegance of a Swiss banker. Clean, efficient, and leaves no trace - just like your best hits.' },
  premium_plant: { id: 'premium_plant', name: 'Premium Plant', icon: '🌟', value: 12, description: 'Cultivated in the shadows by masters of their craft. Each leaf whispers promises of profit and threats of prosecution in equal measure.' },
  premium_catalyst: { id: 'premium_catalyst', name: 'Premium Catalyst', icon: '🏆', value: 18, description: 'Accelerates success and eliminates competition. The secret ingredient that separates the bosses from the wannabes. Handle with respect, or it handles you.' },
  
  // Distillery Core Ingredients (only 5 + water/alcohol)
  water: { id: 'water', name: 'Water', icon: '💧', value: 1, description: 'The most innocent ingredient in your entire operation. Even the feds can\'t arrest you for buying water... yet. The foundation of every great crime and every greater hangover.' },
  alcohol_base: { id: 'alcohol_base', name: 'Alcohol Base', icon: '🍶', value: 5, description: 'Liquid courage in its purest form. Turns cowards into heroes and evidence into forgotten memories. The backbone of civilization and the downfall of witnesses.' },
  grapes: { id: 'grapes', name: 'Grapes', icon: '🍇', value: 3, description: 'Nature\'s little time bombs of intoxication. Each cluster holds the promise of profit and the threat of a very expensive hangover. Aged to perfection, like your criminal record.' },
  sugar: { id: 'sugar', name: 'Sugar', icon: '🍯', value: 2, description: 'Sweetens the deal and masks the bitter taste of your questionable life choices. Makes everything go down smoother - drinks, bribes, and inconvenient truths.' },
  grains: { id: 'grains', name: 'Grains', icon: '🌾', value: 2, description: 'The honest farmer\'s crop turned into the dishonest dealer\'s gold. From field to felony in just a few simple steps. Your grandmother\'s recipe, your lawyer\'s nightmare.' },
  herbs: { id: 'herbs', name: 'Herbs', icon: '🌿', value: 4, description: 'Adds flavor and plausible deniability. \'Officer, these are just cooking herbs!\' Works every time, until it doesn\'t. Aromatic alibis for the sophisticated criminal.' },
  
  // Premium Distillery Ingredients
  premium_water: { id: 'premium_water', name: 'Premium Water', icon: '💎', value: 8, description: 'Water so pure it makes angels weep and accountants suspicious. Sourced from springs that definitely exist and definitely aren\'t money laundering fronts.' },
  premium_alcohol: { id: 'premium_alcohol', name: 'Premium Alcohol', icon: '🥃', value: 20, description: 'Liquid gold that burns twice - once going down, once when the taxman finds out. The kind of quality that makes judges forget their moral compass.' },
  premium_grapes: { id: 'premium_grapes', name: 'Premium Grapes', icon: '🍾', value: 15, description: 'Hand-picked by artisans who ask no questions and remember no faces. Each grape costs more than most people\'s hourly wage, and it shows in every sip.' },
  premium_herbs: { id: 'premium_herbs', name: 'Premium Herbs', icon: '🌟', value: 18, description: 'Cultivated in gardens that don\'t appear on any map. These herbs have seen things, done things, and flavored things that would make a priest reconsider his vows.' },
  
  // Drug Factory Products (translated to English)
  handmade_cigarettes: { id: 'handmade_cigarettes', name: 'Handmade Cigarettes', icon: '🚬', value: 2, description: 'Rolled by hand with the care of a grandmother and the morals of a loan shark. Sold by the pack, denied in court, and smoked by those who\'ve given up on their lungs and their lawyers. The entry-level sin that keeps the streets smoky and the margins decent.' },
  simple_joints: { id: 'simple_joints', name: 'Simple Joints', icon: '🌿', value: 4, description: 'Two ingredients, one philosophy: relax now, forget later. Wrapped with the precision of a Swiss banker and the discretion of a confessional booth. Perfect for customers who want mellow profits with minimal questions and maximum plausible deniability.' },
  premium_joints: { id: 'premium_joints', name: 'Premium Joints', icon: '🍃', value: 7, description: 'Hand-rolled elegance with boutique bravado and artisanal attention to detail. Each one crafted like a love letter to questionable life choices. For clients who tip in cash, pay in silence, and appreciate the finer things in their morally flexible lifestyle.' },
  pressed_hash: { id: 'pressed_hash', name: 'Pressed Hash', icon: '🟫', value: 10, description: 'Compressed calm with concentrated profit and the density of a mob lawyer\'s conscience. Stacks neatly in briefcases, sells quickly at parties, and disappears instantly when the sirens start wailing. Portable peace of mind for the perpetually paranoid.' },
  artisan_lsd: { id: 'artisan_lsd', name: 'Artisan LSD', icon: '🌈', value: 15, description: 'Mind-expansion in tasteful squares, crafted with the precision of a Swiss watchmaker and the ethics of a casino owner. Your customers see the universe and question reality; you see stable returns and question nothing. Enlightenment sold by the tab.' },
  ecstasy: { id: 'ecstasy', name: 'Ecstasy', icon: '💊', value: 16, description: 'Festival-grade friendship in tablet form, pressed with the care of a mother and the intentions of a predator. Melts faces at raves, opens wallets at clubs, and funds empires built on temporary happiness and permanent consequences. Love in a pill, regret in the morning.' },
  amphetamines: { id: 'amphetamines', name: 'Amphetamines', icon: '⚡', value: 18, description: 'Ambition in powder form, refined with the dedication of a scholar and the morals of a politician. Turns all-nighters into alibis, deadlines into paydays, and productive citizens into profitable customers. Energy drinks for people who\'ve given up on sleep and sobriety.' },
  diluted_cocaine: { id: 'diluted_cocaine', name: 'Diluted Cocaine', icon: '❄️', value: 22, description: 'Light on purity, heavy on margins, and perfect for customers who can\'t tell the difference between premium and pretense. The accountant\'s favorite blend and the lawyer\'s preferred defense. Cuts corners and costs with equal efficiency.' },
  basic_meth: { id: 'basic_meth', name: 'Basic Meth', icon: '💎', value: 25, description: 'The blue-collar blizzard that works overtime and never calls in sick. Rough around the edges like a construction worker\'s hands, devastatingly effective on the books like a mob accountant\'s ledger. No frills, all thrills, and guaranteed to keep your customers coming back for more.' },
  assorted_pills: { id: 'assorted_pills', name: 'Assorted Pills', icon: '💊', value: 28, description: 'A rainbow of plausible deniability packaged with the care of a pharmacist and the conscience of a snake oil salesman. Something for every mood, every markup, and every excuse you\'ll need when the authorities come knocking. Variety is the spice of life and the salt in your legal wounds.' },
  pure_cocaine: { id: 'pure_cocaine', name: 'Pure Cocaine', icon: '🏔️', value: 35, description: 'Snow from the mountaintop, refined with the precision of a Swiss banker and the purity of fresh-fallen lies. Pricey as a politician\'s promise, pristine as a judge\'s reputation, and habit-forming for customers and revenue charts alike. The champagne of controlled substances.' },
  crack: { id: 'crack', name: 'Crack', icon: '🪨', value: 38, description: 'Rock-solid profits crystallized into bite-sized pieces of concentrated capitalism. Fast to move like a guilty conscience, faster to regret like a midnight confession, and impossible to ignore like a subpoena. The pebbles that build empires and destroy families with equal efficiency.' },
  crystal_meth: { id: 'crystal_meth', name: 'Crystal Meth', icon: '💠', value: 45, description: 'Glass that shatters lives and sales targets with the precision of a master craftsman and the subtlety of a sledgehammer. Handle behind gloves and lawyers, store behind locked doors and unlocked consciences. Beautiful as a diamond, deadly as a mob hit.' },
  base_heroin: { id: 'base_heroin', name: 'Base Heroin', icon: '🧪', value: 55, description: 'The quiet storm that whispers promises and delivers nightmares with the reliability of a Swiss watch and the morality of a loan shark. Moves silently through veins and streets, settles deeply into souls and bank accounts, bankrolls everything from mansions to morgues.' },
  refined_heroin: { id: 'refined_heroin', name: 'Refined Heroin', icon: '💉', value: 70, description: 'Polished poison for premium clients who demand excellence in their self-destruction. Packaged in velvet boxes with silk ribbons, delivered with iron consequences and steel resolve. The Rolls Royce of regret, the Rolex of ruin, the caviar of catastrophe.' },
  luxury_synthetics: { id: 'luxury_synthetics', name: 'Luxury Synthetics', icon: '🌟', value: 80, description: 'Designer highs for the boardroom criminal who appreciates fine craftsmanship in their chemical escapism. Discreet packaging that screams class, indiscreet profits that whisper success. Custom-tailored euphoria for the executive who has everything except a clear conscience.' },
  
  // Distillery Products (translated to English)
  craft_beer: { id: 'craft_beer', name: 'Craft Beer', icon: '🍺', value: 20, description: 'Hipster camouflage for a criminal enterprise, brewed with the passion of an artist and the conscience of a tax evader. Bitter notes that mask sweet intentions, sweet margins that hide bitter truths. Artisanal alcohol for the authentically corrupt.' },
  simple_wine: { id: 'simple_wine', name: 'Simple Wine', icon: '🍷', value: 30, description: 'Respectable enough to gift to your mother-in-law, cheap enough to forget you ever made it, and smooth enough to wash down the taste of your questionable life choices. A gateway bottle to better crimes and worse decisions.' },
  mead: { id: 'mead', name: 'Mead', icon: '🍯', value: 28, description: 'Honeyed history in a bottle, sweet as a grandmother\'s lies and twice as intoxicating. Knights drank it before battle; your clients prefer it chilled and untraceable before their own wars against sobriety and the law. Medieval tradition meets modern corruption.' },
  cider: { id: 'cider', name: 'Cider', icon: '🍎', value: 32, description: 'Sweet bite with a sharp markup that would make a loan shark blush. Farmers grow apples with honest sweat; you grow empires with dishonest profits. From orchard to empire, one fermented fruit at a time. Nature\'s candy turned into capitalism\'s currency.' },
  rum: { id: 'rum', name: 'Rum', icon: '🏴‍☠️', value: 40, description: 'Pirate fuel for modern smugglers who\'ve traded cutlasses for calculators and parrots for lawyers. Mixes well with cola and plausible deniability, burns smooth going down and smoother when the evidence needs destroying. Yo ho ho and a bottle of tax evasion.' },
  vodka: { id: 'vodka', name: 'Vodka', icon: '🍸', value: 44, description: 'Crystal-clear cover story distilled with the purity of fresh snow and the morality of dirty money. The spirit of poor decisions and great revenue, transparent as your alibis and twice as effective. Russian roulette in liquid form—every shot\'s a gamble.' },
  tequila: { id: 'tequila', name: 'Tequila', icon: '🌵', value: 55, description: 'Sun in a bottle, trouble in a glass, and regret in the morning. Born from desert plants that know how to survive in harsh conditions—just like your business model. Salt, lime, and silence at the door; questions, answers, and alibis on the floor.' },
  whisky: { id: 'whisky', name: 'Whisky', icon: '🥃', value: 65, description: 'Aged oak meets aged lies in a marriage of wood and wickedness. Sipped slowly by gentlemen while negotiations happen quickly between criminals. Smooth as a politician\'s promise, warm as a judge\'s handshake, and twice as likely to get you in trouble.' },
  absinthe: { id: 'absinthe', name: 'Absinthe', icon: '🧪', value: 80, description: 'Green visions for black budgets, distilled with the madness of a poet and the precision of a chemist. Not illegal in most places, just ill-advised in all of them. The drink that makes artists see angels and accountants see profit margins. Hallucinations sold separately.' },
  champagne: { id: 'champagne', name: 'Champagne', icon: '🍾', value: 95, description: 'The sound of a cork popping is the sound of money leaving someone else\'s wallet and entering yours. Bubbles rise like your profits, celebrations flow like your cash, and hangovers last like your criminal record. Luxury in liquid form for the morally liquid.' },
  premium_liqueur: { id: 'premium_liqueur', name: 'Premium Liqueur', icon: '🥂', value: 120, description: 'Silk in a glass, smooth as a con artist\'s tongue and twice as intoxicating. Dessert for people who eat fines for breakfast, bribes for lunch, and sleep on beds made of unmarked bills. The nightcap for those whose nights never truly end.' },
  cognac: { id: 'cognac', name: 'Cognac', icon: '🍷', value: 140, description: 'Old money flavor with new money problems and ancient criminal wisdom. Aged longer than most prison sentences, smoother than most alibis, and more expensive than most lawyers. Best enjoyed with unmarked bills and untraced phones.' },
  illegal_energy_drink: { id: 'illegal_energy_drink', name: 'Illegal Energy Drink', icon: '⚡', value: 160, description: 'Banned in three countries, beloved in five neighborhoods, and regulated nowhere that matters. Keeps the crew awake during long nights of questionable activities and the regulators asleep with well-placed donations. Energy drinks for people who\'ve given up on both sleep and the law.' },
  special_cocktails: { id: 'special_cocktails', name: 'Special Cocktails', icon: '🍹', value: 180, description: 'Mixology meets mythology in a glass that holds more secrets than the Vatican archives. Garnished with a twist of risk, a sprig of perjury, and an olive stuffed with plausible deniability. Shaken, not stirred, and definitely not mentioned to the authorities.' },

  // Smuggling - Junk
  pile_of_junk: { id: 'pile_of_junk', name: 'Pile of Junk', icon: '🗑️', value: 1, description: 'Looks worthless as a politician\'s promise, smells worse than a fish market in August, and occasionally hides something priceless like a diamond in a dumpster. Usually not your lucky day, but sometimes the trash gods smile upon the morally flexible.' },
  
  // Legacy smuggling items used in starter save
  contraband_cigarettes: { id: 'contraband_cigarettes', name: 'Contraband Cigarettes', icon: '🚬', value: 6, description: 'Untaxed like a mob lawyer\'s conscience, untracked like a ghost\'s footsteps, and undeniably profitable like a casino in Vegas. The gateway cargo for aspiring criminals who want to start small and dream big. Baby steps toward bigger sins.' },
  fake_documents: { id: 'fake_documents', name: 'Fake Documents', icon: '📄', value: 12, description: 'Paperwork that says "totally legit" in twelve fonts and three languages, none of which are entirely truthful. Good enough for customs agents with poor eyesight, better for business deals with flexible morality. Authenticity is overrated when profit margins are underestimated.' },
  stolen_electronics: { id: 'stolen_electronics', name: 'Stolen Electronics', icon: '📱', value: 40, description: 'Latest models with yesterday\'s serial numbers, no box, no warranty, and definitely no questions asked. If it powers on, it pays out; if it doesn\'t, well, that\'s what insurance fraud is for. Technology for people who believe ownership is just a social construct.' },
  
  // Zone 1 - Docks (Rare Items)
  luxury_watches: { id: 'luxury_watches', name: 'Luxury Watches', icon: '⌚', value: 120, description: 'Time is money, and these tell both with the precision of a Swiss banker and the subtlety of a mob accountant. Ticks softly like a guilty conscience, screams status like a federal indictment. Every second counts when you\'re counting dirty money.' },
  smartphones: { id: 'smartphones', name: 'Smartphones', icon: '📱', value: 85, description: 'Pocket supercomputers with convenient amnesia and flexible ownership history. Factory reset like a witness\'s memory, conscience not included in the package. Smart enough to make calls, dumb enough to forget where they came from.' },
  stolen_cargo: { id: 'stolen_cargo', name: 'Stolen Cargo', icon: '📦', value: 80, description: 'Mislabeled with the creativity of a tax evader, misdirected with the precision of a postal worker, and magnificently profitable like a casino in Vegas. The box is your best friend and your only witness.' },
  
  // Zone 2 - Warehouse District (Rare Items)
  gaming_consoles: { id: 'gaming_consoles', name: 'Gaming Consoles', icon: '🎮', value: 150, description: 'Next-gen fun for morally flexible households who believe ownership is just a social construct. Always in stock somewhere, usually not where they started. Entertainment systems for people who find traditional shopping too entertaining.' },
  laptops: { id: 'laptops', name: 'High-End Laptops', icon: '💻', value: 200, description: 'Thin as a politician\'s promise, light as a mob lawyer\'s conscience, and incredibly easy to resell to people who don\'t ask questions. Passwords wiped cleaner than a crime scene, margins cleaner than your reputation.' },
  heavy_machinery_parts: { id: 'heavy_machinery_parts', name: 'Heavy Machinery Parts', icon: '⚙️', value: 120, description: 'Industrial-grade anonymity wrapped in steel and grease. Heavy as your conscience should be, valuable as your silence needs to be. The buyer always knows a guy who knows a guy who doesn\'t ask questions about serial numbers.' },
  
  // Zone 3 - Black Market (Rare Items)
  designer_bags: { id: 'designer_bags', name: 'Designer Bags', icon: '👜', value: 180, description: 'Luxury stitched with secrecy and lined with plausible deniability. Genuine enough to fool the rich, fake enough to fund your rise, and expensive enough to make everyone forget to ask questions. Fashion statements for the morally fashionable.' },
  fake_passports: { id: 'fake_passports', name: 'Fake Passports', icon: '📘', value: 100, description: 'New identities with yesterday\'s glue and tomorrow\'s problems. Crafted with the attention to detail of a Swiss watchmaker and the morals of a snake oil salesman. Travel light, travel quiet, travel with someone else\'s name.' },
  gold_bars: { id: 'gold_bars', name: 'Gold Bars', icon: '🥇', value: 250, description: 'Heavy as your sins, shiny as your alibis, and unquestioned like a judge\'s integrity. The universal language of disappearing wealth and appearing innocence. Speaks fluent corruption in every currency.' },
  
  // Zone 4 - Underground Tunnels (Rare Items)
  stolen_jewelry: { id: 'stolen_jewelry', name: 'Stolen Jewelry', icon: '💍', value: 110, description: 'Sparkle that changes owners more than hands and stories more than settings. Elegant as a mob lawyer\'s argument, portable as a guilty conscience, and persuasive as a loaded gun. Diamonds are forever, ownership is temporary.' },
  vintage_cameras: { id: 'vintage_cameras', name: 'Vintage Cameras', icon: '📷', value: 160, description: 'Retro charm with modern prices and questionable provenance. Captures memories and creates alibis with equal precision. Collectors pay more when it\'s slightly illegal, and significantly more when it\'s completely untraceable.' },
  rare_minerals: { id: 'rare_minerals', name: 'Rare Minerals', icon: '💎', value: 180, description: 'Rocks that buy respect and silence in equal measure. Tough to source like a honest politician, tougher to trace like a mob accountant\'s ledger. Geological treasures for people who treasure geological anonymity.' },
  
  // Zone 5 - Airport Cargo (Rare Items)
  drones: { id: 'drones', name: 'High-Tech Drones', icon: '🚁', value: 300, description: 'Eyes in the sky for buyers on the fly and sellers on the run. Surveillance technology for people who prefer to avoid being surveilled. Batteries sold separately, loyalty never included, discretion always guaranteed.' },
  luxury_perfumes: { id: 'luxury_perfumes', name: 'Luxury Perfumes', icon: '🧴', value: 160, description: 'Smells like innocence, priced like guilt, and packaged like evidence that needs to disappear. The scent of clean exits and dirty money. Fragrance for people who want to smell good while doing bad things.' },
  diplomatic_pouches: { id: 'diplomatic_pouches', name: 'Diplomatic Pouches', icon: '💼', value: 200, description: 'Technically untouchable like a mob boss\'s alibi, practically irresistible like a casino jackpot. Contents unknown and better left that way, profits known and better counted quickly. Diplomatic immunity sold separately.' },
  
  // Zone 6 - Border Crossing (Rare Items)
  sports_cars: { id: 'sports_cars', name: 'Luxury Sports Cars', icon: '🏎️', value: 500, description: 'Zero to warrant in 3.2 seconds, zero to disappeared in even less. Loud engines that drown out the sirens, louder alibis that drown out the truth. Speed machines for people who need to make quick exits and quicker profits.' },
  precious_metals: { id: 'precious_metals', name: 'Precious Metals', icon: '🥈', value: 350, description: 'Shiny investments for dull paperwork and sharp business practices. Melts down faster than a witness under pressure, marks up higher than a mob lawyer\'s fees. Precious as your freedom, valuable as your silence.' },
  banned_substances: { id: 'banned_substances', name: 'Banned Substances', icon: '☣️', value: 300, description: 'Forbidden fruit by the container, shipped with the care of a grandmother and the morals of a loan shark. Hazardous to careers and health records, healthy for cash flow and offshore accounts. Warning labels sold separately.' },
  
  // Zone 7 - Cyber Network (Rare Items)
  crypto_wallets: { id: 'crypto_wallets', name: 'Crypto Wallets', icon: '💳', value: 400, description: 'Digital loot with analog consequences and virtual morality. If you can\'t see it, can they seize it? If you can\'t touch it, can they trace it? Modern problems require modern solutions and ancient criminal wisdom.' },
  server_hardware: { id: 'server_hardware', name: 'Server Hardware', icon: '🖥️', value: 280, description: 'Racks of quiet power and loud profits. Processes data faster than a mob accountant, stores secrets better than a Swiss bank. Moves fast when the fans stop spinning and the heat starts rising.' },
  classified_intel: { id: 'classified_intel', name: 'Classified Intel', icon: '🗂️', value: 350, description: 'Secrets by the folder, lies by the page, and blackmail by the paragraph. Priceless to the right buyer, perjury to the wrong prosecutor, and profitable to the morally flexible middleman. Information is power, and power corrupts beautifully.' },
  
  // Zone 8 - Art Underground (Rare Items)
  stolen_paintings: { id: 'stolen_paintings', name: 'Stolen Paintings', icon: '🖼️', value: 200, description: 'Masterpieces with mobility and flexible ownership history. Art appreciates faster than your criminal record, witnesses forget quicker than your conscience. Culture for people who appreciate the finer things in their morally flexible lifestyle.' },
  vintage_wines: { id: 'vintage_wines', name: 'Vintage Wines', icon: '🍷', value: 320, description: 'Aged in cellars like fine criminals, fenced in minutes like hot merchandise. Bottled respect for uncorked cash and corked consciences. Vintage quality for people who appreciate the finer things in their questionable lifestyle.' },
  museum_pieces: { id: 'museum_pieces', name: 'Museum Pieces', icon: '🗿', value: 400, description: 'Culture with a criminal record and a flexible exhibition history. Ancient artifacts for modern criminals who appreciate historical irony. Display privately in your mansion, brag publicly at your trial.' },
  
  // Zone 9 - Military Complex (Rare Items)
  military_vehicles: { id: 'military_vehicles', name: 'Military Vehicles', icon: '🚗', value: 800, description: 'Armored assets for aggressive negotiations and defensive driving. Built to withstand enemy fire and federal investigations with equal efficiency. Parked quietly in secure locations, sold loudly to the highest bidder.' },
  advanced_optics: { id: 'advanced_optics', name: 'Advanced Optics', icon: '🔭', value: 450, description: 'See farther than the law allows, sell faster than the authorities can track. Precision parts for imprecise people who need to keep an eye on their competition and their escape routes. Vision enhancement for the morally impaired.' },
  satellite_equipment: { id: 'satellite_equipment', name: 'Satellite Equipment', icon: '📡', value: 600, description: 'Space-grade hardware with ground-level ethics and underground connections. Communication technology for people who prefer their conversations unmonitored. Point it anywhere but the cops, use it for anything but legal purposes.' },
  
  // Zone 10 - International Syndicate (Rare Items)
  supercars: { id: 'supercars', name: 'Exotic Supercars', icon: '🏁', value: 1500, description: 'Status on wheels with horsepower that matches your criminal ambitions. Faster than a fleeing witness, more expensive than a good lawyer. Buyers test-drive with gloves and wire transfers, sellers disappear with briefcases and new identities.' },
  private_jets: { id: 'private_jets', name: 'Private Jets', icon: '✈️', value: 2000, description: 'Wings for the well-connected and well-funded criminal elite. Goes over international borders like they\'re suggestions, under government radars like they\'re optional. First-class travel for people with no class.' },
  quantum_processors: { id: 'quantum_processors', name: 'Quantum Processors', icon: '🔮', value: 1200, description: 'Tomorrow\'s tech fenced today with yesterday\'s morals. Computing power that exists in multiple states simultaneously - legal, illegal, and profitable. If you understand it, you\'re overqualified to buy it; if you can afford it, you\'re underqualified to own it.' },

  // Thieving Tools
  lockpick_basic: { id: 'lockpick_basic', name: 'Lockpick', icon: '🔑', value: 5, description: 'The skeleton key to other people\'s problems. Opens doors, hearts, and federal investigations with equal ease. Every lock is just a puzzle waiting to be solved.' },
  safe_toolkit: { id: 'safe_toolkit', name: 'Safe Toolkit', icon: '🧰', value: 20, description: 'Professional-grade persuasion for stubborn metal boxes. When \'please\' and \'pretty please\' fail, these tools speak a language every safe understands: brute force and finesse.' },
  distraction_gadget: { id: 'distraction_gadget', name: 'Distraction Gadget', icon: '🎯', value: 12, description: 'Redirects attention like a politician redirects blame. While they\'re looking left, you\'re working right. The magician\'s best friend and the security guard\'s worst nightmare.' },

  // Thieving Loot - Basic Money & Items
  wallet: { id: 'wallet', name: 'Wallet', icon: '👛', value: 8, description: 'Leather pockets full of loose morality and looser change. If it\'s not chained down like a mob informant, it\'s yours by right of superior finger dexterity. Contains someone else\'s hopes, dreams, and grocery money.' },
  loose_change: { id: 'loose_change', name: 'Cash', icon: '💵', value: 3, description: 'Crumpled dreams and lunch money that fell through the cracks of someone else\'s budget. Not glamorous like a bank heist, just guaranteed like taxes and moral compromise. Small bills, smaller conscience required.' },
  cheap_watch: { id: 'cheap_watch', name: 'Cheap Watch', icon: '⌚', value: 12, description: 'Ticks loud like a guilty conscience, pays quiet like a mob lawyer\'s fee. The beginner\'s bling with veteran resale value. Tells time poorly but sells quickly to people who don\'t ask about provenance.' },
  
  // Basic Materials (from small store)
  apples: { id: 'apples', name: 'Apples', icon: '🍎', value: 2, description: 'Healthy profits in every bite, wholesome as your grandmother\'s lies. Great for alibis (\'I was just grocery shopping, officer\') and vitamin C deficiencies. The most innocent-looking contraband in your criminal portfolio.' },
  bread: { id: 'bread', name: 'Bread', icon: '🍞', value: 3, description: 'Slices neatly into excuses and even neater profit margins. Staple food for honest families, staple markup for dishonest entrepreneurs. The staff of life for people whose life needs a good alibi.' },
  milk: { id: 'milk', name: 'Milk', icon: '🥛', value: 2, description: 'Perishable cover stories with an expiration date shorter than your moral flexibility. Goes missing faster than dignity on payday and witnesses in federal custody. Fresh from farms that definitely exist and definitely aren\'t money laundering fronts.' },
  canned_goods: { id: 'canned_goods', name: 'Canned Goods', icon: '🥫', value: 4, description: 'Long shelf life like a mob boss\'s grudge, longer paper trail unless you own the shelf and the store and the distributor. Preserved food for people who need their business dealings preserved in legal amber.' },
  
  // Safe Loot
  safe_cash: { id: 'safe_cash', name: 'Safe Cash', icon: '💸', value: 150, description: 'Money that thought it was safe behind steel doors and electronic locks. Teaches humility to vault designers and valuable lessons about the impermanence of security. Previously owned by people who trusted their safes more than their accountants.' },
  guns: { id: 'guns', name: 'Guns', icon: '🔫', value: 200, description: 'Negotiation tools with permanent punctuation and final arguments. Buy low, stay low, and remember that the loudest voice in the room usually belongs to the person holding these. Conflict resolution for people who\'ve given up on conflict avoidance.' },
  contracts: { id: 'contracts', name: 'Contracts', icon: '📋', value: 120, description: 'Legalese that screams "pay me" in twelve different fonts and three dead languages. Valuable to those who fear signatures more than subpoenas. Paper trails that lead to golden parachutes and silver handcuffs.' },
  
  // Jewelry Store Loot
  rare_gems: { id: 'rare_gems', name: 'Rare Gems', icon: '💎', value: 400, description: 'Compressed money with excellent clarity and questionable origins. Cuts glass and heat alike, sparkles brighter than your future, and costs more than most people\'s houses. Geological lottery tickets for the morally flexible.' },
  diamond_rings: { id: 'diamond_rings', name: 'Diamond Rings', icon: '💍', value: 350, description: 'Engagements canceled, profits confirmed, and promises broken like the hearts that once wore them. Shiny circles of plausible deniability that sparkle brighter than the tears of their former owners. Love may be temporary, but diamonds are forever profitable.' },
  gold_jewelry: { id: 'gold_jewelry', name: 'Gold Jewelry', icon: '📿', value: 280, description: 'Wearable savings accounts with better interest rates than most banks and fewer questions than most accountants. Easy to hide in plain sight, easier to move across borders, and easiest to explain as \'family heirlooms\' with flexible family trees.' },
  
  // Bank Vault Loot
  bank_bonds: { id: 'bank_bonds', name: 'Bank Bonds', icon: '📈', value: 800, description: 'Boring on paper like a tax return, thrilling at auction like a mob trial. The mature criminal\'s payday for those who\'ve graduated from petty theft to sophisticated financial instruments. Bonds that bind you to a life of luxury and legal complications.' },
  gold_bullion: { id: 'gold_bullion', name: 'Gold Bullion', icon: '🥇', value: 1200, description: 'Bricks of silence that speak louder than words and cost more than most people\'s annual salaries. Stackable trust in a loud world, portable wealth for people who don\'t trust banks, governments, or anyone with a badge.' },
  vault_cash: { id: 'vault_cash', name: 'Vault Cash', icon: '💰', value: 1500, description: 'Cash that naps behind steel doors and electronic locks, dreaming of freedom and offshore accounts. Wakes up in your possession with a slight case of amnesia about its previous owners. Money that thought it was untouchable until it met you.' },
  
  // Casino Loot
  casino_chips: { id: 'casino_chips', name: 'Casino Chips', icon: '🎲', value: 1000, description: 'Plastic promises backed by desperation and guaranteed by the house\'s mathematical advantage. Easy to launder like dirty money, easier to lose like your moral compass. Currency for people who believe luck is a business strategy.' },
  high_roller_cash: { id: 'high_roller_cash', name: 'High Roller Cash', icon: '💵', value: 1800, description: 'Thick wads with thin excuses and thinner moral justifications. VIP stands for Very Interesting Payout, Very Illegal Profits, and Very Implausible Paperwork. Money that rolls high and lands in your pocket.' },
  jackpot_winnings: { id: 'jackpot_winnings', name: 'Jackpot Winnings', icon: '🎰', value: 2500, description: 'Lightning in a briefcase, captured at the moment of maximum voltage and minimum oversight. Someone else\'s luck becomes your logistics, their celebration becomes your calculation. The house always wins, but sometimes you win against the house.' },
  
  // Drug Dealer Loot
  rival_drugs: { id: 'rival_drugs', name: 'Rival Drugs', icon: '💊', value: 180, description: 'Competitor inventory converted to community service through aggressive market consolidation. Waste not, want not, and definitely don\'t let good product go to waste just because it belonged to someone who can\'t complain anymore.' },
  dealer_cash: { id: 'dealer_cash', name: 'Dealer Cash', icon: '💵', value: 120, description: 'Untaxed like a mob lawyer\'s conscience, uncounted like a politician\'s promises, and unexpectedly yours through superior negotiation tactics. Street dividends from the school of hard knocks and harder currency.' },
  drug_supplies: { id: 'drug_supplies', name: 'Drug Supplies', icon: '🧪', value: 80, description: 'Beakers, baggies, and bad intentions packaged with the care of a grandmother and the morals of a loan shark. Everything you need for a successful chemistry career except the alibi, the lawyer, and the moral compass.' },
  
  // Car Theft Loot
  stolen_cars: { id: 'stolen_cars', name: 'Stolen Cars', icon: '🚗', value: 600, description: 'Pre-owned speed with post-sale paperwork and flexible ownership history. Keep the keys, lose the plates, and remember that possession is nine-tenths of the law when the other tenth is looking the other way.' },
  car_parts: { id: 'car_parts', name: 'Car Parts', icon: '🔧', value: 180, description: 'Vehicles, politely disassembled with the precision of a Swiss watchmaker and the ethics of a chop shop operator. Sells best in pieces and whispers, like secrets and mob informants. Some assembly required, conscience not included.' },
  vehicle_electronics: { id: 'vehicle_electronics', name: 'Vehicle Electronics', icon: '📱', value: 250, description: 'Brains you can bag and sell to the highest bidder with the fewest questions. Chip shortages make for fat envelopes and fatter profit margins. Technology that\'s smarter than most criminals and more valuable than most alibis.' },
  
  // Armored Car Loot
  armored_cash: { id: 'armored_cash', name: 'Armored Cash', icon: '💰', value: 2000, description: 'Money with a security complex and trust issues, previously protected by steel, guards, and federal regulations. Worth the noise if you survive the sirens, the investigation, and the inevitable plea bargaining. High risk, higher reward.' },
  security_equipment: { id: 'security_equipment', name: 'Security Equipment', icon: '🛡️', value: 400, description: 'Tools designed to stop you, now helping you with the dedication of a reformed criminal and the efficiency of a Swiss bank. Irony sells at a premium to people who appreciate the finer points of poetic justice and profitable contradictions.' },
  transport_bonds: { id: 'transport_bonds', name: 'Transport Bonds', icon: '📜', value: 800, description: 'Paper that moves mountains of money with the efficiency of a Swiss banker and the discretion of a mob lawyer. Best stored offshore and off-record, like your conscience and your tax returns. Financial instruments for people who play by different rules.' },
  
  // Wine Store Loot (keeping this one)
  premium_wine: { id: 'premium_wine', name: 'Premium Wine', icon: '🍾', value: 85, description: 'Aged like a lie told often and believed by many. Pairs well with cash and discretion, complements any meal that needs to be forgotten, and goes perfectly with conversations that never happened. Vintage quality for people with vintage morals.' },

  // Dungeon rewards
  loot_bag: { id: 'loot_bag', name: 'Treasure Bag', icon: '🧰', value: 50, description: 'A sealed bag of mafia spoils. Open later to reveal random dungeon loot.' },

  // Equippable items (as resources so they can live in bank)
  iron_dagger: { id: 'iron_dagger', name: 'Iron Dagger', icon: '🗡️', value: 50, description: 'Basic blade favored by rookies and professionals on a budget.' },
  wooden_shield: { id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️', value: 40, description: 'Rough but reliable protection for your off-hand.' },
  leather_cap: { id: 'leather_cap', name: 'Leather Cap', icon: '🪖', value: 35, description: 'Simple headwear that softens a few blows.' },
  leather_vest: { id: 'leather_vest', name: 'Leather Vest', icon: '🥋', value: 60, description: 'Light chestwear offering modest defense.' },
  leather_pants: { id: 'leather_pants', name: 'Leather Pants', icon: '👖', value: 45, description: 'Flexible protection for agile operators.' },
  leather_boots: { id: 'leather_boots', name: 'Leather Boots', icon: '🥾', value: 40, description: 'Quiet steps and a bit of padding.' },
  simple_ring: { id: 'simple_ring', name: 'Simple Ring', icon: '💍', value: 55, description: 'A modest band said to sharpen focus.' },
  street_amulet: { id: 'street_amulet', name: 'Street Amulet', icon: '📿', value: 55, description: 'A lucky charm that helps dodge trouble.' },

};

export const ACTIVITIES: Record<string, Activity[]> = {
  drug_factory: [
    {
      id: 'handmade_cigarettes',
      name: 'Handmade Cigarettes',
      skillId: 'drug_factory',
      baseTime: 3000,
      baseXp: 15,
      levelRequired: 1,
      resource: RESOURCES.handmade_cigarettes,
      inputs: [
        { resourceId: 'plant_matter', quantity: 1 },
        { resourceId: 'paper', quantity: 1 }
      ],
      failureChance: 20,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 1),
    },
    {
      id: 'simple_joints',
      name: 'Simple Joints',
      skillId: 'drug_factory',
      baseTime: 3500,
      baseXp: 25,
      levelRequired: 5,
      resource: RESOURCES.simple_joints,
      inputs: [
        { resourceId: 'plant_matter', quantity: 2 },
        { resourceId: 'paper', quantity: 1 }
      ],
      failureChance: 18,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 5),
    },
    {
      id: 'premium_joints',
      name: 'Premium Joints',
      skillId: 'drug_factory',
      baseTime: 4000,
      baseXp: 45,
      levelRequired: 12,
      resource: RESOURCES.premium_joints,
      inputs: [
        { resourceId: 'plant_matter', quantity: 2 },
        { resourceId: 'paper', quantity: 2 },
        { resourceId: 'binder', quantity: 1 }
      ],
      failureChance: 15,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 12),
    },
    {
      id: 'pressed_hash',
      name: 'Pressed Hash',
      skillId: 'drug_factory',
      baseTime: 4500,
      baseXp: 75,
      levelRequired: 18,
      resource: RESOURCES.pressed_hash,
      inputs: [
        { resourceId: 'plant_matter', quantity: 3 },
        { resourceId: 'solvent', quantity: 1 },
        { resourceId: 'binder', quantity: 1 }
      ],
      failureChance: 15,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 18),
    },
    {
      id: 'artisan_lsd',
      name: 'Artisan LSD',
      skillId: 'drug_factory',
      baseTime: 5000,
      baseXp: 120,
      levelRequired: 22,
      resource: RESOURCES.artisan_lsd,
      inputs: [
        { resourceId: 'chemical', quantity: 2 },
        { resourceId: 'substrate', quantity: 2 }
      ],
      failureChance: 12,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 22),
    },
    {
      id: 'ecstasy',
      name: 'Ecstasy',
      skillId: 'drug_factory',
      baseTime: 5500,
      baseXp: 180,
      levelRequired: 25,
      resource: RESOURCES.ecstasy,
      inputs: [
        { resourceId: 'chemical', quantity: 2 },
        { resourceId: 'binder', quantity: 2 },
        { resourceId: 'catalyst', quantity: 1 }
      ],
      failureChance: 12,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 25),
    },
    {
      id: 'amphetamines',
      name: 'Amphetamines',
      skillId: 'drug_factory',
      baseTime: 6000,
      baseXp: 260,
      levelRequired: 30,
      resource: RESOURCES.amphetamines,
      inputs: [
        { resourceId: 'chemical', quantity: 3 },
        { resourceId: 'catalyst', quantity: 2 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 30),
    },
    {
      id: 'diluted_cocaine',
      name: 'Diluted Cocaine',
      skillId: 'drug_factory',
      baseTime: 6500,
      baseXp: 370,
      levelRequired: 35,
      resource: RESOURCES.diluted_cocaine,
      inputs: [
        { resourceId: 'plant_matter', quantity: 3 },
        { resourceId: 'chemical', quantity: 3 },
        { resourceId: 'solvent', quantity: 2 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 35),
    },
    {
      id: 'basic_meth',
      name: 'Basic Meth',
      skillId: 'drug_factory',
      baseTime: 7000,
      baseXp: 520,
      levelRequired: 45,
      resource: RESOURCES.basic_meth,
      inputs: [
        { resourceId: 'chemical', quantity: 4 },
        { resourceId: 'catalyst', quantity: 3 },
        { resourceId: 'solvent', quantity: 2 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 45),
    },
    {
      id: 'assorted_pills',
      name: 'Assorted Pills',
      skillId: 'drug_factory',
      baseTime: 7500,
      baseXp: 720,
      levelRequired: 50,
      resource: RESOURCES.assorted_pills,
      inputs: [
        { resourceId: 'chemical', quantity: 4 },
        { resourceId: 'binder', quantity: 3 },
        { resourceId: 'substrate', quantity: 3 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 50),
    },
    {
      id: 'pure_cocaine',
      name: 'Pure Cocaine',
      skillId: 'drug_factory',
      baseTime: 8000,
      baseXp: 980,
      levelRequired: 60,
      resource: RESOURCES.pure_cocaine,
      inputs: [
        { resourceId: 'premium_plant', quantity: 5 },
        { resourceId: 'premium_chemical', quantity: 4 },
        { resourceId: 'premium_solvent', quantity: 3 }
      ],
      failureChance: 8,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 60),
    },
    {
      id: 'crack',
      name: 'Crack',
      skillId: 'drug_factory',
      baseTime: 8500,
      baseXp: 1320,
      levelRequired: 65,
      resource: RESOURCES.crack,
      inputs: [
        { resourceId: 'pure_cocaine', quantity: 1 },
        { resourceId: 'solvent', quantity: 3 },
        { resourceId: 'catalyst', quantity: 2 }
      ],
      failureChance: 8,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 65),
    },
    {
      id: 'crystal_meth',
      name: 'Crystal Meth',
      skillId: 'drug_factory',
      baseTime: 9000,
      baseXp: 1750,
      levelRequired: 75,
      resource: RESOURCES.crystal_meth,
      inputs: [
        { resourceId: 'premium_chemical', quantity: 6 },
        { resourceId: 'premium_catalyst', quantity: 4 },
        { resourceId: 'premium_solvent', quantity: 4 }
      ],
      failureChance: 7,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 75),
    },
    {
      id: 'base_heroin',
      name: 'Base Heroin',
      skillId: 'drug_factory',
      baseTime: 9500,
      baseXp: 2300,
      levelRequired: 80,
      resource: RESOURCES.base_heroin,
      inputs: [
        { resourceId: 'premium_plant', quantity: 7 },
        { resourceId: 'premium_chemical', quantity: 7 },
        { resourceId: 'premium_catalyst', quantity: 5 }
      ],
      failureChance: 7,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 80),
    },
    {
      id: 'refined_heroin',
      name: 'Refined Heroin',
      skillId: 'drug_factory',
      baseTime: 10000,
      baseXp: 3000,
      levelRequired: 95,
      resource: RESOURCES.refined_heroin,
      inputs: [
        { resourceId: 'base_heroin', quantity: 1 },
        { resourceId: 'premium_chemical', quantity: 8 },
        { resourceId: 'premium_solvent', quantity: 6 },
        { resourceId: 'premium_catalyst', quantity: 6 }
      ],
      failureChance: 5,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 95),
    },
    {
      id: 'luxury_synthetics',
      name: 'Luxury Synthetics',
      skillId: 'drug_factory',
      baseTime: 10500,
      baseXp: 3900,
      levelRequired: 100,
      resource: RESOURCES.luxury_synthetics,
      inputs: [
        { resourceId: 'premium_chemical', quantity: 10 },
        { resourceId: 'premium_catalyst', quantity: 8 },
        { resourceId: 'premium_solvent', quantity: 8 },
        { resourceId: 'premium_plant', quantity: 10 },
        { resourceId: 'substrate', quantity: 5 }
      ],
      failureChance: 5,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDrugFactoryXp(level, 100),
    },
  ],
  distillery: [
    {
      id: 'craft_beer',
      name: 'Craft Beer',
      skillId: 'distillery',
      baseTime: 8000,
      baseXp: 120,
      levelRequired: 1,
      resource: RESOURCES.craft_beer,
      inputs: [
        { resourceId: 'water', quantity: 1 },
        { resourceId: 'alcohol_base', quantity: 1 },
        { resourceId: 'grains', quantity: 1 }
      ],
      failureChance: 15,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 1),
    },
    {
      id: 'simple_wine',
      name: 'Simple Wine',
      skillId: 'distillery',
      baseTime: 10000,
      baseXp: 180,
      levelRequired: 5,
      resource: RESOURCES.simple_wine,
      inputs: [
        { resourceId: 'water', quantity: 1 },
        { resourceId: 'alcohol_base', quantity: 1 },
        { resourceId: 'grapes', quantity: 1 }
      ],
      failureChance: 15,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 5),
    },
    {
      id: 'mead',
      name: 'Mead',
      skillId: 'distillery',
      baseTime: 9000,
      baseXp: 280,
      levelRequired: 10,
      resource: RESOURCES.mead,
      inputs: [
        { resourceId: 'water', quantity: 2 },
        { resourceId: 'alcohol_base', quantity: 1 },
        { resourceId: 'sugar', quantity: 1 }
      ],
      failureChance: 14,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 10),
    },
    {
      id: 'cider',
      name: 'Cider',
      skillId: 'distillery',
      baseTime: 9000,
      baseXp: 420,
      levelRequired: 15,
      resource: RESOURCES.cider,
      inputs: [
        { resourceId: 'water', quantity: 2 },
        { resourceId: 'alcohol_base', quantity: 2 },
        { resourceId: 'grapes', quantity: 1 }
      ],
      failureChance: 14,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 15),
    },
    {
      id: 'rum',
      name: 'Rum',
      skillId: 'distillery',
      baseTime: 10000,
      baseXp: 640,
      levelRequired: 20,
      resource: RESOURCES.rum,
      inputs: [
        { resourceId: 'water', quantity: 2 },
        { resourceId: 'alcohol_base', quantity: 2 },
        { resourceId: 'sugar', quantity: 2 }
      ],
      failureChance: 12,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 20),
    },
    {
      id: 'vodka',
      name: 'Vodka',
      skillId: 'distillery',
      baseTime: 11000,
      baseXp: 980,
      levelRequired: 30,
      resource: RESOURCES.vodka,
      inputs: [
        { resourceId: 'water', quantity: 3 },
        { resourceId: 'alcohol_base', quantity: 3 },
        { resourceId: 'grains', quantity: 2 }
      ],
      failureChance: 12,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 30),
    },
    {
      id: 'tequila',
      name: 'Tequila',
      skillId: 'distillery',
      baseTime: 11000,
      baseXp: 1520,
      levelRequired: 40,
      resource: RESOURCES.tequila,
      inputs: [
        { resourceId: 'water', quantity: 3 },
        { resourceId: 'alcohol_base', quantity: 3 },
        { resourceId: 'herbs', quantity: 2 }
      ],
      failureChance: 11,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 40),
    },
    {
      id: 'whisky',
      name: 'Whisky',
      skillId: 'distillery',
      baseTime: 12000,
      baseXp: 2520,
      levelRequired: 55,
      resource: RESOURCES.whisky,
      inputs: [
        { resourceId: 'premium_water', quantity: 4 },
        { resourceId: 'premium_alcohol', quantity: 4 },
        { resourceId: 'grains', quantity: 3 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 55),
    },
    {
      id: 'absinthe',
      name: 'Absinthe',
      skillId: 'distillery',
      baseTime: 13000,
      baseXp: 3840,
      levelRequired: 65,
      resource: RESOURCES.absinthe,
      inputs: [
        { resourceId: 'premium_water', quantity: 4 },
        { resourceId: 'premium_alcohol', quantity: 5 },
        { resourceId: 'premium_herbs', quantity: 3 }
      ],
      failureChance: 9,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 65),
    },
    {
      id: 'champagne',
      name: 'Champagne',
      skillId: 'distillery',
      baseTime: 14000,
      baseXp: 5720,
      levelRequired: 75,
      resource: RESOURCES.champagne,
      inputs: [
        { resourceId: 'premium_water', quantity: 5 },
        { resourceId: 'premium_alcohol', quantity: 5 },
        { resourceId: 'premium_grapes', quantity: 4 },
        { resourceId: 'sugar', quantity: 2 }
      ],
      failureChance: 8,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 75),
    },
    {
      id: 'premium_liqueur',
      name: 'Premium Liqueur',
      skillId: 'distillery',
      baseTime: 16000,
      baseXp: 8480,
      levelRequired: 85,
      resource: RESOURCES.premium_liqueur,
      inputs: [
        { resourceId: 'premium_water', quantity: 6 },
        { resourceId: 'premium_alcohol', quantity: 6 },
        { resourceId: 'premium_grapes', quantity: 3 },
        { resourceId: 'premium_herbs', quantity: 2 }
      ],
      failureChance: 7,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 85),
    },
    {
      id: 'cognac',
      name: 'Cognac',
      skillId: 'distillery',
      baseTime: 17000,
      baseXp: 12480,
      levelRequired: 90,
      resource: RESOURCES.cognac,
      inputs: [
        { resourceId: 'premium_water', quantity: 7 },
        { resourceId: 'premium_alcohol', quantity: 7 },
        { resourceId: 'premium_grapes', quantity: 5 },
        { resourceId: 'sugar', quantity: 3 }
      ],
      failureChance: 6,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 90),
    },
    {
      id: 'illegal_energy_drink',
      name: 'Illegal Energy Drink',
      skillId: 'distillery',
      baseTime: 18000,
      baseXp: 18200,
      levelRequired: 95,
      resource: RESOURCES.illegal_energy_drink,
      inputs: [
        { resourceId: 'premium_water', quantity: 8 },
        { resourceId: 'premium_alcohol', quantity: 8 },
        { resourceId: 'sugar', quantity: 5 },
        { resourceId: 'premium_herbs', quantity: 3 }
      ],
      failureChance: 5,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 95),
    },
    {
      id: 'special_cocktails',
      name: 'Special Cocktails',
      skillId: 'distillery',
      baseTime: 20000,
      baseXp: 26400,
      levelRequired: 100,
      resource: RESOURCES.special_cocktails,
      inputs: [
        { resourceId: 'premium_water', quantity: 10 },
        { resourceId: 'premium_alcohol', quantity: 10 },
        { resourceId: 'premium_grapes', quantity: 4 },
        { resourceId: 'sugar', quantity: 4 },
        { resourceId: 'premium_herbs', quantity: 4 },
        { resourceId: 'grains', quantity: 4 }
      ],
      failureChance: 5,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getDistilleryXp(level, 100),
    },
  ],
  investigation_lab: [
    {
      id: 'refine_premium_water',
      name: 'Refine Premium Water',
      skillId: 'investigation_lab',
      baseTime: 15000,
      baseXp: 150,
      levelRequired: 1,
      resource: RESOURCES.premium_water,
      inputs: [
        { resourceId: 'water', quantity: 5 },
        { resourceId: 'chemical', quantity: 2 }
      ],
      failureChance: 20,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 1),
    },
    {
      id: 'refine_premium_alcohol',
      name: 'Refine Premium Alcohol',
      skillId: 'investigation_lab',
      baseTime: 20000,
      baseXp: 250,
      levelRequired: 15,
      resource: RESOURCES.premium_alcohol,
      inputs: [
        { resourceId: 'alcohol_base', quantity: 5 },
        { resourceId: 'chemical', quantity: 3 },
        { resourceId: 'catalyst', quantity: 2 }
      ],
      failureChance: 18,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 15),
    },
    {
      id: 'refine_premium_grapes',
      name: 'Refine Premium Grapes',
      skillId: 'investigation_lab',
      baseTime: 18000,
      baseXp: 200,
      levelRequired: 25,
      resource: RESOURCES.premium_grapes,
      inputs: [
        { resourceId: 'grapes', quantity: 6 },
        { resourceId: 'sugar', quantity: 3 },
        { resourceId: 'water', quantity: 2 }
      ],
      failureChance: 15,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 25),
    },
    {
      id: 'refine_premium_herbs',
      name: 'Refine Premium Herbs',
      skillId: 'investigation_lab',
      baseTime: 22000,
      baseXp: 225,
      levelRequired: 35,
      resource: RESOURCES.premium_herbs,
      inputs: [
        { resourceId: 'herbs', quantity: 5 },
        { resourceId: 'plant_matter', quantity: 3 },
        { resourceId: 'solvent', quantity: 2 }
      ],
      failureChance: 15,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 35),
    },
    {
      id: 'refine_premium_chemical',
      name: 'Refine Premium Chemical',
      skillId: 'investigation_lab',
      baseTime: 25000,
      baseXp: 300,
      levelRequired: 45,
      resource: RESOURCES.premium_chemical,
      inputs: [
        { resourceId: 'chemical', quantity: 6 },
        { resourceId: 'catalyst', quantity: 4 },
        { resourceId: 'substrate', quantity: 2 }
      ],
      failureChance: 12,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 45),
    },
    {
      id: 'refine_premium_solvent',
      name: 'Refine Premium Solvent',
      skillId: 'investigation_lab',
      baseTime: 23000,
      baseXp: 275,
      levelRequired: 55,
      resource: RESOURCES.premium_solvent,
      inputs: [
        { resourceId: 'solvent', quantity: 7 },
        { resourceId: 'chemical', quantity: 3 },
        { resourceId: 'water', quantity: 3 }
      ],
      failureChance: 12,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 55),
    },
    {
      id: 'refine_premium_plant',
      name: 'Refine Premium Plant',
      skillId: 'investigation_lab',
      baseTime: 24000,
      baseXp: 290,
      levelRequired: 65,
      resource: RESOURCES.premium_plant,
      inputs: [
        { resourceId: 'plant_matter', quantity: 8 },
        { resourceId: 'herbs', quantity: 3 },
        { resourceId: 'substrate', quantity: 3 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 65),
    },
    {
      id: 'refine_premium_catalyst',
      name: 'Refine Premium Catalyst',
      skillId: 'investigation_lab',
      baseTime: 28000,
      baseXp: 350,
      levelRequired: 75,
      resource: RESOURCES.premium_catalyst,
      inputs: [
        { resourceId: 'catalyst', quantity: 7 },
        { resourceId: 'chemical', quantity: 5 },
        { resourceId: 'binder', quantity: 3 }
      ],
      failureChance: 10,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 75),
    },
    {
      id: 'synthesize_pure_cocaine',
      name: 'Synthesize Pure Cocaine',
      skillId: 'investigation_lab',
      baseTime: 35000,
      baseXp: 500,
      levelRequired: 85,
      resource: RESOURCES.pure_cocaine,
      inputs: [
        { resourceId: 'diluted_cocaine', quantity: 3 },
        { resourceId: 'premium_chemical', quantity: 4 },
        { resourceId: 'premium_solvent', quantity: 3 }
      ],
      failureChance: 8,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 85),
    },
    {
      id: 'synthesize_base_heroin',
      name: 'Synthesize Base Heroin',
      skillId: 'investigation_lab',
      baseTime: 40000,
      baseXp: 600,
      levelRequired: 95,
      resource: RESOURCES.base_heroin,
      inputs: [
        { resourceId: 'pressed_hash', quantity: 5 },
        { resourceId: 'premium_plant', quantity: 6 },
        { resourceId: 'premium_chemical', quantity: 5 },
        { resourceId: 'premium_catalyst', quantity: 4 }
      ],
      failureChance: 7,
      managerYield: 1.2,
      getDynamicXp: (level: number) => getInvestigationLabXp(level, 95),
    },
  ],
  smuggling: [], // Smuggling uses zones instead of activities
  thieving: [
    {
      id: 'pickpocket_citizen',
      name: 'Pickpocket Citizen',
      skillId: 'thieving',
      baseTime: 3000,
      getDynamicXp: (level: number) => getThievingXp(level, 1),
      baseXp: 64,
      levelRequired: 1,
      resource: RESOURCES.wallet,
      icon: '👤',
      failureChance: 5,
      arrestChance: 0.5,
      heatGenerated: 1,
      lootTable: [
        { resourceId: 'cash', minQuantity: 4, maxQuantity: 8, weight: 100 },
        { resourceId: 'wallet', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'cheap_watch', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'shoplift_small_store',
      name: 'Shoplift Small Store',
      skillId: 'thieving',
      baseTime: 6000,
      getDynamicXp: (level: number) => getThievingXp(level, 3),
      baseXp: 400,
      levelRequired: 3,
      resource: RESOURCES.apples,
      icon: '🏪',
      failureChance: 8,
      arrestChance: 2,
      heatGenerated: 2,
      lootTable: [
        { resourceId: 'cash', minQuantity: 7, maxQuantity: 13, weight: 100 },
        { resourceId: 'apples', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'bread', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'wallet', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'steal_wine_store',
      name: 'Steal from Wine Store',
      skillId: 'thieving',
      baseTime: 9000,
      getDynamicXp: (level: number) => getThievingXp(level, 6),
      baseXp: 480,
      levelRequired: 6,
      resource: RESOURCES.grapes,
      icon: '🍷',
      failureChance: 10,
      arrestChance: 3,
      heatGenerated: 3,
      lootTable: [
        { resourceId: 'cash', minQuantity: 10, maxQuantity: 20, weight: 100 },
        { resourceId: 'grapes', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'premium_wine', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'burglary_house',
      name: 'Burglary House',
      skillId: 'thieving',
      baseTime: 13500,
      getDynamicXp: (level: number) => getThievingXp(level, 8),
      baseXp: 540,
      levelRequired: 8,
      resource: RESOURCES.stolen_electronics,
      icon: '🏠',
      failureChance: 15,
      arrestChance: 8,
      heatGenerated: 4,
      lootTable: [
        { resourceId: 'cash', minQuantity: 15, maxQuantity: 30, weight: 100 },
        { resourceId: 'stolen_electronics', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'wallet', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'smartphones', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'steal_from_safe',
      name: 'Steal from Safe',
      skillId: 'thieving',
      baseTime: 26250,
      getDynamicXp: (level: number) => getThievingXp(level, 12),
      baseXp: 630,
      levelRequired: 12,
      resource: RESOURCES.safe_cash,
      icon: '🔒',
      failureChance: 20,
      arrestChance: 15,
      heatGenerated: 5,
      lootTable: [
        { resourceId: 'cash', minQuantity: 38, maxQuantity: 75, weight: 100 },
        { resourceId: 'contracts', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'guns', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'steal_from_rival_dealer',
      name: 'Steal from Rival Drug Dealer',
      skillId: 'thieving',
      baseTime: 33750,
      getDynamicXp: (level: number) => getThievingXp(level, 16),
      baseXp: 810,
      levelRequired: 16,
      resource: RESOURCES.rival_drugs,
      icon: '💊',
      failureChance: 25,
      arrestChance: 20,
      heatGenerated: 8,
      lootTable: [
        { resourceId: 'cash', minQuantity: 30, maxQuantity: 60, weight: 100 },
        { resourceId: 'rival_drugs', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'guns', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'drug_supplies', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'steal_cars',
      name: 'Steal Cars',
      skillId: 'thieving',
      baseTime: 45000,
      getDynamicXp: (level: number) => getThievingXp(level, 20),
      baseXp: 1080,
      levelRequired: 20,
      resource: RESOURCES.stolen_cars,
      icon: '🚗',
      failureChance: 30,
      arrestChance: 25,
      heatGenerated: 10,
      lootTable: [
        { resourceId: 'cash', minQuantity: 150, maxQuantity: 300, weight: 100 },
        { resourceId: 'car_parts', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'vehicle_electronics', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'rob_jewelry_store',
      name: 'Rob Jewelry Store',
      skillId: 'thieving',
      baseTime: 67500,
      getDynamicXp: (level: number) => getThievingXp(level, 25),
      baseXp: 1440,
      levelRequired: 25,
      resource: RESOURCES.rare_gems,
      icon: '💎',
      failureChance: 35,
      arrestChance: 30,
      heatGenerated: 12,
      lootTable: [
        { resourceId: 'cash', minQuantity: 250, maxQuantity: 500, weight: 100 },
        { resourceId: 'gold_jewelry', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'rare_gems', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'diamond_rings', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'rob_warehouse',
      name: 'Rob Warehouse',
      skillId: 'thieving',
      baseTime: 90000,
      getDynamicXp: (level: number) => getThievingXp(level, 30),
      baseXp: 1920,
      levelRequired: 30,
      resource: RESOURCES.stolen_cargo,
      icon: '🏭',
      failureChance: 40,
      arrestChance: 35,
      heatGenerated: 15,
      lootTable: [
        { resourceId: 'cash', minQuantity: 375, maxQuantity: 750, weight: 100 },
        { resourceId: 'stolen_cargo', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'gaming_consoles', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'heist_bank_vault',
      name: 'Heist Bank Vault',
      skillId: 'thieving',
      baseTime: 135000,
      getDynamicXp: (level: number) => getThievingXp(level, 35),
      baseXp: 2700,
      levelRequired: 35,
      resource: RESOURCES.bank_bonds,
      icon: '🏦',
      failureChance: 45,
      arrestChance: 40,
      heatGenerated: 18,
      lootTable: [
        { resourceId: 'cash', minQuantity: 1250, maxQuantity: 2500, weight: 100 },
        { resourceId: 'bank_bonds', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'contracts', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'gold_bullion', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'hijack_truck',
      name: 'Hijack Delivery Truck',
      skillId: 'thieving',
      baseTime: 112500,
      getDynamicXp: (level: number) => getThievingXp(level, 40),
      baseXp: 3600,
      levelRequired: 40,
      resource: RESOURCES.stolen_cargo,
      icon: '🚚',
      failureChance: 42,
      arrestChance: 38,
      heatGenerated: 16,
      lootTable: [
        { resourceId: 'cash', minQuantity: 750, maxQuantity: 1500, weight: 100 },
        { resourceId: 'stolen_cargo', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'luxury_watches', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'designer_bags', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'rob_armored_car',
      name: 'Rob Armored Money Car',
      skillId: 'thieving',
      baseTime: 180000,
      getDynamicXp: (level: number) => getThievingXp(level, 50),
      baseXp: 5400,
      levelRequired: 50,
      resource: RESOURCES.armored_cash,
      icon: '🚛',
      failureChance: 55,
      arrestChance: 50,
      heatGenerated: 22,
      lootTable: [
        { resourceId: 'cash', minQuantity: 2000, maxQuantity: 4000, weight: 100 },
        { resourceId: 'security_equipment', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'transport_bonds', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'steal_art_gallery',
      name: 'Steal from Art Gallery',
      skillId: 'thieving',
      baseTime: 150000,
      getDynamicXp: (level: number) => getThievingXp(level, 55),
      baseXp: 7200,
      levelRequired: 55,
      resource: RESOURCES.stolen_paintings,
      icon: '🖼️',
      failureChance: 50,
      arrestChance: 45,
      heatGenerated: 20,
      lootTable: [
        { resourceId: 'cash', minQuantity: 2500, maxQuantity: 5000, weight: 100 },
        { resourceId: 'stolen_paintings', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'museum_pieces', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'cyber_heist',
      name: 'Cyber Heist',
      skillId: 'thieving',
      baseTime: 225000,
      getDynamicXp: (level: number) => getThievingXp(level, 60),
      baseXp: 10800,
      levelRequired: 60,
      resource: RESOURCES.crypto_wallets,
      icon: '💻',
      failureChance: 52,
      arrestChance: 48,
      heatGenerated: 25,
      lootTable: [
        { resourceId: 'cash', minQuantity: 3750, maxQuantity: 7500, weight: 100 },
        { resourceId: 'crypto_wallets', minQuantity: 1, maxQuantity: 2, weight: 50 },
        { resourceId: 'classified_intel', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'heist_casino',
      name: 'Heist Casino',
      skillId: 'thieving',
      baseTime: 270000,
      getDynamicXp: (level: number) => getThievingXp(level, 70),
      baseXp: 15120,
      levelRequired: 70,
      resource: RESOURCES.casino_chips,
      icon: '🎰',
      failureChance: 60,
      arrestChance: 55,
      heatGenerated: 30,
      lootTable: [
        { resourceId: 'cash', minQuantity: 6250, maxQuantity: 12500, weight: 100 },
        { resourceId: 'casino_chips', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'gold_jewelry', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'diamond_rings', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },
    {
      id: 'steal_military_base',
      name: 'Steal from Military Base',
      skillId: 'thieving',
      baseTime: 270000,
      getDynamicXp: (level: number) => getThievingXp(level, 80),
      baseXp: 20160,
      levelRequired: 80,
      resource: RESOURCES.military_vehicles,
      icon: '🪖',
      failureChance: 65,
      arrestChance: 60,
      heatGenerated: 35,
      lootTable: [
        { resourceId: 'cash', minQuantity: 10000, maxQuantity: 20000, weight: 100 },
        { resourceId: 'military_vehicles', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'advanced_optics', minQuantity: 1, maxQuantity: 1, weight: 50 },
        { resourceId: 'satellite_equipment', minQuantity: 1, maxQuantity: 1, weight: 10 },
      ],
    },

  ],
};

// Equipment catalog describing stats and slots
export const EQUIPMENT_CATALOG: Record<string, Equipment> = {
  iron_dagger: {
    id: 'iron_dagger',
    name: 'Iron Dagger',
    slot: 'weapon',
    icon: '🗡️',
    levelRequired: 1,
    stats: { attack: 4, accuracy: 5, critChance: 2 },
    attackSpeed: 1.6,
  },
  wooden_shield: {
    id: 'wooden_shield',
    name: 'Wooden Shield',
    slot: 'offhand',
    icon: '🛡️',
    levelRequired: 1,
    stats: { defense: 6, evasion: 2 },
  },
  leather_cap: {
    id: 'leather_cap',
    name: 'Leather Cap',
    slot: 'helmet',
    icon: '🪖',
    levelRequired: 1,
    stats: { defense: 2 },
  },
  leather_vest: {
    id: 'leather_vest',
    name: 'Leather Vest',
    slot: 'chest',
    icon: '🥋',
    levelRequired: 1,
    stats: { defense: 4 },
  },
  leather_pants: {
    id: 'leather_pants',
    name: 'Leather Pants',
    slot: 'legs',
    icon: '👖',
    levelRequired: 1,
    stats: { defense: 3 },
  },
  leather_boots: {
    id: 'leather_boots',
    name: 'Leather Boots',
    slot: 'boots',
    icon: '🥾',
    levelRequired: 1,
    stats: { evasion: 3 },
  },
  simple_ring: {
    id: 'simple_ring',
    name: 'Simple Ring',
    slot: 'ring',
    icon: '💍',
    levelRequired: 1,
    stats: { accuracy: 3 },
  },
  street_amulet: {
    id: 'street_amulet',
    name: 'Street Amulet',
    slot: 'amulet',
    icon: '📿',
    levelRequired: 1,
    stats: { evasion: 2, critChance: 1 },
  },
};

export const SKILL_ICONS: Record<string, string> = {
  drug_factory: '🧪',
  distillery: '🥃',
  smuggling: '💼',
  bank: '🏦',
  investigation_lab: '🔬',
  thieving: '🥷',
};

export const SKILL_DESCRIPTIONS: Record<string, string> = {
  drug_factory: 'Transform raw materials into profitable pharmaceuticals. From humble cigarettes to luxury synthetics, your lab is where chemistry meets capitalism. The DEA calls it illegal, you call it entrepreneurship.',
  distillery: 'Turn water into liquid gold, one bottle at a time. Your customers stumble home happy, their wallets considerably lighter. Prohibition was just free advertising for entrepreneurs like you.',
  smuggling: 'International shipping with a twist of danger. Every customs checkpoint is a puzzle, every border guard a negotiation. Your cargo holds dreams... and nightmares. Sometimes you find treasure, sometimes just junk. But hey, one person\'s trash is another person\'s felony.',
  investigation_lab: 'Where good products become great, and great products become legendary. Your lab coat may be stained, but your reputation is spotless. Quality control through questionable methods.',
  thieving: 'Wealth redistribution specialist with flexible working hours. From pocket change to bank vaults, you\'re just helping money find its way to more deserving hands. Yours.',
  bank: 'Your personal vault of ill-gotten gains. Every deposit tells a story, every withdrawal funds another adventure. The only interest you care about is compound criminal interest.',
};

export const AGENTS: Record<string, { name: string; description: string; bonuses: string[] }> = {
  drug_factory: {
    name: 'Chem Chief Ada',
    description: 'A ruthless production maestro who turns every batch into a masterpiece.',
    bonuses: [
      '−30% action time',
      '+1 item',
      '−10% failure chance',
    ],
  },
  distillery: {
    name: 'Barrel Boss Rocco',
    description: 'A legend of the barrel age. Faster brews, cleaner pours, bigger margins.',
    bonuses: [
      '−30% action time',
      '+1 item',
      '−10% failure chance',
    ],
  },
  smuggling: {
    name: 'Ghost Runner V',
    description: 'Invisible on manifest, unstoppable on delivery. Knows every backdoor.',
    bonuses: [
      '−30% action time',
      '+1 item',
      '−5% junk chance',
    ],
  },
  investigation_lab: {
    name: 'Professor Nightshade',
    description: 'Quality fanatic. Elevates refinement to an illicit art form.',
    bonuses: [
      '−30% action time',
      '+1 item',
      '−10% failure chance',
    ],
  },
  thieving: {
    name: 'Shade the Handler',
    description: 'The city whispers for Shade. Guards blink—and the vault is empty.',
    bonuses: [
      '-50% cool down',
      '-50% catch rate',
      '+50% chance to double loot',
    ],
  },
};

const TARGET_TOTAL_XP = 15_000_000;
const XP_EXPONENT = 2.0;

function generateXpTable(maxLevel: number, totalXp: number, exponent: number): number[] {
  const thresholds: number[] = [];

  const earlyEnd = 20;
  const A = 300; // Fast early-game progression: L5 ~4800 XP, L20 ~108k XP

  for (let lvl = 2; lvl <= maxLevel; lvl++) {
    if (lvl <= earlyEnd) {
      const cumulative = Math.floor(A * (lvl - 1) * (lvl - 1));
      thresholds.push(cumulative);
      continue;
    }

    const t = (lvl - earlyEnd) / (maxLevel - earlyEnd);
    const expAtT = exponent * (0.55 + 0.45 * t);
    const eased = Math.pow(Math.max(0, Math.min(1, t)), expAtT);

    const startAt20 = Math.floor(A * (earlyEnd - 1) * (earlyEnd - 1));
    const remaining = Math.max(0, totalXp - startAt20);
    const cumulative = startAt20 + Math.floor(remaining * eased);
    thresholds.push(cumulative);
  }
  return thresholds;
}

export const XP_TABLE = generateXpTable(100, TARGET_TOTAL_XP, XP_EXPONENT);

export function getXpForLevel(level: number): number {
  return level <= 1 ? 0 : XP_TABLE[level - 2];
}

export function getLevelFromXp(xp: number): number {
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (xp < XP_TABLE[i]) {
      return i + 1;
    }
  }
  return 100;
}

export const MAX_LEVEL = 100;

// Dynamic XP calculation for Thieving aligned with target progression times
export function getThievingXp(currentLevel: number, activityUnlockLevel: number): number {
  const clampedLevel = Math.max(1, Math.min(100, Math.floor(currentLevel)));

  const baseTimeByUnlock: Record<number, number> = {
    1: 3000,
    3: 6000,
    6: 9000,
    8: 13500,
    12: 26250,
    16: 33750,
    20: 45000,
    25: 67500,
    30: 90000,
    35: 135000,
    40: 112500,
    50: 180000,
    55: 150000,
    60: 225000,
    70: 270000,
    80: 270000,
    90: 285000,
  };

  const timeTargetsSec: Record<number, number> = {
    5: 5 * 60,
    20: 60 * 60,
    60: 90 * 60 * 60,
    100: 14 * 24 * 60 * 60,
  };

  function avgXpsAt(level: number): number {
    const xpNeeded = getXpForLevel(level);
    const timeSec = timeTargetsSec[level as 5 | 20 | 60 | 100];
    if (!timeSec || timeSec <= 0) return 10;
    return Math.max(1, xpNeeded / timeSec);
  }

  const avg5 = avgXpsAt(5);
  const avg20 = avgXpsAt(20);
  const avg60 = avgXpsAt(60);
  const avg100 = avgXpsAt(100);

  function lerp(a: number, b: number, t: number): number {
    const tt = Math.max(0, Math.min(1, t));
    return a + (b - a) * tt;
  }

  let xpsInstant = 10;
  if (clampedLevel < 5) {
    xpsInstant = avg5;
  } else if (clampedLevel < 20) {
    const t = (clampedLevel - 5) / 15;
    xpsInstant = lerp(avg5, avg20, t);
  } else if (clampedLevel < 60) {
    const t = (clampedLevel - 20) / 40;
    xpsInstant = lerp(avg20, avg60, t) * 0.98;
  } else {
    const t = (clampedLevel - 60) / 40;
    xpsInstant = lerp(avg60, avg100, t) * 0.96;
  }

  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 60000;
  const bonus = unlockBonusFactor(activityUnlockLevel);
  const perAction = Math.max(1, Math.floor(xpsInstant * bonus * (baseTime / 1000)));
  return perAction;
}

// Store items - core input items that can be bought cheaply
export const STORE_ITEMS = [
  // Drug Factory Basic Items (common inputs only)
  { resourceId: 'chemical', price: 5 },
  { resourceId: 'solvent', price: 3 },
  { resourceId: 'plant_matter', price: 3 },
  { resourceId: 'paper', price: 2 },
  { resourceId: 'catalyst', price: 6 },
  { resourceId: 'substrate', price: 4 },
  { resourceId: 'binder', price: 3 },

  // Distillery Core Items (common inputs only)
  { resourceId: 'water', price: 1 },
  { resourceId: 'alcohol_base', price: 3 },
  { resourceId: 'grapes', price: 4 },
  { resourceId: 'sugar', price: 2 },
  { resourceId: 'grains', price: 3 },
  { resourceId: 'herbs', price: 5 },
];

export const SMUGGLING_ZONES: SmugglingZone[] = [
  {
    id: 'docks',
    name: 'Docks',
    levelRequired: 1,
    baseTime: 800,
    junkChance: 35,
    items: [
      // Basic materials
      { resource: RESOURCES.water, weight: 20, baseXp: 120 },
      { resource: RESOURCES.paper, weight: 18, baseXp: 140 },
      { resource: RESOURCES.plant_matter, weight: 15, baseXp: 160 },
      { resource: RESOURCES.grains, weight: 12, baseXp: 140 },
      { resource: RESOURCES.sugar, weight: 10, baseXp: 140 },
      // Rare valuable items
      { resource: RESOURCES.luxury_watches, weight: 3, baseXp: 300, minLevel: 5 },
      { resource: RESOURCES.smartphones, weight: 2, baseXp: 400, minLevel: 10 },
      { resource: RESOURCES.stolen_cargo, weight: 1, baseXp: 500, minLevel: 15 },
    ],
  },
  {
    id: 'warehouse',
    name: 'Warehouse District',
    levelRequired: 8,
    baseTime: 2000,
    junkChance: 30,
    items: [
      // Basic materials
      { resource: RESOURCES.chemical, weight: 18, baseXp: 180 },
      { resource: RESOURCES.solvent, weight: 16, baseXp: 160 },
      { resource: RESOURCES.alcohol_base, weight: 14, baseXp: 180 },
      { resource: RESOURCES.binder, weight: 12, baseXp: 160 },
      { resource: RESOURCES.substrate, weight: 10, baseXp: 180 },
      // Rare valuable items
      { resource: RESOURCES.gaming_consoles, weight: 3, baseXp: 480, minLevel: 12 },
      { resource: RESOURCES.laptops, weight: 2, baseXp: 660, minLevel: 18 },
      { resource: RESOURCES.heavy_machinery_parts, weight: 1, baseXp: 840, minLevel: 25 },
    ],
  },
  {
    id: 'black_market',
    name: 'Black Market',
    levelRequired: 15,
    baseTime: 3500,
    junkChance: 28,
    items: [
      // Basic and some premium materials
      { resource: RESOURCES.catalyst, weight: 15, baseXp: 220 },
      { resource: RESOURCES.herbs, weight: 12, baseXp: 220 },
      { resource: RESOURCES.grapes, weight: 10, baseXp: 200 },
      { resource: RESOURCES.chemical, weight: 10, baseXp: 240 },
      { resource: RESOURCES.solvent, weight: 8, baseXp: 200 },
      { resource: RESOURCES.premium_water, weight: 3, baseXp: 400, minLevel: 20 },
      // Rare valuable items
      { resource: RESOURCES.designer_bags, weight: 3, baseXp: 800, minLevel: 20 },
      { resource: RESOURCES.fake_passports, weight: 2, baseXp: 1040, minLevel: 25 },
      { resource: RESOURCES.gold_bars, weight: 1, baseXp: 1360, minLevel: 30 },
    ],
  },
  {
    id: 'tunnels',
    name: 'Underground Tunnels',
    levelRequired: 25,
    baseTime: 5500,
    junkChance: 25,
    items: [
      // Mix of basic and premium materials
      { resource: RESOURCES.catalyst, weight: 12, baseXp: 280 },
      { resource: RESOURCES.substrate, weight: 10, baseXp: 260 },
      { resource: RESOURCES.binder, weight: 10, baseXp: 240 },
      { resource: RESOURCES.alcohol_base, weight: 8, baseXp: 280 },
      { resource: RESOURCES.premium_alcohol, weight: 4, baseXp: 560, minLevel: 30 },
      { resource: RESOURCES.premium_grapes, weight: 3, baseXp: 480, minLevel: 35 },
      // Rare valuable items
      { resource: RESOURCES.stolen_jewelry, weight: 3, baseXp: 1120, minLevel: 30 },
      { resource: RESOURCES.vintage_cameras, weight: 2, baseXp: 1360, minLevel: 35 },
      { resource: RESOURCES.rare_minerals, weight: 1, baseXp: 1600, minLevel: 40 },
    ],
  },
  {
    id: 'airport',
    name: 'Airport Cargo',
    levelRequired: 35,
    baseTime: 8000,
    junkChance: 22,
    items: [
      // More premium materials
      { resource: RESOURCES.premium_chemical, weight: 8, baseXp: 420 },
      { resource: RESOURCES.premium_solvent, weight: 7, baseXp: 360 },
      { resource: RESOURCES.premium_plant, weight: 6, baseXp: 380 },
      { resource: RESOURCES.herbs, weight: 8, baseXp: 240 },
      { resource: RESOURCES.grapes, weight: 6, baseXp: 220 },
      { resource: RESOURCES.premium_herbs, weight: 4, baseXp: 480, minLevel: 40 },
      // Rare valuable items
      { resource: RESOURCES.drones, weight: 3, baseXp: 960, minLevel: 40 },
      { resource: RESOURCES.luxury_perfumes, weight: 2, baseXp: 1140, minLevel: 45 },
      { resource: RESOURCES.diplomatic_pouches, weight: 1, baseXp: 1440, minLevel: 50 },
    ],
  },
  {
    id: 'border',
    name: 'Border Crossing',
    levelRequired: 45,
    baseTime: 12000,
    junkChance: 20,
    items: [
      // Good mix of premium materials
      { resource: RESOURCES.premium_catalyst, weight: 6, baseXp: 540 },
      { resource: RESOURCES.premium_chemical, weight: 8, baseXp: 480 },
      { resource: RESOURCES.premium_solvent, weight: 7, baseXp: 420 },
      { resource: RESOURCES.premium_water, weight: 6, baseXp: 360 },
      { resource: RESOURCES.premium_alcohol, weight: 5, baseXp: 540 },
      { resource: RESOURCES.catalyst, weight: 5, baseXp: 300 },
      // Rare valuable items
      { resource: RESOURCES.sports_cars, weight: 3, baseXp: 1080, minLevel: 50 },
      { resource: RESOURCES.precious_metals, weight: 2, baseXp: 1560, minLevel: 55 },
      { resource: RESOURCES.banned_substances, weight: 1, baseXp: 1920, minLevel: 60 },
    ],
  },
  {
    id: 'cyber',
    name: 'Cyber Network',
    levelRequired: 55,
    baseTime: 16000,
    junkChance: 18,
    items: [
      // Premium materials focus
      { resource: RESOURCES.premium_plant, weight: 8, baseXp: 540 },
      { resource: RESOURCES.premium_catalyst, weight: 7, baseXp: 600 },
      { resource: RESOURCES.premium_grapes, weight: 6, baseXp: 480 },
      { resource: RESOURCES.premium_herbs, weight: 5, baseXp: 540 },
      { resource: RESOURCES.premium_chemical, weight: 6, baseXp: 580 },
      { resource: RESOURCES.substrate, weight: 4, baseXp: 340 },
      // Rare valuable items
      { resource: RESOURCES.crypto_wallets, weight: 3, baseXp: 1200, minLevel: 60 },
      { resource: RESOURCES.server_hardware, weight: 2, baseXp: 1500, minLevel: 65 },
      { resource: RESOURCES.classified_intel, weight: 1, baseXp: 2160, minLevel: 70 },
    ],
  },
  {
    id: 'art_underground',
    name: 'Art Underground',
    levelRequired: 65,
    baseTime: 22000,
    junkChance: 16,
    items: [
      // High-tier premium materials
      { resource: RESOURCES.premium_solvent, weight: 8, baseXp: 600 },
      { resource: RESOURCES.premium_catalyst, weight: 8, baseXp: 660 },
      { resource: RESOURCES.premium_plant, weight: 7, baseXp: 620 },
      { resource: RESOURCES.premium_alcohol, weight: 6, baseXp: 700 },
      { resource: RESOURCES.premium_water, weight: 5, baseXp: 480 },
      { resource: RESOURCES.premium_herbs, weight: 4, baseXp: 660 },
      // Rare valuable items
      { resource: RESOURCES.stolen_paintings, weight: 3, baseXp: 1440, minLevel: 70 },
      { resource: RESOURCES.vintage_wines, weight: 2, baseXp: 1800, minLevel: 75 },
      { resource: RESOURCES.museum_pieces, weight: 1, baseXp: 2400, minLevel: 80 },
    ],
  },
  {
    id: 'military',
    name: 'Military Complex',
    levelRequired: 75,
    baseTime: 30000,
    junkChance: 14,
    items: [
      // Top-tier premium materials
      { resource: RESOURCES.premium_chemical, weight: 10, baseXp: 780 },
      { resource: RESOURCES.premium_catalyst, weight: 9, baseXp: 840 },
      { resource: RESOURCES.premium_solvent, weight: 8, baseXp: 720 },
      { resource: RESOURCES.premium_plant, weight: 7, baseXp: 780 },
      { resource: RESOURCES.premium_grapes, weight: 5, baseXp: 660 },
      { resource: RESOURCES.premium_alcohol, weight: 4, baseXp: 840 },
      // Rare valuable items
      { resource: RESOURCES.military_vehicles, weight: 3, baseXp: 2160, minLevel: 80 },
      { resource: RESOURCES.advanced_optics, weight: 2, baseXp: 2640, minLevel: 85 },
      { resource: RESOURCES.satellite_equipment, weight: 1, baseXp: 3600, minLevel: 90 },
    ],
  },
  {
    id: 'syndicate',
    name: 'International Syndicate',
    levelRequired: 85,
    baseTime: 45000,
    junkChance: 12,
    items: [
      // Best premium materials
      { resource: RESOURCES.premium_chemical, weight: 12, baseXp: 960 },
      { resource: RESOURCES.premium_catalyst, weight: 11, baseXp: 1020 },
      { resource: RESOURCES.premium_solvent, weight: 10, baseXp: 900 },
      { resource: RESOURCES.premium_plant, weight: 9, baseXp: 940 },
      { resource: RESOURCES.premium_herbs, weight: 8, baseXp: 980 },
      { resource: RESOURCES.premium_alcohol, weight: 7, baseXp: 1060 },
      { resource: RESOURCES.premium_water, weight: 6, baseXp: 720 },
      { resource: RESOURCES.premium_grapes, weight: 5, baseXp: 900 },
      // Rare valuable items
      { resource: RESOURCES.supercars, weight: 3, baseXp: 3000, minLevel: 90 },
      { resource: RESOURCES.private_jets, weight: 2, baseXp: 4800, minLevel: 95 },
      { resource: RESOURCES.quantum_processors, weight: 1, baseXp: 7200, minLevel: 100 },
    ],
  },
];

// Helper function to check if player has enough inputs for an activity
export function hasRequiredInputs(bank: Record<string, { quantity: number }>, activity: Activity): boolean {
  if (!activity.inputs) return true;
  
  return activity.inputs.every(input => {
    const bankItem = bank[input.resourceId];
    return bankItem && bankItem.quantity >= input.quantity;
  });
}

// Helper function to get missing inputs for an activity
export function getMissingInputs(bank: Record<string, { quantity: number }>, activity: Activity): { resourceId: string; needed: number; have: number }[] {
  if (!activity.inputs) return [];
  
  return activity.inputs
    .map(input => {
      const bankItem = bank[input.resourceId];
      const have = bankItem?.quantity || 0;
      return {
        resourceId: input.resourceId,
        needed: input.quantity,
        have,
      };
    })
    .filter(item => item.have < item.needed);
}

// XP pacing helpers calibrated to your timing targets
function targetXpPerSecond(level: number): number {
  if (level < 5) return 16; // 4,800 XP in ~5 minutes
  if (level < 20) return 30; // ~108,300 XP in ~60 minutes
  const clamped = Math.min(100, Math.max(20, level));
  const t = (clamped - 20) / 80; // 20 -> 0, 100 -> 1
  return 30 + (12 - 30) * t; // ease down towards long-term average ~12 XP/s
}

function unlockBonusFactor(activityUnlockLevel: number): number {
  // Small boost for later-unlocked activities (max +15%)
  const bonus = Math.min(0.15, Math.max(0, activityUnlockLevel / 700));
  return 1 + bonus;
}

// Dynamic XP calculation for Investigation Lab
// Uses baseTime map for precise XP/action so XP/sec matches target curve
// Smuggling XP per action to match exact time targets
// We compute an XP/sec target based on desired time-to-levels (5,20,60,100)
// then convert to per-action using the activity's baseTime so speed bonuses increase XP/s
export function getSmugglingXp(currentLevel: number, baseTimeMs: number): number {
  const clampedLevel = Math.max(1, Math.min(100, Math.floor(currentLevel)));

  const timeTargetsSec: Record<number, number> = {
    5: 5 * 60,
    20: 60 * 60,
    60: 90 * 60 * 60,
    100: 14 * 24 * 60 * 60,
  };

  function avgXpsAt(level: number): number {
    const xpNeeded = getXpForLevel(level);
    const timeSec = timeTargetsSec[level as 5 | 20 | 60 | 100];
    if (!timeSec || timeSec <= 0) return 10;
    return Math.max(1, xpNeeded / timeSec);
  }

  const avg5 = avgXpsAt(5);
  const avg20 = avgXpsAt(20);
  const avg60 = avgXpsAt(60);
  const avg100 = avgXpsAt(100);

  function lerp(a: number, b: number, t: number): number {
    const tt = Math.max(0, Math.min(1, t));
    return a + (b - a) * tt;
  }

  let xpsInstant = 10;
  if (clampedLevel < 5) {
    xpsInstant = avg5;
  } else if (clampedLevel < 20) {
    const t = (clampedLevel - 5) / 15;
    xpsInstant = lerp(avg5, avg20, t);
  } else if (clampedLevel < 60) {
    const t = (clampedLevel - 20) / 40;
    xpsInstant = lerp(avg20, avg60, t) * 0.98;
  } else {
    const t = (clampedLevel - 60) / 40;
    xpsInstant = lerp(avg60, avg100, t) * 0.96;
  }

  const perAction = Math.max(1, Math.floor(xpsInstant * (baseTimeMs / 1000)));
  return perAction;
}

export function getInvestigationLabXp(currentLevel: number, activityUnlockLevel: number): number {
  const baseTimeByUnlock: Record<number, number> = {
    1: 15000,
    15: 20000,
    25: 18000,
    35: 22000,
    45: 25000,
    55: 23000,
    65: 24000,
    75: 28000,
    85: 35000,
    95: 40000,
  };
  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 20000;
  const baseXps = targetXpPerSecond(currentLevel) * unlockBonusFactor(activityUnlockLevel);

  // Late-game pacing to align L60 and L100 with other skills (increase time by reducing XP/s more)
  let levelScale = 1;
  if (currentLevel >= 60) {
    const t = Math.min(1, Math.max(0, (currentLevel - 60) / 40));
    levelScale = 0.75 + (0.35 - 0.75) * t; // 0.75 at 60 -> 0.35 at 100 (slower than before)
  } else if (currentLevel >= 20) {
    const t = Math.min(1, Math.max(0, (currentLevel - 20) / 40));
    levelScale = 1 + (0.75 - 1) * t; // ease down to 0.75 by 60
  }

  const xps = baseXps * levelScale;
  const perAction = Math.max(1, Math.floor(xps * (baseTime / 1000)));
  return perAction;
}

// Dynamic XP calculation for Drug Factory
export function getDrugFactoryXp(currentLevel: number, activityUnlockLevel: number): number {
  const baseTimeByUnlock: Record<number, number> = {
    1: 3000,
    5: 3500,
    12: 4000,
    18: 4500,
    22: 5000,
    25: 5500,
    30: 6000,
    35: 6500,
    45: 7000,
    50: 7500,
    60: 8000,
    65: 8500,
    75: 9000,
    80: 9500,
    95: 10000,
    100: 10500,
  };
  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 4000;
  const xps = targetXpPerSecond(currentLevel) * unlockBonusFactor(activityUnlockLevel);
  const perAction = Math.max(1, Math.floor(xps * (baseTime / 1000)));
  return perAction;
}

// Dynamic XP calculation for Distillery
export function getDistilleryXp(currentLevel: number, activityUnlockLevel: number): number {
  const baseTimeByUnlock: Record<number, number> = {
    1: 8000,
    5: 10000,
    10: 9000,
    15: 9000,
    20: 10000,
    30: 11000,
    40: 11000,
    55: 12000,
    65: 13000,
    75: 14000,
    85: 16000,
    90: 17000,
    95: 18000,
    100: 20000,
  };
  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 12000;
  const baseXps = targetXpPerSecond(currentLevel) * unlockBonusFactor(activityUnlockLevel);

  // Distillery late-game pacing: slow down after L60 so L60/100 timings aren't too fast
  let levelScale = 1;
  if (currentLevel >= 60) {
    const t = Math.min(1, Math.max(0, (currentLevel - 60) / 40));
    // From 0.85 at 60 down to 0.45 at 100
    levelScale = 0.85 + (0.45 - 0.85) * t;
  } else if (currentLevel >= 20) {
    const t = Math.min(1, Math.max(0, (currentLevel - 20) / 40));
    // From 1.0 at 20 down to 0.85 at 60
    levelScale = 1 + (0.85 - 1) * t;
  }

  const xps = baseXps * levelScale;
  const perAction = Math.max(1, Math.floor(xps * (baseTime / 1000)));
  return perAction;
}
