# Idle Bar Game 🍺

An idle clicker game with a bar management theme, featuring skeleton customers, moral choices, and a prestige system. Built with Next.js and TypeScript, styled in the spirit of Grim Fandango 

## 🎮 Game Overview

Run your own bar, serve drinks to skeleton customers, make moral choices, and build your empire! The game features idle gameplay mechanics, meaning it continues to run even when you're away.

## 🎯 Core Mechanics

### Beer Production
- **Manual Tapping**: Click the tap button to produce beer manually
- **Automatic Tapping**: Beer is produced automatically at regular intervals (base: 1 second)
- **Glass Capacity**: Each glass holds 20 units of beer
- **Drink Types**: Start with beer, unlock wine, cocktails, whiskey, and champagne, and in the future secret drinks

### Selling System
- **Manual Selling**: Click the sell button to sell glasses of beer
- **Automatic Selling**: With "Bar Personeel" upgrade, beer sells automatically
- **Sell Batch**: Base system sells 4 glasses at a time every 4 seconds
- **Price Calculation**: Base price per glass × upgrade multipliers × prestige bonus

### Bar Management
- **Open/Close Bar**: Toggle the bar to allow customers to spawn
- **Customer Spawning**: Customers automatically appear when the bar is open
- **Maximum Customers**: Based on "Bar Ambiance" upgrade level:
  - Level 0: 1 customer
  - Level 1-2: 2 customers
  - Level 3-4: 3 customers
  - Level 5-6: 4 customers
  - Level 7-8: 5-6 customers

## 👥 Customer System

### Customer Personalities

There are 6 unique skeleton personalities, each with distinct traits:

1. **Deco** (Unlocked by default)
   - Sophisticated and appreciates aesthetics
   - High friendliness (75), generosity (65), patience (85)
   - Friendly dialogue style
   - Unlocked by: Staff Training upgrade

2. **Malice** (Evil)
   - Sinister with dark humor
   - Low friendliness (15), generosity (25), patience (35)
   - Wicked dialogue style
   - Unlocked by: Tap Speed, Whiskey Collection, VIP Section, Auto Upgrade upgrades

3. **Bloom** (Flower)
   - Incredibly positive and cheerful
   - Very high friendliness (95), generosity (90), patience (95)
   - Friendly dialogue style
   - Unlocked by: Auto Seller, Champagne Service, Loyalty Program, Auto Customer Service upgrades

4. **Rebel**
   - Non-conformist and independent
   - Moderate friendliness (55), generosity (60), low patience (25)
   - Rebellious dialogue style
   - Unlocked by: Tap Amount, Bar Ambiance, Social Media, Late Night Hours upgrades

5. **Smoke** (Smoking)
   - Smooth-talking and business-minded
   - Moderate friendliness (65), high generosity (75), patience (75)
   - Smooth dialogue style
   - Unlocked by: Sell Price, Wine Cellar, Live Music, Master Bartender, Smart Inventory upgrades

6. **Mystique** (Witch)
   - Enigmatic and mystical
   - Low friendliness (45), moderate generosity (60), patience (70)
   - Mysterious dialogue style
   - Unlocked by: Premium Bier, Cocktail Bar, Bar Expansion, Passive Income upgrades

### Customer Opportunities

Customers can have different opportunities when they visit:

- **🍺 Order**: Customer wants to order a drink
- **💰 Tip**: Customer offers a tip for good service
- **⭐ Special**: Customer wants something special
- **😠 Complaint**: Customer complains about their drink
- **⚖️ Moral Dilemma**: Customer presents a moral choice (requires player interaction)

### Customer Interactions

- Click on a customer to interact with them
- Each customer has a patience bar that decreases over time
- Customers leave if their patience runs out
- Served customers can return after 4+ minutes
- Each personality has a preferred seat at the bar

## ⚡ Upgrades System

Upgrades are organized into 7 categories:

### TAP Category
- **Snellere Tapkraan** (Tap Speed)
  - Cost: 20 (multiplier: 1.35)
  - Effect: Reduces time between automatic beer ticks by 6% per level
  - Unlocks: Malice

- **Grotere Glazen** (Tap Amount)
  - Cost: 35 (multiplier: 1.4)
  - Effect: Increases beer per tick by 25% per level
  - Unlocks: Rebel

- **Bar Uitbreiding** (Bar Expansion)
  - Cost: 1000 (multiplier: 1.6)
  - Effect: Increases production by 40% per level
  - Unlocks: Mystique

### PRIJS Category (Price)
- **Happy Hour Marketing** (Sell Price)
  - Cost: 50 (multiplier: 1.45)
  - Effect: Increases sell price by 20% per level
  - Unlocks: Smoke

- **Premium Speciaalbier** (Premium Beer)
  - Cost: 120 (multiplier: 1.45)
  - Effect: Increases profit by 35% per level
  - Unlocks: Mystique

- **VIP Sectie** (VIP Section)
  - Cost: 2000 (multiplier: 1.75)
  - Effect: Increases prices by 50% per level
  - Unlocks: Malice

