export interface BankTabIcon {
  id: string;
  name: string;
  icon: string; // Lucide icon name
}

export const BANK_TAB_ICONS: BankTabIcon[] = [
  // Combat & Weapons
  { id: 'gun', name: 'Gun', icon: 'Crosshair' },
  { id: 'knife', name: 'Knife', icon: 'Sword' },
  { id: 'bomb', name: 'Explosives', icon: 'Bomb' },
  { id: 'shield', name: 'Protection', icon: 'Shield' },
  { id: 'target', name: 'Target', icon: 'Target' },
  { id: 'flame', name: 'Fire', icon: 'Flame' },
  { id: 'zap', name: 'Electric', icon: 'Zap' },
  
  // Money & Business
  { id: 'money', name: 'Money', icon: 'DollarSign' },
  { id: 'briefcase', name: 'Briefcase', icon: 'Briefcase' },
  { id: 'diamond', name: 'Diamond', icon: 'Gem' },
  { id: 'coins', name: 'Coins', icon: 'Coins' },
  { id: 'wallet', name: 'Wallet', icon: 'Wallet' },
  { id: 'piggybank', name: 'Savings', icon: 'PiggyBank' },
  { id: 'banknote', name: 'Cash', icon: 'Banknote' },
  { id: 'creditcard', name: 'Cards', icon: 'CreditCard' },
  { id: 'trending', name: 'Profits', icon: 'TrendingUp' },
  
  // Crime & Underground
  { id: 'skull', name: 'Skull', icon: 'Skull' },
  { id: 'lock', name: 'Secure', icon: 'Lock' },
  { id: 'key', name: 'Access', icon: 'Key' },
  { id: 'unlock', name: 'Unlocked', icon: 'Unlock' },
  { id: 'eye', name: 'Surveillance', icon: 'Eye' },
  { id: 'eyeoff', name: 'Hidden', icon: 'EyeOff' },
  { id: 'mask', name: 'Disguise', icon: 'Mask' },
  
  // Leadership & Power
  { id: 'crown', name: 'Boss', icon: 'Crown' },
  { id: 'trophy', name: 'Trophy', icon: 'Trophy' },
  { id: 'medal', name: 'Medal', icon: 'Medal' },
  { id: 'award', name: 'Award', icon: 'Award' },
  { id: 'star', name: 'Star', icon: 'Star' },
  
  // Vehicles & Transport
  { id: 'car', name: 'Car', icon: 'Car' },
  { id: 'truck', name: 'Truck', icon: 'Truck' },
  { id: 'plane', name: 'Plane', icon: 'Plane' },
  { id: 'ship', name: 'Ship', icon: 'Ship' },
  { id: 'bike', name: 'Bike', icon: 'Bike' },
  
  // Skills & Activities
  { id: 'hammer', name: 'Build', icon: 'Hammer' },
  { id: 'wrench', name: 'Repair', icon: 'Wrench' },
  { id: 'pickaxe', name: 'Mining', icon: 'Pickaxe' },
  { id: 'package', name: 'Smuggling', icon: 'Package' },
  { id: 'box', name: 'Storage', icon: 'Box' },
  { id: 'archive', name: 'Archive', icon: 'Archive' },
  { id: 'map', name: 'Territory', icon: 'Map' },
  { id: 'compass', name: 'Navigation', icon: 'Compass' },
  
  // Communication & Intel
  { id: 'phone', name: 'Phone', icon: 'Phone' },
  { id: 'radio', name: 'Radio', icon: 'Radio' },
  { id: 'wifi', name: 'Network', icon: 'Wifi' },
  { id: 'satellite', name: 'Satellite', icon: 'Satellite' },
  { id: 'message', name: 'Messages', icon: 'MessageSquare' },
  { id: 'mail', name: 'Mail', icon: 'Mail' },
  
  // Security & Defense
  { id: 'alert', name: 'Alert', icon: 'AlertTriangle' },
  { id: 'siren', name: 'Alarm', icon: 'Siren' },
  { id: 'camera', name: 'Camera', icon: 'Camera' },
  { id: 'fingerprint', name: 'Identity', icon: 'Fingerprint' },
  { id: 'scan', name: 'Scanner', icon: 'Scan' },
  
  // Resources & Items
  { id: 'battery', name: 'Energy', icon: 'Battery' },
  { id: 'fuel', name: 'Fuel', icon: 'Fuel' },
  { id: 'flask', name: 'Chemistry', icon: 'Flask' },
  { id: 'pill', name: 'Medicine', icon: 'Pill' },
  { id: 'heart', name: 'Health', icon: 'Heart' },
  { id: 'apple', name: 'Food', icon: 'Apple' },
  { id: 'coffee', name: 'Coffee', icon: 'Coffee' },
  { id: 'wine', name: 'Wine', icon: 'Wine' },
  
  // Documents & Info
  { id: 'file', name: 'Files', icon: 'File' },
  { id: 'folder', name: 'Folder', icon: 'Folder' },
  { id: 'clipboard', name: 'Clipboard', icon: 'Clipboard' },
  { id: 'book', name: 'Book', icon: 'Book' },
  { id: 'newspaper', name: 'News', icon: 'Newspaper' },
  
  // Time & Planning
  { id: 'clock', name: 'Time', icon: 'Clock' },
  { id: 'timer', name: 'Timer', icon: 'Timer' },
  { id: 'calendar', name: 'Calendar', icon: 'Calendar' },
  { id: 'watch', name: 'Watch', icon: 'Watch' },
  
  // Misc Useful
  { id: 'flag', name: 'Flag', icon: 'Flag' },
  { id: 'tag', name: 'Tag', icon: 'Tag' },
  { id: 'bookmark', name: 'Bookmark', icon: 'Bookmark' },
  { id: 'link', name: 'Link', icon: 'Link' },
  { id: 'anchor', name: 'Anchor', icon: 'Anchor' },
  { id: 'globe', name: 'Global', icon: 'Globe' },
  { id: 'home', name: 'Home', icon: 'Home' },
  { id: 'building', name: 'Building', icon: 'Building' },
  { id: 'factory', name: 'Factory', icon: 'Factory' },
  { id: 'warehouse', name: 'Warehouse', icon: 'Warehouse' },
];
