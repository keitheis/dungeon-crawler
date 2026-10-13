// The rooms of the kids' guide, in the order we suggest walking through them. Like the game,
// the guide goes down one depth per room: each room borrows the look of a game depth (theme).
// index.html draws the map from this list; deck.js uses it for the "next room" portal.
// `de` and `zh-Hant` hold translated guide text. Icons
// are relative to this file (see iconUrl).
export const DECKS = [
  { file: 'start.html', theme: 'meadow', depth: 0, icon: '../assets/items/item_town_portal.png',
    title: 'Welcome to Town', teaser: 'What Cube Crawler is, what it is made of, and how this guide works.',
    de: { title: 'Willkommen in der Stadt', teaser: 'Was Cube Crawler ist, woraus es besteht und wie dieser Führer funktioniert.' },
    'zh-Hant': { title: '歡迎來到城鎮', teaser: '認識 Cube Crawler、遊戲裡有哪些部分，以及這份指南怎麼使用。' } },
  { file: 'architecture.html', theme: 'meadow', depth: 1, icon: '../assets/items/weapon_staff_arcane.png',
    title: 'How It Fits Together', teaser: 'The parts of the game, what each one does, and how they work together.',
    de: { title: 'Wie alles zusammenpasst', teaser: 'Die Teile des Spiels, was jeder macht und wie sie zusammenarbeiten.' },
    'zh-Hant': { title: '遊戲如何組合起來', teaser: '認識遊戲的各個部分、每個部分的工作，以及它們如何合作。' } },
  { file: 'code.html', theme: 'meadow', depth: 2, icon: '../assets/items/item_stick_long.png',
    title: 'Reading Code', teaser: 'Names, objects, lists, little machines and decisions: how to read the game\'s real code.',
    de: { title: 'Code lesen', teaser: 'Namen, Objekte, Listen, kleine Maschinen und Entscheidungen: wie man den echten Code des Spiels liest.' },
    'zh-Hant': { title: '讀懂程式碼', teaser: '從名稱、物件、清單到小機器和判斷，一起讀懂遊戲真正的程式碼。' } },
  { file: 'loop.html', theme: 'peaks', depth: 3, icon: '../assets/items/item_potion_health.png',
    title: 'The Heartbeat', teaser: 'The game redraws itself 60 times a second. What happens in one tick?',
    de: { title: 'Der Herzschlag', teaser: 'Das Spiel malt sich 60-mal pro Sekunde neu. Was passiert in einem Takt?' },
    'zh-Hant': { title: '遊戲的心跳', teaser: '遊戲每秒重新繪製 60 次。一個時間步裡會發生什麼事？' } },
  { file: 'space.html', theme: 'badlands', depth: 4, icon: '../assets/items/weapon_arrow.png',
    title: 'Where Things Are', teaser: 'Coordinates, arrows, distances and angles: the maths that tells the game where everything is.',
    de: { title: 'Wo die Dinge sind', teaser: 'Koordinaten, Pfeile, Entfernungen und Winkel: die Mathe, die dem Spiel sagt, wo alles ist.' },
    'zh-Hant': { title: '東西在哪裡', teaser: '座標、箭頭、距離和角度：遊戲用來判斷所有東西位置的數學。' } },
  { file: 'random.html', theme: 'roots', depth: 5, icon: '../assets/items/item_crystal_diamond.png',
    title: 'Magic Numbers', teaser: 'Random that is not really random: seeds, dice and bags of marbles.',
    de: { title: 'Zauberzahlen', teaser: 'Zufall, der nicht wirklich zufällig ist: Seeds, Würfel und Murmelbeutel.' },
    'zh-Hant': { title: '魔法數字', teaser: '看起來像隨機、其實不完全隨機：種子、骰子和彈珠袋。' } },
  { file: 'memory.html', theme: 'roots', depth: 6, icon: '../assets/items/item_coin_silver.png',
    title: 'What the Game Remembers', teaser: 'A whole world from one seed, and a notebook of what you changed. Plus: how your bag works.',
    de: { title: 'Was sich das Spiel merkt', teaser: 'Eine ganze Welt aus einem Seed und ein Notizbuch für das, was du verändert hast. Dazu: wie deine Tasche funktioniert.' },
    'zh-Hant': { title: '遊戲記住了什麼', teaser: '用一個種子生成整個世界，再用筆記記下你做過的改變。還會介紹背包怎麼運作。' } },
  { file: 'world.html', theme: 'frozen', depth: 7, icon: '../assets/items/item_crystal_amethyst.png',
    title: 'Building the World', teaser: 'How a computer invents a whole world of cubes, and checks that you can finish it.',
    de: { title: 'Die Welt erschaffen', teaser: 'Wie ein Computer eine ganze Welt aus Würfeln erfindet und prüft, dass man sie schaffen kann.' },
    'zh-Hant': { title: '打造世界', teaser: '看看電腦如何創造一整個方塊世界，並確認玩家能順利走到終點。' } },
  { file: 'paths.html', theme: 'frozen', depth: 8, icon: '../assets/items/item_stick_forked.png',
    title: 'Finding the Way', teaser: 'How monsters and the generator find a way from here to there.',
    de: { title: 'Den Weg finden', teaser: 'Wie Monster und der Weltbauer einen Weg von hier nach dort finden.' },
    'zh-Hant': { title: '找到路', teaser: '認識怪物和世界生成器如何找到從這裡通往那裡的路。' } },
  { file: 'physics.html', theme: 'swamp', depth: 9, icon: '../assets/items/item_potion_stamina.png',
    title: 'Run, Jump, Fall', teaser: 'Gravity, jumping, sliding along walls, and floppy ragdolls.',
    de: { title: 'Rennen, Springen, Fallen', teaser: 'Schwerkraft, Sprünge, an Wänden entlangrutschen und schlabbrige Ragdolls.' },
    'zh-Hant': { title: '奔跑、跳躍、墜落', teaser: '重力、跳躍、沿著牆滑行，還有軟趴趴的布娃娃物理。' } },
  { file: 'combat.html', theme: 'swamp', depth: 10, icon: '../assets/items/weapon_sword_long.png',
    title: 'Swords & Fighting', teaser: 'How a swing works, how an arrow flies, how the game knows you hit, and why hits feel good.',
    de: { title: 'Schwerter & Kämpfe', teaser: 'Wie ein Schwerthieb funktioniert, wie ein Pfeil fliegt, woher das Spiel weiß, dass du triffst, und warum Treffer sich gut anfühlen.' },
    'zh-Hant': { title: '劍與戰鬥', teaser: '了解揮劍和射箭的原理、遊戲如何判斷你打中了，以及命中的感覺為什麼很棒。' } },
  { file: 'enemies.html', theme: 'nests', depth: 11, icon: '../assets/items/item_crystal_ruby.png',
    title: 'Monster Brains', teaser: 'Monsters that wander, notice you, chase you and give up.',
    de: { title: 'Monster-Gehirne', teaser: 'Monster, die herumlaufen, dich bemerken, dich jagen und aufgeben.' },
    'zh-Hant': { title: '怪物的大腦', teaser: '看看怪物如何四處遊蕩、發現你、追上來，最後又放棄。' } },
  { file: 'loot.html', theme: 'mines', depth: 13, icon: '../assets/items/treasure_chest.png',
    title: 'Treasure & Weapons', teaser: 'Rarities, affixes and funny names: a machine that makes weapons.',
    de: { title: 'Schätze & Waffen', teaser: 'Seltenheiten, Affixe und lustige Namen: eine Maschine, die Waffen baut.' },
    'zh-Hant': { title: '寶物與武器', teaser: '稀有度、詞綴和有趣的名字：看看一台機器如何打造武器。' } },
  { file: 'stronger.html', theme: 'mines', depth: 14, icon: '../assets/items/weapon_sword_greatsword.png',
    title: 'Growing Stronger', teaser: 'Experience, levels and curves: how the game keeps getting harder, and you keep up.',
    de: { title: 'Stärker werden', teaser: 'Erfahrung, Stufen und Kurven: wie das Spiel immer schwerer wird und du mithältst.' },
    'zh-Hant': { title: '變得更強', teaser: '經驗值、等級和成長曲線：了解遊戲如何變難，以及你怎麼跟上。' } },
  { file: 'drawing.html', theme: 'ruins', depth: 15, icon: '../assets/items/item_crystal_sapphire.png',
    title: 'Drawing the World', teaser: 'Triangles, cameras, lights, and cutting holes in roofs so you can see.',
    de: { title: 'Die Welt malen', teaser: 'Dreiecke, Kameras, Licht und Löcher in Dächern, damit du etwas siehst.' },
    'zh-Hant': { title: '繪製世界', teaser: '認識三角形、攝影機和光線，也看看屋頂怎麼挖洞才能看見裡面。' } },
  { file: 'sound.html', theme: 'volcanic', depth: 17, icon: '../assets/items/item_coin_gold.png',
    title: 'Sounds & Music', teaser: 'Every sound is made from math. Music that changes with danger.',
    de: { title: 'Geräusche & Musik', teaser: 'Jedes Geräusch ist aus Mathe gemacht. Musik, die sich mit der Gefahr ändert.' },
    'zh-Hant': { title: '音效與音樂', teaser: '每種聲音都是用數學做出來的。音樂也會隨著危險程度改變。' } },
  { file: 'art.html', theme: 'volcanic', depth: 18, icon: '../assets/items/item_crystal_emerald.png',
    title: 'Making Monsters', teaser: 'Models built by code in Blender, from blobs of digital clay.',
    de: { title: 'Monster bauen', teaser: 'Modelle, die Code in Blender baut, aus Klumpen digitaler Knete.' },
    'zh-Hant': { title: '製作怪物', teaser: '看看程式碼如何在 Blender 裡把數位黏土捏成模型。' } },
  { file: 'animation.html', theme: 'abyss', depth: 19, icon: '../assets/items/weapon_bow_recurve.png',
    title: 'Coming Alive', teaser: 'Mixing walk and run, feet that don\'t slide, and getting up from a ragdoll.',
    de: { title: 'Lebendig werden', teaser: 'Gehen und Rennen mischen, Füße, die nicht rutschen, und Aufstehen aus der Ragdoll.' },
    'zh-Hant': { title: '讓角色活起來', teaser: '混合走路和跑步動畫、讓腳不會滑動，還有從布娃娃狀態站起來。' } },
  { file: 'checks.html', theme: 'core', depth: 20, icon: '../assets/items/item_potion_mana.png',
    title: 'Keeping It Working', teaser: 'Tests, seeds, tools to look inside, and save points: how game makers keep a game from breaking.',
    de: { title: 'Damit alles läuft', teaser: 'Tests, Seeds, Werkzeuge zum Hineinschauen und Speicherpunkte: wie Spielemacher verhindern, dass ein Spiel kaputtgeht.' },
    'zh-Hant': { title: '讓遊戲順利運作', teaser: '測試、種子、檢查工具和存檔點：遊戲製作者如何避免遊戲出問題。' } },
];