### AUTOMATISCH Category (Automatic)
- **Bar Personeel** (Bar Staff)
  - Cost: 50 (multiplier: 1.45)
  - Effect: Automatically sells beer while you're AFK (25% efficiency per level)
  - **ESSENTIAL for idle gameplay**
  - Unlocks: Bloom

- **Automatische Klantenservice** (Auto Customer Service)
  - Cost: 150 (multiplier: 1.4)
  - Effect: Staff handles customers automatically (20% efficiency per level)
  - Unlocks: Bloom

- **Master Bartender**
  - Cost: 1200 (multiplier: 1.65)
  - Effect: Professional bartender increases efficiency by 45% per level
  - Unlocks: Smoke

- **Late Night Uren** (Late Night Hours)
  - Cost: 700 (multiplier: 1.5)
  - Effect: Extended hours increase income by 30% per level
  - Unlocks: Rebel

- **Slimme Voorraad** (Smart Inventory)
  - Cost: 300 (multiplier: 1.45)
  - Effect: Automatically selects best drink for maximum profit (25% per level)
  - Unlocks: Smoke

- **Passief Inkomen** (Passive Income)
  - Cost: 500 (multiplier: 1.5)
  - Effect: Money earns itself (15% per level)
  - Unlocks: Mystique

- **Automatische Upgrades** (Auto Upgrade)
  - Cost: 1000 (multiplier: 1.6)
  - Effect: Automatically buys upgrades when affordable (10% efficiency per level)
  - Unlocks: Malice

### MORAAL Category (Moral)
- **Team Coaching** (Staff Training)
  - Cost: 90 (multiplier: 1.4)
  - Effect: Increases team morale long-term (+1.5 moral per level)
  - Unlocks: Deco

### DRANK Category (Drinks)
- **Wijnkelder** (Wine Cellar)
  - Cost: 200 (multiplier: 1.5)
  - Effect: Unlocks wine serving (30% price increase per level)
  - Unlocks: Smoke

- **Cocktail Bar**
  - Cost: 500 (multiplier: 1.6)
  - Effect: Unlocks cocktails (40% price increase per level)
  - Unlocks: Mystique

- **Whiskey Collectie** (Whiskey Collection)
  - Cost: 800 (multiplier: 1.55)
  - Effect: Unlocks premium whiskeys (50% price increase per level)
  - Unlocks: Malice

- **Champagne Service**
  - Cost: 1500 (multiplier: 1.7)
  - Effect: Unlocks champagne service (60% price increase per level)
  - Unlocks: Bloom

### AMBIANCE Category
- **Bar Ambiance**
  - Cost: 300 (multiplier: 1.45)
  - Effect: Better atmosphere attracts more customers (25% per level)
  - Unlocks: Rebel

- **Live Muziek** (Live Music)
  - Cost: 600 (multiplier: 1.5)
  - Effect: Band attracts customers (35% per level)
  - Unlocks: Smoke

### MARKETING Category
- **Loyalty Programma** (Loyalty Program)
  - Cost: 400 (multiplier: 1.4)
  - Effect: Customers return more often (30% per level)
  - Unlocks: Bloom

- **Social Media Marketing**
  - Cost: 250 (multiplier: 1.35)
  - Effect: Social media presence increases income (20% per level)
  - Unlocks: Rebel

## 🏆 Achievements

Achievements are unlocked automatically when you meet the requirements:

### Sales Achievements
- **🏆 100 Glasses**: Sell 100 glasses
- **🏆 1K Glasses**: Sell 1,000 glasses
- **🏆 10K Glasses**: Sell 10,000 glasses
- **🏆 100K Glasses**: Sell 100,000 glasses

### Money Achievements
- **💰 €1K**: Earn €1,000 total
- **💰 €10K**: Earn €10,000 total
- **💰 €100K**: Earn €100,000 total
- **💰 €1M**: Earn €1,000,000 total

### Moral Achievements
- **😇 Saint**: Reach 100 moral
- **😇 Angel**: Reach 120 moral
- **😈 Villain**: Drop to 20 moral or below
- **😈 Demon**: Drop to 10 moral or below
- **⚖️ Balanced**: Maintain moral between 65-75

### Prestige Achievements
- **🔄 Prestige**: Complete first prestige
- **🔄 Master**: Complete 5 prestiges
- **🔄 Legend**: Complete 10 prestiges

### Upgrade Achievements
- **🔧 Enthusiast**: Reach level 10 on any upgrade
- **🔧 Master**: Reach level 25 on any upgrade
- **🔧 Legend**: Reach level 50 on any upgrade

### Customer Achievements
- **👥 Social Bartender**: Serve 50 customers
- **👥 People Person**: Serve 500 customers

### Moral Choice Achievements
- **📚 Moral Philosopher**: Make 10 moral choices
- **📚 Ethical Expert**: Make 50 moral choices

### Drink Achievements
- **🍷 Drink Collector**: Unlock 3 different drinks
- **🍷 Drink Master**: Unlock all 5 drinks