// a room's texts in a language
export const local = (d, lang) => d[lang] ? { ...d, ...d[lang] } : d;
// a room's icon as a URL that works from any page
export const iconUrl = d => new URL(d.icon, import.meta.url).href;

// what the three detail levels are called (slides carry data-lv="1|2|3")
export const LEVELS = [
  null,
  { name: 'Big idea', de: 'Große Idee', 'zh-Hant': '核心概念', short: 'Lv 1', color: '#61dc6b' },
  { name: 'How it works', de: 'So funktioniert es', 'zh-Hant': '運作方式', short: 'Lv 2', color: '#51a9ff' },
  { name: 'Real code', de: 'Echter Code', 'zh-Hant': '實際程式碼', short: 'Lv 3', color: '#fd9f07' },
];

// the game depth each theme name stands for (shown in the top bar)
export const THEME_NAMES = {
  meadow: 'Meadow islands', peaks: 'Snowy peaks', badlands: 'Badlands', roots: 'Root caves', frozen: 'Frozen caves',
  swamp: 'Fungal swamp', nests: 'Spider nests', mines: 'Crystal mines', ruins: 'Buried ruins', volcanic: 'Volcanic depths',
  abyss: 'Obsidian abyss', core: 'The core',
};
export const THEME_NAMES_DE = {
  meadow: 'Wiesen-Inseln', peaks: 'Schneegipfel', badlands: 'Ödland', roots: 'Wurzelhöhlen', frozen: 'Eishöhlen',
  swamp: 'Pilzsumpf', nests: 'Spinnennester', mines: 'Kristallminen', ruins: 'Verschüttete Ruinen', volcanic: 'Vulkantiefen',
  abyss: 'Obsidian-Abgrund', core: 'Der Kern',
};
export const THEME_NAMES_ZH_HANT = {
  meadow: '草原群島', peaks: '雪峰', badlands: '荒地', roots: '樹根洞窟', frozen: '冰凍洞窟',
  swamp: '真菌沼澤', nests: '蜘蛛巢穴', mines: '水晶礦坑', ruins: '埋沒遺跡', volcanic: '火山深處',
  abyss: '黑曜石深淵', core: '核心',
};