### Special Achievements
- **✨ Golden Moment**: Experience a golden event

## 🌟 Prestige System

The prestige system allows you to reset your progress for permanent bonuses:

### How Prestige Works
1. **Requirement**: You need at least €10,000 total earned to prestige
2. **Prestige Points**: You earn 1 point per €10,000 total earned
   - Example: €25,000 earned = 2 prestige points
3. **Reset**: All progress resets:
   - Beer: 0
   - Money: 0
   - Total glasses sold: 0
   - All upgrades: Level 0
   - Moral: Reset to 70
   - Total earned: Reset to 0
4. **Bonus**: You keep prestige points permanently
   - Each prestige point gives +10% bonus to everything
   - Example: 5 prestige points = +50% bonus on all production and prices

### When to Prestige
- Prestige when you've earned enough to get meaningful points
- Early prestiges (1-3 points) help accelerate early game
- Later prestiges (5+ points) provide significant bonuses
- Prestige points stack, so multiple prestiges compound your bonus

## ⚖️ Moral System

The moral system (0-130) affects your gameplay:

### Moral Effects
- **High Moral (100+)**: Positive outcomes, better customer relations
- **Low Moral (20-)**: Negative outcomes, potential punishments
- **Neutral (65-75)**: Balanced gameplay

### How Moral Changes
- **Customer Quests**: Choices in customer interactions affect moral
- **Moral Dilemmas**: Special customer events that require moral choices
- **Staff Training**: Upgrade that increases moral over time
- **Punishments**: Low moral can trigger negative events

### Moral Choices
- Each choice has a moral value (+ or -)
- Choices affect your reputation with customers
- Some choices have immediate consequences (money, beer)
- Moral dilemmas are only triggered by clicking customers with ⚖️ icon

## ✨ Golden Events

Random bonus events that provide temporary boosts:

### How They Work
- **Chance**: 1% chance every 10 seconds
- **Duration**: 30 seconds
- **Effects**:
  - 3× beer production
  - 2× sell price
- **Visual Indicator**: Golden event indicator appears when active

### Strategy
- Golden events are random and cannot be controlled
- Maximize production during events
- Consider timing manual sales during events for maximum profit

## 🎲 Customer Quests

When you click on a customer, you may encounter different quest types:

### Order Quest
- Customer wants to order a drink
- Choices affect moral and money
- Can choose to be honest, overcharge, or give discounts

### Tip Quest
- Customer offers a tip
- Choices determine tip amount and moral impact
- Can accept, refuse, or negotiate

### Special Quest
- Customer wants something unique
- Higher profit potential
- Choices affect customer satisfaction and return visits

### Complaint Quest
- Customer complains about their drink
- Must choose how to handle it
- Options: remake, refund, or ignore
- Affects customer retention and moral

### Moral Dilemma Quest
- Special quests that only appear when customer has ⚖️ icon
- Always require player interaction (cannot be auto-handled)
- Significant moral impact
- Often have story consequences

## 💾 Save System

- Game automatically saves progress to localStorage
- Saves every 30 seconds
- Progress persists between browser sessions
- Includes: money, beer, upgrades, moral, prestige, achievements

## 🎨 Visual Features

- **Pixel Art Style**: Grim Fandango-inspired skeleton characters
- **Bar Scene**: Interactive bar with 6 customer seats
- **Skeleton Commentator**: Sarcastic commentary on your actions
- **Moral Log**: Track your moral choices and consequences
- **Achievement Badges**: Visual display of unlocked achievements

## 🚀 Getting Started

1. **Start Tapping**: Click the tap button to produce beer
2. **Sell Beer**: Click sell button to make money
3. **Buy Upgrades**: Purchase upgrades to automate and increase production
4. **Open Bar**: Click "OPEN THE BAR" to allow customers
5. **Interact**: Click on customers to serve them and make choices
6. **Progress**: Earn money, unlock customers, and build your bar empire

## 💡 Tips & Strategies

### Early Game
- Focus on "Bar Personeel" (Auto Seller) for idle gameplay
- Upgrade "Snellere Tapkraan" (Tap Speed) for faster production
- Open the bar early to start earning from customers

### Mid Game
- Unlock different drink types for higher profits
- Balance moral choices based on your playstyle
- Invest in "Bar Ambiance" to allow more customers

### Late Game
- Consider prestige when you have 5+ points available
- Maximize upgrade levels for compound effects
- Unlock all customer personalities for variety

### Idle Strategy
- Prioritize automatic upgrades (Auto Seller, Auto Customer Service)
- Invest in passive income upgrades
- Use "Auto Upgrade" to fully automate progression

## 🐛 Known Issues

- Game saves automatically, but manual save option may be added
- Some achievements may not trigger immediately (check requirements)
- Golden events are completely random (no way to influence them)

## 📝 License

This project is open source and available for modification and distribution.

---

**Enjoy running your bar! May your moral choices be wise and your profits high!** 🍺✨
