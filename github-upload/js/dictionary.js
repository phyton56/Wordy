(function (root) {
  'use strict';

  const WORDY_DICTIONARY = [
  {
    "word": "agree",
    "tr": "aynı fikirde olmak",
    "sentence": "We all agree on the main points.",
    "level": "A1"
  },
  {
    "word": "apple",
    "tr": "elma",
    "sentence": "She eats a fresh red apple every morning.",
    "level": "A1"
  },
  {
    "word": "book",
    "tr": "kitap",
    "sentence": "I am reading an interesting book tonight.",
    "level": "A1"
  },
  {
    "word": "choose",
    "tr": "seçmek",
    "sentence": "You can choose between tea and coffee.",
    "level": "A1"
  },
  {
    "word": "city",
    "tr": "şehir",
    "sentence": "Istanbul is a vibrant and historic city.",
    "level": "A1"
  },
  {
    "word": "complete",
    "tr": "tamamlamak, eksiksiz",
    "sentence": "He completed the project ahead of time.",
    "level": "A1"
  },
  {
    "word": "difference",
    "tr": "fark",
    "sentence": "There is a big difference between both.",
    "level": "A1"
  },
  {
    "word": "difficult",
    "tr": "zor, güç",
    "sentence": "This math puzzle is quite difficult.",
    "level": "A1"
  },
  {
    "word": "family",
    "tr": "aile",
    "sentence": "My family gathers for dinner every Sunday.",
    "level": "A1"
  },
  {
    "word": "famous",
    "tr": "ünlü, meşhur",
    "sentence": "The singer became famous worldwide.",
    "level": "A1"
  },
  {
    "word": "friend",
    "tr": "arkadaş",
    "sentence": "He is my closest friend from school.",
    "level": "A1"
  },
  {
    "word": "happy",
    "tr": "mutlu",
    "sentence": "They look very happy after the good news.",
    "level": "A1"
  },
  {
    "word": "house",
    "tr": "ev",
    "sentence": "Their new house has a big sunny garden.",
    "level": "A1"
  },
  {
    "word": "include",
    "tr": "içermek, dahil etmek",
    "sentence": "The ticket includes dinner and drinks.",
    "level": "A1"
  },
  {
    "word": "introduce",
    "tr": "tanıtmak, tanıştırmak",
    "sentence": "Let me introduce you to my colleague.",
    "level": "A1"
  },
  {
    "word": "learn",
    "tr": "öğrenmek",
    "sentence": "Children learn new languages very quickly.",
    "level": "A1"
  },
  {
    "word": "morning",
    "tr": "sabah",
    "sentence": "The birds sing loudly in the early morning.",
    "level": "A1"
  },
  {
    "word": "music",
    "tr": "müzik",
    "sentence": "She listens to calm music while studying.",
    "level": "A1"
  },
  {
    "word": "night",
    "tr": "gece",
    "sentence": "The stars shine brightly in the clear night.",
    "level": "A1"
  },
  {
    "word": "popular",
    "tr": "popüler, sevilen",
    "sentence": "This song is very popular on radio.",
    "level": "A1"
  },
  {
    "word": "prefer",
    "tr": "tercih etmek",
    "sentence": "I prefer walking to riding the bus.",
    "level": "A1"
  },
  {
    "word": "receive",
    "tr": "almak, teslim almak",
    "sentence": "Did you receive the birthday card?",
    "level": "A1"
  },
  {
    "word": "relax",
    "tr": "rahatlamak, dinlenmek",
    "sentence": "Take a hot bath to relax muscles.",
    "level": "A1"
  },
  {
    "word": "school",
    "tr": "okul",
    "sentence": "The children walk to school together.",
    "level": "A1"
  },
  {
    "word": "small",
    "tr": "küçük",
    "sentence": "They live in a small village near the sea.",
    "level": "A1"
  },
  {
    "word": "smile",
    "tr": "gülümsemek",
    "sentence": "A warm smile can brighten someone's day.",
    "level": "A1"
  },
  {
    "word": "time",
    "tr": "zaman",
    "sentence": "We do not have much time left today.",
    "level": "A1"
  },
  {
    "word": "water",
    "tr": "su",
    "sentence": "Please drink a glass of cold water.",
    "level": "A1"
  },
  {
    "word": "work",
    "tr": "çalışmak, iş",
    "sentence": "I start work at nine o'clock every day.",
    "level": "A1"
  },
  {
    "word": "write",
    "tr": "yazmak",
    "sentence": "Please write your name at the top of the page.",
    "level": "A1"
  },
  {
    "word": "advice",
    "tr": "tavsiye, öğüt",
    "sentence": "She gave me valuable advice on my career.",
    "level": "A2"
  },
  {
    "word": "argue",
    "tr": "tartışmak",
    "sentence": "They rarely argue about financial matters.",
    "level": "A2"
  },
  {
    "word": "arrange",
    "tr": "düzenlemek, ayarlamak",
    "sentence": "She arranged a meeting with the client.",
    "level": "A2"
  },
  {
    "word": "arrive",
    "tr": "varmak, ulaşmak",
    "sentence": "The flight will arrive in London at noon.",
    "level": "A2"
  },
  {
    "word": "available",
    "tr": "mevcut, müsait",
    "sentence": "The doctor is available on Tuesday.",
    "level": "A2"
  },
  {
    "word": "borrow",
    "tr": "ödünç almak",
    "sentence": "Can I borrow your umbrella until tomorrow?",
    "level": "A2"
  },
  {
    "word": "brave",
    "tr": "cesur",
    "sentence": "The brave firefighter rescued the cat.",
    "level": "A2"
  },
  {
    "word": "calm",
    "tr": "sakin, durgun",
    "sentence": "Stay calm even in stressful situations.",
    "level": "A2"
  },
  {
    "word": "celebrate",
    "tr": "kutlamak",
    "sentence": "We gathered to celebrate her graduation.",
    "level": "A2"
  },
  {
    "word": "chance",
    "tr": "şans, fırsat",
    "sentence": "Give him a second chance to prove himself.",
    "level": "A2"
  },
  {
    "word": "clever",
    "tr": "zeki, akıllı",
    "sentence": "The clever boy solved the riddle quickly.",
    "level": "A2"
  },
  {
    "word": "common",
    "tr": "yaygın, ortak",
    "sentence": "We share a common interest in music.",
    "level": "A2"
  },
  {
    "word": "compare",
    "tr": "karşılaştırmak",
    "sentence": "Compare prices before making a decision.",
    "level": "A2"
  },
  {
    "word": "complain",
    "tr": "şikayet etmek",
    "sentence": "Customers rarely complain about our service.",
    "level": "A2"
  },
  {
    "word": "connect",
    "tr": "bağlamak",
    "sentence": "The bridge connects two historic districts.",
    "level": "A2"
  },
  {
    "word": "continue",
    "tr": "devam etmek",
    "sentence": "The rain will continue through the night.",
    "level": "A2"
  },
  {
    "word": "creative",
    "tr": "yaratıcı",
    "sentence": "She is a creative artist who loves painting.",
    "level": "A2"
  },
  {
    "word": "dangerous",
    "tr": "tehlikeli",
    "sentence": "Driving fast on icy roads is very dangerous.",
    "level": "A2"
  },
  {
    "word": "decide",
    "tr": "karar vermek",
    "sentence": "We need to decide where to go for holiday.",
    "level": "A2"
  },
  {
    "word": "depend",
    "tr": "bağlı olmak, güvenmek",
    "sentence": "Our picnic will depend on the weather.",
    "level": "A2"
  },
  {
    "word": "describe",
    "tr": "tarif etmek, tanımlamak",
    "sentence": "Can you describe the suspect to police?",
    "level": "A2"
  },
  {
    "word": "discover",
    "tr": "keşfetmek",
    "sentence": "Astronauts hope to discover life in space.",
    "level": "A2"
  },
  {
    "word": "discuss",
    "tr": "tartışmak, görüşmek",
    "sentence": "Let us discuss the strategy in detail.",
    "level": "A2"
  },
  {
    "word": "distance",
    "tr": "mesafe, uzaklık",
    "sentence": "The distance between cities is short.",
    "level": "A2"
  },
  {
    "word": "energy",
    "tr": "enerji, güç",
    "sentence": "Wind turbines generate green energy.",
    "level": "A2"
  },
  {
    "word": "escape",
    "tr": "kaçmak, kurtulmak",
    "sentence": "The rabbit escaped into the bushes.",
    "level": "A2"
  },
  {
    "word": "excellent",
    "tr": "mükemmel, harika",
    "sentence": "She received an excellent score on the test.",
    "level": "A2"
  },
  {
    "word": "exciting",
    "tr": "heyecan verici",
    "sentence": "Starting a new job is an exciting experience.",
    "level": "A2"
  },
  {
    "word": "expect",
    "tr": "beklemek, ummak",
    "sentence": "We expect guests to arrive by dinner.",
    "level": "A2"
  },
  {
    "word": "experience",
    "tr": "deneyim, tecrübe",
    "sentence": "She has extensive experience in design.",
    "level": "A2"
  },
  {
    "word": "explain",
    "tr": "açıklamak",
    "sentence": "Could you explain this rule one more time?",
    "level": "A2"
  },
  {
    "word": "explore",
    "tr": "keşfetmek, araştırmak",
    "sentence": "Divers explore the colorful coral reef.",
    "level": "A2"
  },
  {
    "word": "fail",
    "tr": "başarısız olmak",
    "sentence": "Do not fear to fail; learn from setbacks.",
    "level": "A2"
  },
  {
    "word": "generous",
    "tr": "cömert",
    "sentence": "The generous donor funded the library.",
    "level": "A2"
  },
  {
    "word": "honest",
    "tr": "dürüst",
    "sentence": "An honest answer is always respected.",
    "level": "A2"
  },
  {
    "word": "huge",
    "tr": "büyük, devasa",
    "sentence": "The concert took place in a huge arena.",
    "level": "A2"
  },
  {
    "word": "improve",
    "tr": "geliştirmek",
    "sentence": "Reading daily will quickly improve your vocabulary.",
    "level": "A2"
  },
  {
    "word": "incredible",
    "tr": "inanılmaz",
    "sentence": "The magician pulled off an incredible trick.",
    "level": "A2"
  },
  {
    "word": "journey",
    "tr": "yolculuk",
    "sentence": "Our train journey across the mountains was unforgettable.",
    "level": "A2"
  },
  {
    "word": "knowledge",
    "tr": "bilgi, birikim",
    "sentence": "Books expand your general knowledge.",
    "level": "A2"
  },
  {
    "word": "memorize",
    "tr": "ezberlemek",
    "sentence": "Practice cards help memorize vocabulary.",
    "level": "A2"
  },
  {
    "word": "mention",
    "tr": "bahsetmek, değinmek",
    "sentence": "Did she mention the time of the meeting?",
    "level": "A2"
  },
  {
    "word": "mistake",
    "tr": "hata",
    "sentence": "Everyone makes a mistake when learning something new.",
    "level": "A2"
  },
  {
    "word": "mystery",
    "tr": "gizem, sır",
    "sentence": "The deep ocean holds many a mystery.",
    "level": "A2"
  },
  {
    "word": "nervous",
    "tr": "gergin, heyecanlı",
    "sentence": "I felt nervous before the job interview.",
    "level": "A2"
  },
  {
    "word": "ordinary",
    "tr": "sıradan, normal",
    "sentence": "It was just an ordinary Friday evening.",
    "level": "A2"
  },
  {
    "word": "organize",
    "tr": "düzenlemek, planlamak",
    "sentence": "Help us organize the school festival.",
    "level": "A2"
  },
  {
    "word": "patient",
    "tr": "sabırlı",
    "sentence": "A good teacher must be calm and patient.",
    "level": "A2"
  },
  {
    "word": "peaceful",
    "tr": "huzurlu, barışçıl",
    "sentence": "The lake at sunrise was peaceful.",
    "level": "A2"
  },
  {
    "word": "permission",
    "tr": "izin",
    "sentence": "You need permission to enter the hall.",
    "level": "A2"
  },
  {
    "word": "pleasure",
    "tr": "zevk, memnuniyet",
    "sentence": "It is a pleasure to meet your family.",
    "level": "A2"
  },
  {
    "word": "polite",
    "tr": "kibar, nazik",
    "sentence": "It is polite to say thank you.",
    "level": "A2"
  },
  {
    "word": "prepare",
    "tr": "hazırlamak",
    "sentence": "Let us prepare dinner before the guests come.",
    "level": "A2"
  },
  {
    "word": "progress",
    "tr": "ilerleme, gelişim",
    "sentence": "You are making steady progress every day.",
    "level": "A2"
  },
  {
    "word": "promise",
    "tr": "söz vermek",
    "sentence": "I promise to call you as soon as I get home.",
    "level": "A2"
  },
  {
    "word": "protect",
    "tr": "korumak",
    "sentence": "Sunglasses protect your eyes from bright sunlight.",
    "level": "A2"
  },
  {
    "word": "proud",
    "tr": "gururlu",
    "sentence": "Parents were proud of her graduation.",
    "level": "A2"
  },
  {
    "word": "quality",
    "tr": "kalite, nitelik",
    "sentence": "Always choose quality over cheap price.",
    "level": "A2"
  },
  {
    "word": "rare",
    "tr": "nadir, az rastlanan",
    "sentence": "A solar eclipse is a rare event.",
    "level": "A2"
  },
  {
    "word": "realize",
    "tr": "farkına varmak",
    "sentence": "I did not realize how late it was.",
    "level": "A2"
  },
  {
    "word": "recognize",
    "tr": "tanımak, fark etmek",
    "sentence": "I recognized your voice immediately.",
    "level": "A2"
  },
  {
    "word": "recommend",
    "tr": "tavsiye etmek, önermek",
    "sentence": "Can you recommend a good book?",
    "level": "A2"
  },
  {
    "word": "refuse",
    "tr": "reddetmek, geri çevirmek",
    "sentence": "He had to refuse the sweet cake.",
    "level": "A2"
  },
  {
    "word": "regular",
    "tr": "düzenli, olağan",
    "sentence": "Maintain regular study hours.",
    "level": "A2"
  },
  {
    "word": "remember",
    "tr": "hatırlamak",
    "sentence": "Do you remember the name of that restaurant?",
    "level": "A2"
  },
  {
    "word": "remind",
    "tr": "hatırlatmak",
    "sentence": "Please remind me to call my sister.",
    "level": "A2"
  },
  {
    "word": "replace",
    "tr": "değiştirmek, yerine koymak",
    "sentence": "Replace broken parts with new ones.",
    "level": "A2"
  },
  {
    "word": "rescue",
    "tr": "kurtarmak",
    "sentence": "Lifeguards rescue swimmers in waves.",
    "level": "A2"
  },
  {
    "word": "respect",
    "tr": "saygı duymak",
    "sentence": "Always respect different viewpoints.",
    "level": "A2"
  },
  {
    "word": "respond",
    "tr": "yanıt vermek",
    "sentence": "Please respond to the invitation soon.",
    "level": "A2"
  },
  {
    "word": "routine",
    "tr": "rutin, günlük düzen",
    "sentence": "Morning coffee is part of my routine.",
    "level": "A2"
  },
  {
    "word": "share",
    "tr": "paylaşmak",
    "sentence": "Good friends always share their thoughts honestly.",
    "level": "A2"
  },
  {
    "word": "silent",
    "tr": "sessiz, sakin",
    "sentence": "The forest remained peaceful and silent.",
    "level": "A2"
  },
  {
    "word": "succeed",
    "tr": "başarılı olmak",
    "sentence": "Never give up and you will succeed.",
    "level": "A2"
  },
  {
    "word": "suggest",
    "tr": "önermek, tavsiye etmek",
    "sentence": "I suggest taking a relaxing walk.",
    "level": "A2"
  },
  {
    "word": "support",
    "tr": "desteklemek, destek",
    "sentence": "Good friends support your dreams.",
    "level": "A2"
  },
  {
    "word": "talent",
    "tr": "yetenek, kabiliyet",
    "sentence": "She has an innate talent for music.",
    "level": "A2"
  },
  {
    "word": "tradition",
    "tr": "gelenek, görenek",
    "sentence": "Lighting candles is a holiday tradition.",
    "level": "A2"
  },
  {
    "word": "travel",
    "tr": "seyahat etmek",
    "sentence": "She loves to travel to different countries alone.",
    "level": "A2"
  },
  {
    "word": "useful",
    "tr": "faydalı, kullanışlı",
    "sentence": "This dictionary app is extremely useful for students.",
    "level": "A2"
  },
  {
    "word": "wealthy",
    "tr": "zengin, varlıklı",
    "sentence": "A wealthy businessman funded the clinic.",
    "level": "A2"
  },
  {
    "word": "weather",
    "tr": "hava durumu",
    "sentence": "The weather is expected to stay warm all week.",
    "level": "A2"
  },
  {
    "word": "achieve",
    "tr": "başarmak, elde etmek",
    "sentence": "With steady effort, you can achieve your goals.",
    "level": "B1"
  },
  {
    "word": "advantage",
    "tr": "avantaj, üstünlük",
    "sentence": "Speaking two languages gives you a clear advantage.",
    "level": "B1"
  },
  {
    "word": "allow",
    "tr": "izin vermek",
    "sentence": "Visitors are not allowed to take photos.",
    "level": "B1"
  },
  {
    "word": "ancient",
    "tr": "antik, eski",
    "sentence": "They visited an ancient temple in Greece.",
    "level": "B1"
  },
  {
    "word": "announce",
    "tr": "duyurmak, ilan etmek",
    "sentence": "The company will announce results tomorrow.",
    "level": "B1"
  },
  {
    "word": "anxious",
    "tr": "endişeli, kaygılı",
    "sentence": "He felt anxious before stepping on stage.",
    "level": "B1"
  },
  {
    "word": "appearance",
    "tr": "görünüş, dış görünüm",
    "sentence": "Do not judge someone purely by appearance.",
    "level": "B1"
  },
  {
    "word": "approach",
    "tr": "yaklaşım, yaklaşmak",
    "sentence": "We should try a different approach to solve this.",
    "level": "B1"
  },
  {
    "word": "attitude",
    "tr": "tutum, tavır",
    "sentence": "A positive attitude makes a huge difference.",
    "level": "B1"
  },
  {
    "word": "avoid",
    "tr": "kaçınmak, önlemek",
    "sentence": "Try to avoid driving during rush hour.",
    "level": "B1"
  },
  {
    "word": "behavior",
    "tr": "davranış",
    "sentence": "Good behavior is expected in class.",
    "level": "B1"
  },
  {
    "word": "benefit",
    "tr": "fayda, yarar",
    "sentence": "Daily exercise has many benefits for mental health.",
    "level": "B1"
  },
  {
    "word": "breathe",
    "tr": "nefes almak",
    "sentence": "Take a deep breath and stay calm.",
    "level": "B1"
  },
  {
    "word": "brief",
    "tr": "kısa, öz",
    "sentence": "He gave a brief summary of the project.",
    "level": "B1"
  },
  {
    "word": "brilliant",
    "tr": "harika, zeki, parlak",
    "sentence": "She came up with a brilliant idea.",
    "level": "B1"
  },
  {
    "word": "calculate",
    "tr": "hesaplamak",
    "sentence": "Can you calculate the total cost for us?",
    "level": "B1"
  },
  {
    "word": "challenge",
    "tr": "zorluk, meydan okuma",
    "sentence": "Learning a new skill is always a rewarding challenge.",
    "level": "B1"
  },
  {
    "word": "combine",
    "tr": "birleştirmek",
    "sentence": "Combine all ingredients in a large bowl.",
    "level": "B1"
  },
  {
    "word": "communicate",
    "tr": "iletişim kurmak",
    "sentence": "Dolphins communicate using unique sounds.",
    "level": "B1"
  },
  {
    "word": "concentrate",
    "tr": "odaklanmak",
    "sentence": "It is hard to concentrate with noise.",
    "level": "B1"
  },
  {
    "word": "condition",
    "tr": "durum, şart",
    "sentence": "The car is in excellent condition.",
    "level": "B1"
  },
  {
    "word": "confident",
    "tr": "özgüvenli",
    "sentence": "She felt confident before giving her presentation.",
    "level": "B1"
  },
  {
    "word": "confirm",
    "tr": "onaylamak",
    "sentence": "Please confirm your reservation by email.",
    "level": "B1"
  },
  {
    "word": "consider",
    "tr": "düşünmek, değerlendirmek",
    "sentence": "Consider all available options carefully.",
    "level": "B1"
  },
  {
    "word": "contain",
    "tr": "içermek",
    "sentence": "Oranges contain high amounts of Vitamin C.",
    "level": "B1"
  },
  {
    "word": "curious",
    "tr": "meraklı",
    "sentence": "He is naturally curious about how machines work.",
    "level": "B1"
  },
  {
    "word": "damage",
    "tr": "hasar, zarar vermek",
    "sentence": "The storm caused severe damage to roofs.",
    "level": "B1"
  },
  {
    "word": "decrease",
    "tr": "azalmak, düşürmek",
    "sentence": "The temperature will decrease noticeably.",
    "level": "B1"
  },
  {
    "word": "defend",
    "tr": "savunmak, korumak",
    "sentence": "Soldiers swore to defend their homeland.",
    "level": "B1"
  },
  {
    "word": "define",
    "tr": "tanımlamak",
    "sentence": "Dictionaries define words clearly.",
    "level": "B1"
  },
  {
    "word": "delay",
    "tr": "gecikme, ertelemek",
    "sentence": "The flight had a two-hour delay.",
    "level": "B1"
  },
  {
    "word": "deserve",
    "tr": "hak etmek",
    "sentence": "You worked hard and deserve a vacation.",
    "level": "B1"
  },
  {
    "word": "destroy",
    "tr": "yıkmak, yok etmek",
    "sentence": "Wildfires can destroy forests quickly.",
    "level": "B1"
  },
  {
    "word": "develop",
    "tr": "geliştirmek",
    "sentence": "The team worked hard to develop a better app.",
    "level": "B1"
  },
  {
    "word": "disappear",
    "tr": "gözden kaybolmak",
    "sentence": "The sun disappeared behind thick clouds.",
    "level": "B1"
  },
  {
    "word": "disease",
    "tr": "hastalık",
    "sentence": "Vaccines prevent the spread of disease.",
    "level": "B1"
  },
  {
    "word": "display",
    "tr": "sergilemek, ekran",
    "sentence": "The museum displays ancient artifacts.",
    "level": "B1"
  },
  {
    "word": "doubt",
    "tr": "şüphe, tereddüt",
    "sentence": "I have no doubt you will succeed.",
    "level": "B1"
  },
  {
    "word": "economy",
    "tr": "ekonomi",
    "sentence": "Tourism plays a key role in the economy.",
    "level": "B1"
  },
  {
    "word": "effective",
    "tr": "etkili, verimli",
    "sentence": "This medicine is very effective.",
    "level": "B1"
  },
  {
    "word": "effort",
    "tr": "çaba, gayret",
    "sentence": "Success requires continuous effort.",
    "level": "B1"
  },
  {
    "word": "emotion",
    "tr": "duygu, his",
    "sentence": "Music can evoke a deep emotional response.",
    "level": "B1"
  },
  {
    "word": "encourage",
    "tr": "cesaretlendirmek",
    "sentence": "Parents should encourage their children to read.",
    "level": "B1"
  },
  {
    "word": "enormous",
    "tr": "kocaman, devasa",
    "sentence": "The elephant has an enormous appetite.",
    "level": "B1"
  },
  {
    "word": "entertain",
    "tr": "eğlendirmek",
    "sentence": "The magician entertained the kids for hours.",
    "level": "B1"
  },
  {
    "word": "entire",
    "tr": "bütün, tüm",
    "sentence": "She read the entire book in one day.",
    "level": "B1"
  },
  {
    "word": "environment",
    "tr": "çevre",
    "sentence": "Recycling helps protect our natural environment.",
    "level": "B1"
  },
  {
    "word": "equal",
    "tr": "eşit, denk",
    "sentence": "All human beings are born free and equal.",
    "level": "B1"
  },
  {
    "word": "examine",
    "tr": "incelemek, muayene etmek",
    "sentence": "The doctor will examine your throat.",
    "level": "B1"
  },
  {
    "word": "exhausted",
    "tr": "bitkin, çok yorgun",
    "sentence": "After the run, he was completely exhausted.",
    "level": "B1"
  },
  {
    "word": "express",
    "tr": "ifade etmek",
    "sentence": "Art is a great way to express feelings.",
    "level": "B1"
  },
  {
    "word": "familiar",
    "tr": "tanıdık, aşina",
    "sentence": "Her voice sounds very familiar to me.",
    "level": "B1"
  },
  {
    "word": "feature",
    "tr": "özellik",
    "sentence": "The phone has a water-resistant feature.",
    "level": "B1"
  },
  {
    "word": "focus",
    "tr": "odaklanmak",
    "sentence": "Turn off notifications so you can focus deeply.",
    "level": "B1"
  },
  {
    "word": "frequent",
    "tr": "sık, sıkça olan",
    "sentence": "He makes frequent business trips abroad.",
    "level": "B1"
  },
  {
    "word": "glance",
    "tr": "göz atmak, hızlı bakış",
    "sentence": "He took a quick glance at his watch.",
    "level": "B1"
  },
  {
    "word": "gorgeous",
    "tr": "göz alıcı, muhteşem",
    "sentence": "The bride wore a gorgeous silk dress.",
    "level": "B1"
  },
  {
    "word": "grateful",
    "tr": "minnettar",
    "sentence": "I am truly grateful for all your support.",
    "level": "B1"
  },
  {
    "word": "guarantee",
    "tr": "garanti etmek, garanti",
    "sentence": "The store provides a two-year guarantee.",
    "level": "B1"
  },
  {
    "word": "habit",
    "tr": "alışkanlık",
    "sentence": "Drinking water after waking up is a healthy habit.",
    "level": "B1"
  },
  {
    "word": "handle",
    "tr": "başa çıkmak, idare etmek",
    "sentence": "She can easily handle high-pressure tasks.",
    "level": "B1"
  },
  {
    "word": "hesitate",
    "tr": "tereddüt etmek",
    "sentence": "Do not hesitate to ask questions.",
    "level": "B1"
  },
  {
    "word": "highlight",
    "tr": "vurgulamak, öne çıkarmak",
    "sentence": "The report highlights the growth of tech.",
    "level": "B1"
  },
  {
    "word": "horizon",
    "tr": "ufuk",
    "sentence": "The sun dipped beneath the ocean horizon.",
    "level": "B1"
  },
  {
    "word": "ignore",
    "tr": "görmezden gelmek",
    "sentence": "You should not ignore safety warnings.",
    "level": "B1"
  },
  {
    "word": "imagination",
    "tr": "hayal gücü",
    "sentence": "Children possess limitless imagination.",
    "level": "B1"
  },
  {
    "word": "immediate",
    "tr": "anında, derhal",
    "sentence": "The injured bird needed immediate care.",
    "level": "B1"
  },
  {
    "word": "impressive",
    "tr": "etkileyici",
    "sentence": "His speech was truly impressive.",
    "level": "B1"
  },
  {
    "word": "independent",
    "tr": "bağımsız",
    "sentence": "Living alone taught him to be more independent.",
    "level": "B1"
  },
  {
    "word": "inform",
    "tr": "bilgilendirmek",
    "sentence": "Please inform us if your plans change.",
    "level": "B1"
  },
  {
    "word": "ingredient",
    "tr": "malzeme, içerik",
    "sentence": "Fresh basil is a key ingredient in pasta.",
    "level": "B1"
  },
  {
    "word": "innocent",
    "tr": "masum",
    "sentence": "The court declared the suspect innocent.",
    "level": "B1"
  },
  {
    "word": "intend",
    "tr": "niyetinde olmak",
    "sentence": "I intend to finish this work today.",
    "level": "B1"
  },
  {
    "word": "interrupt",
    "tr": "sözünü kesmek, bölmek",
    "sentence": "Please do not interrupt while others speak.",
    "level": "B1"
  },
  {
    "word": "landscape",
    "tr": "manzara",
    "sentence": "The window overlooks a peaceful landscape.",
    "level": "B1"
  },
  {
    "word": "logical",
    "tr": "mantıklı",
    "sentence": "Her argument was clear and logical.",
    "level": "B1"
  },
  {
    "word": "manage",
    "tr": "yönetmek, başarmak",
    "sentence": "She knows how to manage her time effectively.",
    "level": "B1"
  },
  {
    "word": "miracle",
    "tr": "mucize",
    "sentence": "Finding the lost puppy was a miracle.",
    "level": "B1"
  },
  {
    "word": "motivate",
    "tr": "motive etmek",
    "sentence": "Coaches motivate players to give their best.",
    "level": "B1"
  },
  {
    "word": "obey",
    "tr": "itaat etmek, uymak",
    "sentence": "Drivers must obey traffic signs.",
    "level": "B1"
  },
  {
    "word": "observe",
    "tr": "gözlemlemek",
    "sentence": "Scientists observe birds during migration.",
    "level": "B1"
  },
  {
    "word": "obvious",
    "tr": "apaçık, besbelli",
    "sentence": "The answer to this riddle is obvious.",
    "level": "B1"
  },
  {
    "word": "occasion",
    "tr": "özel gün, vesile",
    "sentence": "Her birthday was a joyful occasion.",
    "level": "B1"
  },
  {
    "word": "occur",
    "tr": "meydana gelmek, olmak",
    "sentence": "Mistakes occur when you rush things.",
    "level": "B1"
  },
  {
    "word": "opportunity",
    "tr": "fırsat",
    "sentence": "This internship is a great opportunity to learn.",
    "level": "B1"
  },
  {
    "word": "participate",
    "tr": "katılmak",
    "sentence": "Many athletes participate in the race.",
    "level": "B1"
  },
  {
    "word": "perform",
    "tr": "sergilemek, icra etmek",
    "sentence": "Dancers perform on the main stage.",
    "level": "B1"
  },
  {
    "word": "portion",
    "tr": "porsiyon, pay",
    "sentence": "Eat a generous portion of green salad.",
    "level": "B1"
  },
  {
    "word": "practical",
    "tr": "pratik, kullanışlı",
    "sentence": "A backpack is practical for travel.",
    "level": "B1"
  },
  {
    "word": "precious",
    "tr": "değerli, kıymetli",
    "sentence": "Time spent with family is precious.",
    "level": "B1"
  },
  {
    "word": "predict",
    "tr": "tahmin etmek",
    "sentence": "It is hard to predict the weather next month.",
    "level": "B1"
  },
  {
    "word": "prevent",
    "tr": "önlemek, engel olmak",
    "sentence": "Washing hands prevents sickness.",
    "level": "B1"
  },
  {
    "word": "previous",
    "tr": "önceki, evvelki",
    "sentence": "Her previous house was in Izmir.",
    "level": "B1"
  },
  {
    "word": "promote",
    "tr": "tanıtmak, terfi ettirmek",
    "sentence": "They promote local organic farmers.",
    "level": "B1"
  },
  {
    "word": "provide",
    "tr": "sağlamak, temin etmek",
    "sentence": "The course provides all materials.",
    "level": "B1"
  },
  {
    "word": "publish",
    "tr": "yayımlamak",
    "sentence": "The author will publish a new story.",
    "level": "B1"
  },
  {
    "word": "purchase",
    "tr": "satın almak",
    "sentence": "She decided to purchase the red coat.",
    "level": "B1"
  },
  {
    "word": "purpose",
    "tr": "amaç, gaye",
    "sentence": "What is the purpose of this experiment?",
    "level": "B1"
  },
  {
    "word": "quantity",
    "tr": "miktar",
    "sentence": "Check the quantity before placing the order.",
    "level": "B1"
  },
  {
    "word": "random",
    "tr": "rastgele",
    "sentence": "Choose a random card from the deck.",
    "level": "B1"
  },
  {
    "word": "react",
    "tr": "tepki vermek",
    "sentence": "How did he react to the pleasant news?",
    "level": "B1"
  },
  {
    "word": "reasonable",
    "tr": "makul, mantıklı",
    "sentence": "The hotel rates are very reasonable.",
    "level": "B1"
  },
  {
    "word": "recover",
    "tr": "iyileşmek, toparlanmak",
    "sentence": "He recovered quickly after the flu.",
    "level": "B1"
  },
  {
    "word": "reduce",
    "tr": "azaltmak",
    "sentence": "We should reduce plastic waste in our daily lives.",
    "level": "B1"
  },
  {
    "word": "reflect",
    "tr": "yansıtmak, düşünmek",
    "sentence": "Mirrors reflect the light in the room.",
    "level": "B1"
  },
  {
    "word": "regret",
    "tr": "pişman olmak",
    "sentence": "Never regret doing your very best.",
    "level": "B1"
  },
  {
    "word": "release",
    "tr": "piyasaya sürmek, serbest bırakmak",
    "sentence": "They release a new song this week.",
    "level": "B1"
  },
  {
    "word": "relieved",
    "tr": "rahatlamış, ferahlamış",
    "sentence": "I felt relieved when exams ended.",
    "level": "B1"
  },
  {
    "word": "represent",
    "tr": "temsil etmek",
    "sentence": "Doves represent peace worldwide.",
    "level": "B1"
  },
  {
    "word": "require",
    "tr": "gerektirmek",
    "sentence": "This position will require strong communication skills.",
    "level": "B1"
  },
  {
    "word": "resource",
    "tr": "kaynak",
    "sentence": "Water is our most precious resource.",
    "level": "B1"
  },
  {
    "word": "responsible",
    "tr": "sorumlu, mesul",
    "sentence": "Who is responsible for the keys?",
    "level": "B1"
  },
  {
    "word": "reward",
    "tr": "ödül, ödüllendirmek",
    "sentence": "Give the dog a reward for good tricks.",
    "level": "B1"
  },
  {
    "word": "risk",
    "tr": "risk, tehlike",
    "sentence": "Calculate the risk before jumping.",
    "level": "B1"
  },
  {
    "word": "satisfaction",
    "tr": "memnuniyet, tatmin",
    "sentence": "Client satisfaction is our primary aim.",
    "level": "B1"
  },
  {
    "word": "scenery",
    "tr": "manzara",
    "sentence": "The coastal scenery is unforgettable.",
    "level": "B1"
  },
  {
    "word": "schedule",
    "tr": "program, takvim",
    "sentence": "Check your daily schedule every morning.",
    "level": "B1"
  },
  {
    "word": "secure",
    "tr": "güvenli",
    "sentence": "Ensure your Wi-Fi network is secure.",
    "level": "B1"
  },
  {
    "word": "seldom",
    "tr": "nadiren",
    "sentence": "It seldom rains in the desert.",
    "level": "B1"
  },
  {
    "word": "sensible",
    "tr": "akıllıca, mantıklı",
    "sentence": "A sensible budget saves money.",
    "level": "B1"
  },
  {
    "word": "sensitive",
    "tr": "hassas, duyarlı",
    "sentence": "Use soft cream for sensitive skin.",
    "level": "B1"
  },
  {
    "word": "settle",
    "tr": "yerleşmek, anlaşmak",
    "sentence": "They settled in a quiet coastal town.",
    "level": "B1"
  },
  {
    "word": "shelter",
    "tr": "sığınak, barınak",
    "sentence": "The umbrella provided shelter from rain.",
    "level": "B1"
  },
  {
    "word": "smooth",
    "tr": "pürüzsüz, düzgün",
    "sentence": "The polished stone felt icy and smooth.",
    "level": "B1"
  },
  {
    "word": "solution",
    "tr": "çözüm",
    "sentence": "They found a simple solution to the technical issue.",
    "level": "B1"
  },
  {
    "word": "source",
    "tr": "kaynak",
    "sentence": "Fruits are a great source of vitamins.",
    "level": "B1"
  },
  {
    "word": "specific",
    "tr": "belirli, özel",
    "sentence": "Name a specific date for our trip.",
    "level": "B1"
  },
  {
    "word": "strength",
    "tr": "güç, kuvvet",
    "sentence": "Weight training builds physical strength.",
    "level": "B1"
  },
  {
    "word": "struggle",
    "tr": "çabalamak, mücadele",
    "sentence": "He struggled with heavy boxes.",
    "level": "B1"
  },
  {
    "word": "stubborn",
    "tr": "inatçı",
    "sentence": "The stubborn cat refused to move.",
    "level": "B1"
  },
  {
    "word": "summarize",
    "tr": "özetlemek",
    "sentence": "Summarize the story in two sentences.",
    "level": "B1"
  },
  {
    "word": "survive",
    "tr": "hayatta kalmak",
    "sentence": "Plants survive cold winter snow.",
    "level": "B1"
  },
  {
    "word": "temporary",
    "tr": "geçici",
    "sentence": "This detour is temporary for repairs.",
    "level": "B1"
  },
  {
    "word": "unique",
    "tr": "benzersiz, eşsiz",
    "sentence": "Each snowflake has a unique crystal shape.",
    "level": "B1"
  },
  {
    "word": "urgent",
    "tr": "acil, ivedi",
    "sentence": "The hospital needs urgent blood donors.",
    "level": "B1"
  },
  {
    "word": "valuable",
    "tr": "değerli, kıymetli",
    "sentence": "Time is our most valuable asset.",
    "level": "B1"
  },
  {
    "word": "vanish",
    "tr": "kaybolmak, yok olmak",
    "sentence": "Fog vanishes as the sun rises.",
    "level": "B1"
  },
  {
    "word": "variety",
    "tr": "çeşitlilik",
    "sentence": "Our menu has a wide variety of meals.",
    "level": "B1"
  },
  {
    "word": "victory",
    "tr": "zafer, galibiyet",
    "sentence": "The team celebrated their grand victory.",
    "level": "B1"
  },
  {
    "word": "visible",
    "tr": "görünür, açıkta",
    "sentence": "The castle is visible on the hill.",
    "level": "B1"
  },
  {
    "word": "volunteer",
    "tr": "gönüllü olmak",
    "sentence": "Students volunteer at animal shelters.",
    "level": "B1"
  },
  {
    "word": "wander",
    "tr": "gezinmek, dolaşmak",
    "sentence": "We wander through cobblestone alleys.",
    "level": "B1"
  },
  {
    "word": "whisper",
    "tr": "fısıldamak",
    "sentence": "Whisper quietly in the library.",
    "level": "B1"
  },
  {
    "word": "willing",
    "tr": "istekli, hevesli",
    "sentence": "He is willing to help anytime.",
    "level": "B1"
  },
  {
    "word": "accurate",
    "tr": "doğru, kesin",
    "sentence": "The weather forecast was remarkably accurate today.",
    "level": "B2"
  },
  {
    "word": "adapt",
    "tr": "uyum sağlamak",
    "sentence": "Humans can adapt quickly to changing environments.",
    "level": "B2"
  },
  {
    "word": "adequate",
    "tr": "yeterli",
    "sentence": "Make sure you get adequate sleep before the exam.",
    "level": "B2"
  },
  {
    "word": "allocate",
    "tr": "tahsis etmek, ayırmak",
    "sentence": "We should allocate more time to listening practice.",
    "level": "B2"
  },
  {
    "word": "ambitious",
    "tr": "hırslı, iddialı",
    "sentence": "She has an ambitious plan to launch her own company.",
    "level": "B2"
  },
  {
    "word": "analyze",
    "tr": "analiz etmek",
    "sentence": "Scientists analyze data to find hidden patterns.",
    "level": "B2"
  },
  {
    "word": "apparent",
    "tr": "açık, belirgin",
    "sentence": "It soon became apparent that the plan needed changes.",
    "level": "B2"
  },
  {
    "word": "appreciate",
    "tr": "takdir etmek, minnettar olmak",
    "sentence": "I truly appreciate your generous help.",
    "level": "B2"
  },
  {
    "word": "assume",
    "tr": "varsaymak",
    "sentence": "Do not assume the answer without checking the facts.",
    "level": "B2"
  },
  {
    "word": "attempt",
    "tr": "girişim, denemek",
    "sentence": "He made an attempt to break the record.",
    "level": "B2"
  },
  {
    "word": "aware",
    "tr": "farkında",
    "sentence": "People are becoming more aware of digital privacy.",
    "level": "B2"
  },
  {
    "word": "candidate",
    "tr": "aday",
    "sentence": "She is the strongest candidate for the job.",
    "level": "B2"
  },
  {
    "word": "capable",
    "tr": "yetenekli, muktedir",
    "sentence": "She is fully capable of leading the entire project.",
    "level": "B2"
  },
  {
    "word": "capture",
    "tr": "yakalamak, ele geçirmek",
    "sentence": "The photo captures the beauty of nature.",
    "level": "B2"
  },
  {
    "word": "citizen",
    "tr": "vatandaş",
    "sentence": "Every citizen has the right to vote.",
    "level": "B2"
  },
  {
    "word": "claim",
    "tr": "iddia etmek",
    "sentence": "They claim the new system is foolproof.",
    "level": "B2"
  },
  {
    "word": "clarify",
    "tr": "netleştirmek, açıklamak",
    "sentence": "Could you clarify the last paragraph?",
    "level": "B2"
  },
  {
    "word": "collaborate",
    "tr": "iş birliği yapmak",
    "sentence": "Designers and engineers collaborate closely on new products.",
    "level": "B2"
  },
  {
    "word": "commit",
    "tr": "adamak, taahhüt etmek",
    "sentence": "You must commit at least twenty minutes a day.",
    "level": "B2"
  },
  {
    "word": "compensate",
    "tr": "telafi etmek",
    "sentence": "Extra rest helped compensate for the exhausting week.",
    "level": "B2"
  },
  {
    "word": "complex",
    "tr": "karmaşık",
    "sentence": "The human brain is an extraordinarily complex organ.",
    "level": "B2"
  },
  {
    "word": "conclude",
    "tr": "sonuçlandırmak",
    "sentence": "The speaker concluded with a memorable quote.",
    "level": "B2"
  },
  {
    "word": "consequence",
    "tr": "sonuç",
    "sentence": "Every decision carries a long-term consequence.",
    "level": "B2"
  },
  {
    "word": "consistent",
    "tr": "tutarlı",
    "sentence": "Consistent practice matters more than occasional cramming.",
    "level": "B2"
  },
  {
    "word": "constant",
    "tr": "sürekli, sabit",
    "sentence": "The machine requires constant care.",
    "level": "B2"
  },
  {
    "word": "contribute",
    "tr": "katkıda bulunmak",
    "sentence": "Each member can contribute fresh ideas to the meeting.",
    "level": "B2"
  },
  {
    "word": "controversial",
    "tr": "tartışmalı",
    "sentence": "The new city regulation sparked a controversial debate.",
    "level": "B2"
  },
  {
    "word": "courage",
    "tr": "cesaret",
    "sentence": "It takes courage to admit your mistakes.",
    "level": "B2"
  },
  {
    "word": "crucial",
    "tr": "çok önemli, kritik",
    "sentence": "Clear communication is crucial for teamwork.",
    "level": "B2"
  },
  {
    "word": "decline",
    "tr": "azalmak, reddetmek",
    "sentence": "He politely had to decline the dinner invitation.",
    "level": "B2"
  },
  {
    "word": "dedicate",
    "tr": "adamak",
    "sentence": "She decided to dedicate her weekends to volunteering.",
    "level": "B2"
  },
  {
    "word": "delight",
    "tr": "sevinç, zevk",
    "sentence": "The children smiled with pure delight.",
    "level": "B2"
  },
  {
    "word": "demand",
    "tr": "talep, talep etmek",
    "sentence": "Consumer demand for electric cars is rising.",
    "level": "B2"
  },
  {
    "word": "demonstrate",
    "tr": "göstermek, kanıtlamak",
    "sentence": "The experiment will demonstrate how the battery works.",
    "level": "B2"
  },
  {
    "word": "determine",
    "tr": "belirlemek",
    "sentence": "Your daily habits largely determine your future.",
    "level": "B2"
  },
  {
    "word": "distinct",
    "tr": "belirgin, farklı",
    "sentence": "Each region has its own distinct culinary style.",
    "level": "B2"
  },
  {
    "word": "eager",
    "tr": "istekli, hevesli",
    "sentence": "Students are eager to start the new term.",
    "level": "B2"
  },
  {
    "word": "efficient",
    "tr": "verimli",
    "sentence": "Electric trains are a fast and efficient way to travel.",
    "level": "B2"
  },
  {
    "word": "eliminate",
    "tr": "elemek, ortadan kaldırmak",
    "sentence": "Good habits help eliminate unnecessary daily stress.",
    "level": "B2"
  },
  {
    "word": "emerge",
    "tr": "ortaya çıkmak",
    "sentence": "New technologies continue to emerge every year.",
    "level": "B2"
  },
  {
    "word": "empathy",
    "tr": "empati, duygudaşlık",
    "sentence": "Empathy allows us to connect with other people pain.",
    "level": "B2"
  },
  {
    "word": "emphasis",
    "tr": "vurgu",
    "sentence": "The course places strong emphasis on speaking practice.",
    "level": "B2"
  },
  {
    "word": "emphasize",
    "tr": "vurgulamak",
    "sentence": "The teacher emphasized the importance of study.",
    "level": "B2"
  },
  {
    "word": "enable",
    "tr": "olanak tanımak",
    "sentence": "Smartphones enable instant global communication.",
    "level": "B2"
  },
  {
    "word": "endure",
    "tr": "katlanmak, dayanmak",
    "sentence": "Athletes endure intense physical training.",
    "level": "B2"
  },
  {
    "word": "enhance",
    "tr": "geliştirmek, artırmak",
    "sentence": "Good lighting can enhance the mood of a room.",
    "level": "B2"
  },
  {
    "word": "ensure",
    "tr": "sağlamak, garantiye almak",
    "sentence": "Double-check to ensure doors are locked.",
    "level": "B2"
  },
  {
    "word": "essential",
    "tr": "temel, vazgeçilmez",
    "sentence": "Clean water is essential for all forms of life.",
    "level": "B2"
  },
  {
    "word": "establish",
    "tr": "kurmak, tesis etmek",
    "sentence": "They established a charity for schools.",
    "level": "B2"
  },
  {
    "word": "evaluate",
    "tr": "değerlendirmek",
    "sentence": "Teachers evaluate essays based on clarity and logic.",
    "level": "B2"
  },
  {
    "word": "evidence",
    "tr": "kanıt, delil",
    "sentence": "Scientists found evidence of water on Mars.",
    "level": "B2"
  },
  {
    "word": "evident",
    "tr": "apaçık, aşikar",
    "sentence": "Her excitement was evident from her bright smile.",
    "level": "B2"
  },
  {
    "word": "expand",
    "tr": "genişletmek, büyümek",
    "sentence": "The company plans to expand to Europe.",
    "level": "B2"
  },
  {
    "word": "extraordinary",
    "tr": "olağanüstü",
    "sentence": "The acrobat made an extraordinary jump.",
    "level": "B2"
  },
  {
    "word": "facilitate",
    "tr": "kolaylaştırmak",
    "sentence": "Visual diagrams can facilitate faster understanding.",
    "level": "B2"
  },
  {
    "word": "fascinating",
    "tr": "büyüleyici",
    "sentence": "The documentary was utterly fascinating.",
    "level": "B2"
  },
  {
    "word": "flexible",
    "tr": "esnek",
    "sentence": "Many companies now offer flexible working hours.",
    "level": "B2"
  },
  {
    "word": "fortune",
    "tr": "servet, talih, şans",
    "sentence": "He made a fortune through investments.",
    "level": "B2"
  },
  {
    "word": "fulfill",
    "tr": "yerine getirmek, karşılamak",
    "sentence": "He worked hard to fulfill his promise.",
    "level": "B2"
  },
  {
    "word": "fundamental",
    "tr": "esas, temel",
    "sentence": "Respect is a fundamental human value.",
    "level": "B2"
  },
  {
    "word": "generate",
    "tr": "üretmek, oluşturmak",
    "sentence": "Wind turbines generate clean electricity for homes.",
    "level": "B2"
  },
  {
    "word": "genuine",
    "tr": "gerçek, samimi",
    "sentence": "She flashed a genuine smile of gratitude.",
    "level": "B2"
  },
  {
    "word": "gradual",
    "tr": "kademeli, yavaş yavaş",
    "sentence": "There was a gradual improvement in health.",
    "level": "B2"
  },
  {
    "word": "guidance",
    "tr": "rehberlik, kılavuzluk",
    "sentence": "Students seek guidance from mentors.",
    "level": "B2"
  },
  {
    "word": "hypothesis",
    "tr": "hipotez, varsayım",
    "sentence": "The researchers tested their hypothesis in the lab.",
    "level": "B2"
  },
  {
    "word": "illustrate",
    "tr": "örneklemek, göstermek",
    "sentence": "The charts illustrate the market trends.",
    "level": "B2"
  },
  {
    "word": "impact",
    "tr": "etki",
    "sentence": "Small kindnesses can have a huge impact on others.",
    "level": "B2"
  },
  {
    "word": "implement",
    "tr": "uygulamak",
    "sentence": "The school will implement the new schedule next week.",
    "level": "B2"
  },
  {
    "word": "indicate",
    "tr": "belirtmek, işaret etmek",
    "sentence": "The lights indicate the machine is ready.",
    "level": "B2"
  },
  {
    "word": "inevitable",
    "tr": "kaçınılmaz",
    "sentence": "Change is an inevitable part of growing up.",
    "level": "B2"
  },
  {
    "word": "influence",
    "tr": "etkilemek, tesir",
    "sentence": "Friends have a strong influence on us.",
    "level": "B2"
  },
  {
    "word": "initial",
    "tr": "ilk, başlangıçtaki",
    "sentence": "Our initial impression was very positive.",
    "level": "B2"
  },
  {
    "word": "initiative",
    "tr": "girişim, inisiyatif",
    "sentence": "Taking initiative early shows strong leadership.",
    "level": "B2"
  },
  {
    "word": "insight",
    "tr": "içgörü, kavrayış",
    "sentence": "The book offers deep insight into human behavior.",
    "level": "B2"
  },
  {
    "word": "inspire",
    "tr": "ilham vermek",
    "sentence": "Her story inspired millions worldwide.",
    "level": "B2"
  },
  {
    "word": "investigate",
    "tr": "soruşturmak, araştırmak",
    "sentence": "Detectives investigate the mysterious case.",
    "level": "B2"
  },
  {
    "word": "justice",
    "tr": "adalet",
    "sentence": "Courts exist to uphold fairness and justice.",
    "level": "B2"
  },
  {
    "word": "justify",
    "tr": "haklı çıkarmak, gerekçelendirmek",
    "sentence": "Can you justify the extra cost in the budget?",
    "level": "B2"
  },
  {
    "word": "launch",
    "tr": "başlatmak, fırlatmak",
    "sentence": "They will launch the mobile app soon.",
    "level": "B2"
  },
  {
    "word": "leadership",
    "tr": "liderlik",
    "sentence": "True leadership inspires others to grow.",
    "level": "B2"
  },
  {
    "word": "legendary",
    "tr": "efsanevi",
    "sentence": "He is a legendary basketball player.",
    "level": "B2"
  },
  {
    "word": "legitimate",
    "tr": "meşru, geçerli",
    "sentence": "He raised a legitimate concern about data security.",
    "level": "B2"
  },
  {
    "word": "liberty",
    "tr": "özgürlük, hürriyet",
    "sentence": "Statues honor the spirit of liberty.",
    "level": "B2"
  },
  {
    "word": "maintain",
    "tr": "sürdürmek, korumak",
    "sentence": "It takes effort to maintain long-distance friendships.",
    "level": "B2"
  },
  {
    "word": "mature",
    "tr": "olgun",
    "sentence": "He handled the disagreement in a mature way.",
    "level": "B2"
  },
  {
    "word": "modest",
    "tr": "mütevazı, alçakgönüllü",
    "sentence": "He remains modest despite his awards.",
    "level": "B2"
  },
  {
    "word": "navigate",
    "tr": "yol bulmak, gezinmek",
    "sentence": "Sailors navigate using stars and compass.",
    "level": "B2"
  },
  {
    "word": "neglect",
    "tr": "ihmal etmek",
    "sentence": "Do not neglect your sleep while preparing for finals.",
    "level": "B2"
  },
  {
    "word": "negotiate",
    "tr": "müzakere etmek",
    "sentence": "They met to negotiate a fair agreement.",
    "level": "B2"
  },
  {
    "word": "neutral",
    "tr": "tarafsız, nötr",
    "sentence": "The referee remained completely neutral.",
    "level": "B2"
  },
  {
    "word": "noble",
    "tr": "soylu, asil",
    "sentence": "Helping others is a noble life path.",
    "level": "B2"
  },
  {
    "word": "nostalgia",
    "tr": "geçmişe özlem, nostalji",
    "sentence": "Old childhood photos filled her with deep nostalgia.",
    "level": "B2"
  },
  {
    "word": "noticeable",
    "tr": "fark edilir, belirgin",
    "sentence": "There is a noticeable improvement in air.",
    "level": "B2"
  },
  {
    "word": "obstacle",
    "tr": "engel",
    "sentence": "Lack of funding was the main obstacle to the project.",
    "level": "B2"
  },
  {
    "word": "obtain",
    "tr": "edinmek, elde etmek",
    "sentence": "You must obtain a license to drive.",
    "level": "B2"
  },
  {
    "word": "optimistic",
    "tr": "iyimser",
    "sentence": "She holds an optimistic view of life.",
    "level": "B2"
  },
  {
    "word": "outcome",
    "tr": "sonuç, çıktı",
    "sentence": "We are hopeful about the final outcome of the talks.",
    "level": "B2"
  },
  {
    "word": "overcome",
    "tr": "üstesinden gelmek",
    "sentence": "With hope you can overcome challenges.",
    "level": "B2"
  },
  {
    "word": "perceive",
    "tr": "algılamak",
    "sentence": "People often perceive the same event differently.",
    "level": "B2"
  },
  {
    "word": "permanent",
    "tr": "kalıcı, daimi",
    "sentence": "Tattoos are a permanent form of art.",
    "level": "B2"
  },
  {
    "word": "persist",
    "tr": "sürdürmek, direnmek",
    "sentence": "If symptoms persist, see a doctor.",
    "level": "B2"
  },
  {
    "word": "perspective",
    "tr": "bakış açısı",
    "sentence": "Books offer a fresh perspective on life.",
    "level": "B2"
  },
  {
    "word": "persuade",
    "tr": "ikna etmek",
    "sentence": "It took hours to persuade him to join the trip.",
    "level": "B2"
  },
  {
    "word": "potential",
    "tr": "potansiyel",
    "sentence": "Every student has the potential to excel with guidance.",
    "level": "B2"
  },
  {
    "word": "preserve",
    "tr": "korumak, muhafaza etmek",
    "sentence": "We must preserve ancient forests.",
    "level": "B2"
  },
  {
    "word": "priority",
    "tr": "öncelik",
    "sentence": "Health should always remain your top priority.",
    "level": "B2"
  },
  {
    "word": "productive",
    "tr": "üretken, verimli",
    "sentence": "We had a very productive study session.",
    "level": "B2"
  },
  {
    "word": "prohibit",
    "tr": "yasaklamak",
    "sentence": "Rules prohibit smoking in public parks.",
    "level": "B2"
  },
  {
    "word": "punctual",
    "tr": "dakik",
    "sentence": "He is always punctual for morning meetings.",
    "level": "B2"
  },
  {
    "word": "radiant",
    "tr": "ışıl ışıl, parıldayan",
    "sentence": "The morning sky was bright and radiant.",
    "level": "B2"
  },
  {
    "word": "rapid",
    "tr": "hızlı, çabuk",
    "sentence": "Technology makes rapid changes today.",
    "level": "B2"
  },
  {
    "word": "rational",
    "tr": "akılcı, mantıklı",
    "sentence": "Stay calm and make a rational choice.",
    "level": "B2"
  },
  {
    "word": "recall",
    "tr": "hatırlamak, anımsamak",
    "sentence": "I recall meeting her in Ankara.",
    "level": "B2"
  },
  {
    "word": "reinforce",
    "tr": "pekiştirmek, güçlendirmek",
    "sentence": "Flashcards reinforce new vocabulary in memory.",
    "level": "B2"
  },
  {
    "word": "reject",
    "tr": "reddetmek",
    "sentence": "The editor had to reject the draft.",
    "level": "B2"
  },
  {
    "word": "reliable",
    "tr": "güvenilir",
    "sentence": "She is the most reliable person in our office.",
    "level": "B2"
  },
  {
    "word": "reluctant",
    "tr": "isteksiz, gönülsüz",
    "sentence": "He was initially reluctant to speak in front of crowds.",
    "level": "B2"
  },
  {
    "word": "resemble",
    "tr": "benzemek",
    "sentence": "The two sisters resemble each other.",
    "level": "B2"
  },
  {
    "word": "resident",
    "tr": "sakin, ikamet eden",
    "sentence": "Each resident helps clean the garden.",
    "level": "B2"
  },
  {
    "word": "resolve",
    "tr": "çözmek, halletmek",
    "sentence": "They spoke kindly to resolve the dispute.",
    "level": "B2"
  },
  {
    "word": "restore",
    "tr": "onarmak, eski haline getirmek",
    "sentence": "Volunteers restore the vintage clock.",
    "level": "B2"
  },
  {
    "word": "reveal",
    "tr": "açığa vurmak, göstermek",
    "sentence": "Open the box to reveal the surprise.",
    "level": "B2"
  },
  {
    "word": "sacrifice",
    "tr": "feda etmek, fedakarlık",
    "sentence": "Parents sacrifice time for children.",
    "level": "B2"
  },
  {
    "word": "severe",
    "tr": "şiddetli, ağır",
    "sentence": "The storm caused severe weather alerts.",
    "level": "B2"
  },
  {
    "word": "significant",
    "tr": "önemli, kayda değer",
    "sentence": "There has been a significant drop in energy use.",
    "level": "B2"
  },
  {
    "word": "sincere",
    "tr": "samimi, içten",
    "sentence": "A sincere compliment warms the heart.",
    "level": "B2"
  },
  {
    "word": "skillful",
    "tr": "becerikli, maharetli",
    "sentence": "The skillful baker made warm bagels.",
    "level": "B2"
  },
  {
    "word": "splendid",
    "tr": "muhteşem, harika",
    "sentence": "We had a splendid afternoon walk.",
    "level": "B2"
  },
  {
    "word": "stable",
    "tr": "kararlı, istikrarlı",
    "sentence": "Keep the ladder steady and stable.",
    "level": "B2"
  },
  {
    "word": "straightforward",
    "tr": "basit, anlaşılır",
    "sentence": "The user guide is straightforward.",
    "level": "B2"
  },
  {
    "word": "sufficient",
    "tr": "yeterli",
    "sentence": "Do we have sufficient evidence to support this claim?",
    "level": "B2"
  },
  {
    "word": "superficial",
    "tr": "yüzeysel, samimiyetsiz",
    "sentence": "Do not make superficial judgments about people.",
    "level": "B2"
  },
  {
    "word": "sustain",
    "tr": "sürdürmek, devam ettirmek",
    "sentence": "Renewable energy helps sustain economic growth.",
    "level": "B2"
  },
  {
    "word": "sustainable",
    "tr": "sürdürülebilir",
    "sentence": "Solar power is a sustainable energy.",
    "level": "B2"
  },
  {
    "word": "thorough",
    "tr": "titiz, kapsamlı",
    "sentence": "Do a thorough cleaning of your desk.",
    "level": "B2"
  },
  {
    "word": "threaten",
    "tr": "tehdit etmek",
    "sentence": "Frost can threaten fruit blossoms.",
    "level": "B2"
  },
  {
    "word": "thrive",
    "tr": "gelişmek, serpilmek",
    "sentence": "Flowers thrive in warm sunlight.",
    "level": "B2"
  },
  {
    "word": "tolerate",
    "tr": "hoşgörmek, tahammül etmek",
    "sentence": "We do not tolerate rude behavior.",
    "level": "B2"
  },
  {
    "word": "transform",
    "tr": "dönüştürmek",
    "sentence": "Flowers transform the bare garden.",
    "level": "B2"
  },
  {
    "word": "tremendous",
    "tr": "muazzam, olağanüstü",
    "sentence": "You made tremendous progress this week.",
    "level": "B2"
  },
  {
    "word": "trigger",
    "tr": "tetiklemek",
    "sentence": "A familiar scent can trigger vivid childhood memories.",
    "level": "B2"
  },
  {
    "word": "trustworthy",
    "tr": "güvenilir",
    "sentence": "A trustworthy friend keeps secrets safe.",
    "level": "B2"
  },
  {
    "word": "ultimate",
    "tr": "nihai, en büyük",
    "sentence": "Happiness is the ultimate goal in life.",
    "level": "B2"
  },
  {
    "word": "universal",
    "tr": "evrensel",
    "sentence": "Music is a universal language.",
    "level": "B2"
  },
  {
    "word": "unravel",
    "tr": "çözülmek, aydınlanmak",
    "sentence": "Detectives worked to unravel the mysterious plot.",
    "level": "B2"
  },
  {
    "word": "vast",
    "tr": "uçsuz bucaksız, devasa",
    "sentence": "The ocean is a vast expanse of blue.",
    "level": "B2"
  },
  {
    "word": "venture",
    "tr": "girişim, cesaret etmek",
    "sentence": "They venture into uncharted territory.",
    "level": "B2"
  },
  {
    "word": "verify",
    "tr": "doğrulamak, teyit etmek",
    "sentence": "Verify your email to continue.",
    "level": "B2"
  },
  {
    "word": "vital",
    "tr": "hayati, çok önemli",
    "sentence": "Rest is vital for recovery.",
    "level": "B2"
  },
  {
    "word": "vivid",
    "tr": "canlı, parlak",
    "sentence": "She has vivid memories of childhood.",
    "level": "B2"
  },
  {
    "word": "vulnerable",
    "tr": "savunmasız, kırılgan",
    "sentence": "Coastal towns are vulnerable to rising sea levels.",
    "level": "B2"
  },
  {
    "word": "widespread",
    "tr": "yaygın, geniş çaplı",
    "sentence": "There is widespread joy in the city.",
    "level": "B2"
  },
  {
    "word": "wisdom",
    "tr": "bilgelik, hikmet",
    "sentence": "Books are filled with ancient wisdom.",
    "level": "B2"
  },
  {
    "word": "worthwhile",
    "tr": "zahmete değer",
    "sentence": "Learning English is a worthwhile pursuit.",
    "level": "B2"
  },
  {
    "word": "yield",
    "tr": "vermek, kazandırmak",
    "sentence": "Good study yields high exam scores.",
    "level": "B2"
  },
  {
    "word": "alleviate",
    "tr": "hafifletmek, dindirmek",
    "sentence": "Short walks can alleviate tension during busy workdays.",
    "level": "C1"
  },
  {
    "word": "ambiguous",
    "tr": "belirsiz, muğlak",
    "sentence": "The contract contained several ambiguous clauses.",
    "level": "C1"
  },
  {
    "word": "arbitrary",
    "tr": "keyfi, rastgele",
    "sentence": "The selection process seemed completely arbitrary.",
    "level": "C1"
  },
  {
    "word": "articulate",
    "tr": "akıcı ve net ifade etmek",
    "sentence": "She is able to articulate complex ideas effortlessly.",
    "level": "C1"
  },
  {
    "word": "bolster",
    "tr": "desteklemek, güçlendirmek",
    "sentence": "Positive feedback helped bolster the team's morale.",
    "level": "C1"
  },
  {
    "word": "candid",
    "tr": "samimi, açık sözlü",
    "sentence": "I appreciate your candid opinion on this design.",
    "level": "C1"
  },
  {
    "word": "coherent",
    "tr": "tutarlı, mantıklı",
    "sentence": "He presented a clear and coherent argument.",
    "level": "C1"
  },
  {
    "word": "compelling",
    "tr": "ikna edici, sürükleyici",
    "sentence": "The documentary makes a compelling case for reform.",
    "level": "C1"
  },
  {
    "word": "complacent",
    "tr": "kendinden fazla memnun, kayıtsız",
    "sentence": "We cannot afford to become complacent about cybersecurity.",
    "level": "C1"
  },
  {
    "word": "comprehensive",
    "tr": "kapsamlı",
    "sentence": "We need a comprehensive review of the whole system.",
    "level": "C1"
  },
  {
    "word": "consolidate",
    "tr": "birleştirmek, sağlamlaştırmak",
    "sentence": "Reviewing notes nightly helps consolidate new knowledge.",
    "level": "C1"
  },
  {
    "word": "contemplate",
    "tr": "derinlemesine düşünmek",
    "sentence": "She sat by the lake to contemplate her next move.",
    "level": "C1"
  },
  {
    "word": "convey",
    "tr": "iletmek, aktarmak",
    "sentence": "Words alone cannot convey how thankful I feel.",
    "level": "C1"
  },
  {
    "word": "credibility",
    "tr": "güvenilirlik, inandırıcılık",
    "sentence": "Honest reporting builds long-term credibility.",
    "level": "C1"
  },
  {
    "word": "culminate",
    "tr": "doruğa ulaşmak, sonuçlanmak",
    "sentence": "Months of rehearsal will culminate in tonight's concert.",
    "level": "C1"
  },
  {
    "word": "deteriorate",
    "tr": "kötüleşmek, bozulmak",
    "sentence": "Air quality tends to deteriorate during heavy traffic.",
    "level": "C1"
  },
  {
    "word": "detrimental",
    "tr": "zararlı, hasar verici",
    "sentence": "Lack of sleep is detrimental to your immune system.",
    "level": "C1"
  },
  {
    "word": "diligent",
    "tr": "çalışkan, özenli",
    "sentence": "Her diligent research uncovered rare historical letters.",
    "level": "C1"
  },
  {
    "word": "discrepancy",
    "tr": "tutarsızlık, uyuşmazlık",
    "sentence": "Auditors noticed a discrepancy in the financial report.",
    "level": "C1"
  },
  {
    "word": "disseminate",
    "tr": "yaymak, dağıtmak",
    "sentence": "Universities disseminate research findings globally.",
    "level": "C1"
  },
  {
    "word": "elaborate",
    "tr": "ayrıntılı, detaylandırmak",
    "sentence": "Could you elaborate on your proposal during the call?",
    "level": "C1"
  },
  {
    "word": "eloquent",
    "tr": "etkileyici konuşan, belagatli",
    "sentence": "The speaker delivered an eloquent tribute to her mentor.",
    "level": "C1"
  },
  {
    "word": "eminent",
    "tr": "seçkin, ünlü",
    "sentence": "An eminent historian gave the opening lecture.",
    "level": "C1"
  },
  {
    "word": "empirical",
    "tr": "deneysel, gözleme dayalı",
    "sentence": "Their theory is backed by strong empirical evidence.",
    "level": "C1"
  },
  {
    "word": "endeavor",
    "tr": "çaba, girişim",
    "sentence": "Building a sustainable city is a collective endeavor.",
    "level": "C1"
  },
  {
    "word": "ephemeral",
    "tr": "kısa ömürlü, geçici",
    "sentence": "Fame on social media can be surprisingly ephemeral.",
    "level": "C1"
  },
  {
    "word": "exacerbate",
    "tr": "kötüleştirmek, şiddetlendirmek",
    "sentence": "Skipping sleep will only exacerbate your stress.",
    "level": "C1"
  },
  {
    "word": "exemplary",
    "tr": "örnek teşkil eden, kusursuz",
    "sentence": "Her exemplary conduct earned the student award.",
    "level": "C1"
  },
  {
    "word": "feasible",
    "tr": "uygulanabilir, mümkün",
    "sentence": "Solar heating is now a financially feasible option.",
    "level": "C1"
  },
  {
    "word": "fluctuate",
    "tr": "dalgalanmak",
    "sentence": "Oil prices tend to fluctuate with global demand.",
    "level": "C1"
  },
  {
    "word": "formidable",
    "tr": "zorlu, heybetli",
    "sentence": "Climbing the winter peak was a formidable task.",
    "level": "C1"
  },
  {
    "word": "foster",
    "tr": "teşvik etmek, beslemek",
    "sentence": "Open dialogue helps foster trust among teammates.",
    "level": "C1"
  },
  {
    "word": "futile",
    "tr": "nafile, boşuna",
    "sentence": "Arguments without logic are completely futile.",
    "level": "C1"
  },
  {
    "word": "imperative",
    "tr": "zorunlu, elzem",
    "sentence": "Immediate medical attention is imperative in an emergency.",
    "level": "C1"
  },
  {
    "word": "implication",
    "tr": "çıkarım, olası etki",
    "sentence": "Think carefully about the ethical implications of AI.",
    "level": "C1"
  },
  {
    "word": "incentive",
    "tr": "teşvik, güdü",
    "sentence": "Tax breaks provide an incentive for green energy.",
    "level": "C1"
  },
  {
    "word": "indispensable",
    "tr": "vazgeçilmez",
    "sentence": "Good sleep is indispensable for sharp memory.",
    "level": "C1"
  },
  {
    "word": "inherent",
    "tr": "doğasında olan, içkin",
    "sentence": "Risk is an inherent part of any bold innovation.",
    "level": "C1"
  },
  {
    "word": "intricate",
    "tr": "girift, çok detaylı",
    "sentence": "The watchmaker repaired the intricate mechanism.",
    "level": "C1"
  },
  {
    "word": "lament",
    "tr": "esefle karşılamak, yas tutmak",
    "sentence": "Citizens lament the loss of historic neighborhood trees.",
    "level": "C1"
  },
  {
    "word": "leverage",
    "tr": "avantaj olarak kullanmak",
    "sentence": "We can leverage existing data to speed up testing.",
    "level": "C1"
  },
  {
    "word": "lucid",
    "tr": "berrak, anlaşılır",
    "sentence": "Her lucid explanation made quantum physics approachable.",
    "level": "C1"
  },
  {
    "word": "lucrative",
    "tr": "karlı, kazançlı",
    "sentence": "He made a lucrative deal in commercial real estate.",
    "level": "C1"
  },
  {
    "word": "meticulous",
    "tr": "titiz, kılı kırk yaran",
    "sentence": "He kept meticulous notes throughout the experiment.",
    "level": "C1"
  },
  {
    "word": "mitigate",
    "tr": "hafifletmek, azaltmak",
    "sentence": "Planting trees helps mitigate urban heat waves.",
    "level": "C1"
  },
  {
    "word": "nuance",
    "tr": "ince ayrım, nüans",
    "sentence": "A good translator captures every subtle nuance.",
    "level": "C1"
  },
  {
    "word": "oblivious",
    "tr": "farkında olmayan, habersiz",
    "sentence": "He walked along the street, oblivious to the rain.",
    "level": "C1"
  },
  {
    "word": "paradigm",
    "tr": "paradigma, örnek model",
    "sentence": "Remote work created a new paradigm for office culture.",
    "level": "C1"
  },
  {
    "word": "plausible",
    "tr": "akla yatkın, makul",
    "sentence": "She offered a plausible explanation for the delay.",
    "level": "C1"
  },
  {
    "word": "pragmatic",
    "tr": "pragmatik, gerçekçi",
    "sentence": "We need a pragmatic approach rather than pure theory.",
    "level": "C1"
  },
  {
    "word": "precarious",
    "tr": "tehlikeli, pamuk ipliğine bağlı",
    "sentence": "The climber stood on a precarious mountain ledge.",
    "level": "C1"
  },
  {
    "word": "prevalent",
    "tr": "yaygın, hakim",
    "sentence": "Contactless payments have become prevalent everywhere.",
    "level": "C1"
  },
  {
    "word": "profound",
    "tr": "derin, köklü",
    "sentence": "Reading classic literature had a profound effect on him.",
    "level": "C1"
  },
  {
    "word": "quandary",
    "tr": "çıkmaz, ikilem",
    "sentence": "She was in a quandary about which career path to choose.",
    "level": "C1"
  },
  {
    "word": "reciprocal",
    "tr": "karşılıklı, iki taraflı",
    "sentence": "Respect should always be a reciprocal value.",
    "level": "C1"
  },
  {
    "word": "reconcile",
    "tr": "uzlaştırmak, bağdaştırmak",
    "sentence": "It is hard to reconcile work speed with zero errors.",
    "level": "C1"
  },
  {
    "word": "resilient",
    "tr": "dayanıklı, çabuk toparlanan",
    "sentence": "Local communities proved remarkably resilient after the storm.",
    "level": "C1"
  },
  {
    "word": "scrutinize",
    "tr": "titizlikle incelemek",
    "sentence": "Reviewers will scrutinize every detail of the study.",
    "level": "C1"
  },
  {
    "word": "stagnant",
    "tr": "durgun, hareketsiz",
    "sentence": "Wages remained stagnant despite rising living costs.",
    "level": "C1"
  },
  {
    "word": "substantiate",
    "tr": "kanıtlamak, desteklemek",
    "sentence": "Please substantiate your claims with reliable sources.",
    "level": "C1"
  },
  {
    "word": "subtle",
    "tr": "ince, zor fark edilen",
    "sentence": "There was a subtle shift in her tone of voice.",
    "level": "C1"
  },
  {
    "word": "tangible",
    "tr": "somut, elle tutulur",
    "sentence": "The new policy produced tangible improvements in safety.",
    "level": "C1"
  },
  {
    "word": "ubiquitous",
    "tr": "her yerde bulunan, yaygın",
    "sentence": "Smartphones have become ubiquitous in modern life.",
    "level": "C1"
  },
  {
    "word": "unilateral",
    "tr": "tek taraflı",
    "sentence": "The treaty cannot be cancelled by a unilateral decision.",
    "level": "C1"
  },
  {
    "word": "unprecedented",
    "tr": "benzeri görülmemiş",
    "sentence": "Remote learning grew at an unprecedented pace.",
    "level": "C1"
  },
  {
    "word": "viable",
    "tr": "yaşayabilir, uygulanabilir",
    "sentence": "We must find a viable alternative to fossil fuels.",
    "level": "C1"
  },
  {
    "word": "wane",
    "tr": "azalmak, zayıflamak",
    "sentence": "Public interest in the festival began to wane.",
    "level": "C1"
  },
  {
    "word": "zealous",
    "tr": "gayretli, coşkulu, şevkli",
    "sentence": "She was a zealous advocate for children rights.",
    "level": "C1"
  },
  {
    "word": "acumen",
    "tr": "keskin zeka, iş veya durum kavrayışı",
    "sentence": "Her strategic acumen turned the struggling studio around.",
    "level": "C2"
  },
  {
    "word": "alacrity",
    "tr": "heves, isteklilik",
    "sentence": "She accepted the challenging assignment with alacrity.",
    "level": "C2"
  },
  {
    "word": "ameliorate",
    "tr": "iyileştirmek, düzeltmek",
    "sentence": "Steps were taken to ameliorate living conditions.",
    "level": "C2"
  },
  {
    "word": "anachronism",
    "tr": "çağ dışı kalmış şey",
    "sentence": "Using a floppy disk today feels like an anachronism.",
    "level": "C2"
  },
  {
    "word": "anomalous",
    "tr": "kural dışı, anormal",
    "sentence": "We observed an anomalous drop in temperature.",
    "level": "C2"
  },
  {
    "word": "antithesis",
    "tr": "tam zıttı, karşıtı",
    "sentence": "His calm demeanor was the antithesis of panic.",
    "level": "C2"
  },
  {
    "word": "benevolent",
    "tr": "hayırsever, iyiliksever",
    "sentence": "The benevolent doctor treated patients free of charge.",
    "level": "C2"
  },
  {
    "word": "cacophony",
    "tr": "kakofoni, kulak tırmalayan ses",
    "sentence": "A cacophony of car horns echoed through the avenue.",
    "level": "C2"
  },
  {
    "word": "capricious",
    "tr": "kaprisli, değişken",
    "sentence": "Spring weather in the mountains can be quite capricious.",
    "level": "C2"
  },
  {
    "word": "circumspect",
    "tr": "ihtiyatlı, tedbirli",
    "sentence": "She was circumspect when signing unfamiliar agreements.",
    "level": "C2"
  },
  {
    "word": "cogent",
    "tr": "ikna edici, sağlam",
    "sentence": "She offered a cogent summary of the legal dispute.",
    "level": "C2"
  },
  {
    "word": "conundrum",
    "tr": "çözülmesi zor bilmece, ikilem",
    "sentence": "Balancing speed and accuracy remains a classic conundrum.",
    "level": "C2"
  },
  {
    "word": "corroborate",
    "tr": "doğrulamak, teyit etmek",
    "sentence": "Independent witnesses helped corroborate his timeline.",
    "level": "C2"
  },
  {
    "word": "deleterious",
    "tr": "zararlı, tahrip edici",
    "sentence": "Chronic noise has a deleterious impact on concentration.",
    "level": "C2"
  },
  {
    "word": "dichotomy",
    "tr": "ikilik, keskin zıtlık",
    "sentence": "There is often a false dichotomy between art and science.",
    "level": "C2"
  },
  {
    "word": "disparate",
    "tr": "bambaşka, uyumsuz",
    "sentence": "The festival brings together disparate musical traditions.",
    "level": "C2"
  },
  {
    "word": "ebullient",
    "tr": "coşkulu, hayat dolu",
    "sentence": "Her ebullient personality energized the entire room.",
    "level": "C2"
  },
  {
    "word": "enervate",
    "tr": "gücünü tüketmek, zayıflatmak",
    "sentence": "The humid afternoon heat seemed to enervate everyone.",
    "level": "C2"
  },
  {
    "word": "enigmatic",
    "tr": "esrarengiz, gizemli",
    "sentence": "The Mona Lisa wears an enigmatic subtle smile.",
    "level": "C2"
  },
  {
    "word": "equivocal",
    "tr": "iki anlamlı, kaçamak",
    "sentence": "The spokesperson gave an equivocal answer to the press.",
    "level": "C2"
  },
  {
    "word": "esoteric",
    "tr": "ezoterik, az kişinin anladığı",
    "sentence": "The lecture focused on esoteric mathematical proofs.",
    "level": "C2"
  },
  {
    "word": "extrapolate",
    "tr": "eldeki veriden çıkarım yapmak",
    "sentence": "Analysts extrapolate future trends from past habits.",
    "level": "C2"
  },
  {
    "word": "fastidious",
    "tr": "aşırı titiz, müşkülpesent",
    "sentence": "He is fastidious about keeping his workspace spotless.",
    "level": "C2"
  },
  {
    "word": "garrulous",
    "tr": "aşırı geveze, çenesi düşük",
    "sentence": "The garrulous host talked nonstop during dinner.",
    "level": "C2"
  },
  {
    "word": "gregarious",
    "tr": "sosyal, arkadaş canlısı",
    "sentence": "Being gregarious, he made friends in every city.",
    "level": "C2"
  },
  {
    "word": "harbinger",
    "tr": "haberci, müjdeci",
    "sentence": "Swallows returning north are a harbinger of spring.",
    "level": "C2"
  },
  {
    "word": "hyperbole",
    "tr": "mübalağa, abartı",
    "sentence": "Saying you waited a million years is classic hyperbole.",
    "level": "C2"
  },
  {
    "word": "iconoclast",
    "tr": "tabuları yıkan kimse",
    "sentence": "The young director was known as an artistic iconoclast.",
    "level": "C2"
  },
  {
    "word": "idiosyncrasy",
    "tr": "kişiye özgü tuhaf özellik",
    "sentence": "Writing only with green ink was his harmless idiosyncrasy.",
    "level": "C2"
  },
  {
    "word": "immutable",
    "tr": "değişmez, sabit",
    "sentence": "The laws of physics are considered immutable.",
    "level": "C2"
  },
  {
    "word": "impecunious",
    "tr": "parasız, yoksul",
    "sentence": "Many impecunious students rely on public libraries.",
    "level": "C2"
  },
  {
    "word": "impetuous",
    "tr": "düşüncesizce hareket eden, fevri",
    "sentence": "He regretted his impetuous decision to resign.",
    "level": "C2"
  },
  {
    "word": "incongruous",
    "tr": "uyumsuz, bağdaşmaz",
    "sentence": "A palm tree looked incongruous in the snowy garden.",
    "level": "C2"
  },
  {
    "word": "ineffable",
    "tr": "kelimelerle anlatılamaz",
    "sentence": "Standing atop the glacier brought an ineffable sense of awe.",
    "level": "C2"
  },
  {
    "word": "inexorable",
    "tr": "önlenemez, amansız",
    "sentence": "The inexorable march of technology reshapes every field.",
    "level": "C2"
  },
  {
    "word": "insidious",
    "tr": "sinsi, gizlice zarar veren",
    "sentence": "Burnout can be an insidious threat to creative teams.",
    "level": "C2"
  },
  {
    "word": "juxtapose",
    "tr": "yan yana koyup karşılaştırmak",
    "sentence": "The exhibit will juxtapose ancient pottery with modern glass.",
    "level": "C2"
  },
  {
    "word": "juxtaposition",
    "tr": "yan yana koyma, karşıtlık",
    "sentence": "The juxtaposition of modern art and antique stone was striking.",
    "level": "C2"
  },
  {
    "word": "laconic",
    "tr": "özlü, az sözle çok şey anlatan",
    "sentence": "His laconic reply said everything in just three words.",
    "level": "C2"
  },
  {
    "word": "magnanimous",
    "tr": "yüce gönüllü, bağışlayıcı",
    "sentence": "The champion was magnanimous in praising his rival.",
    "level": "C2"
  },
  {
    "word": "mellifluous",
    "tr": "tatlı ve akıcı sesli",
    "sentence": "Her mellifluous voice calmed the restless audience.",
    "level": "C2"
  },
  {
    "word": "nebulous",
    "tr": "belirsiz, sisli",
    "sentence": "Their plans for next summer are still rather nebulous.",
    "level": "C2"
  },
  {
    "word": "nefarious",
    "tr": "kötü niyetli, hain",
    "sentence": "The villain hatched a nefarious scheme to seize power.",
    "level": "C2"
  },
  {
    "word": "obfuscate",
    "tr": "bulanıklaştırmak, kafa karıştırmak",
    "sentence": "Technical jargon can obfuscate a simple message.",
    "level": "C2"
  },
  {
    "word": "ostensible",
    "tr": "görünürdeki, sözde",
    "sentence": "His ostensible reason for visiting was to borrow a book.",
    "level": "C2"
  },
  {
    "word": "ostentatious",
    "tr": "gösterişli, fiyakalı",
    "sentence": "He avoided wearing ostentatious jewelry in public.",
    "level": "C2"
  },
  {
    "word": "ostracize",
    "tr": "dışlamak, toplumdan soyutlamak",
    "sentence": "Fair teams never ostracize someone for making a mistake.",
    "level": "C2"
  },
  {
    "word": "panacea",
    "tr": "her derde deva, mucize çözüm",
    "sentence": "No single policy is a panacea for economic challenges.",
    "level": "C2"
  },
  {
    "word": "parsimonious",
    "tr": "aşırı tutumlu, cimri",
    "sentence": "A parsimonious budget left little room for innovation.",
    "level": "C2"
  },
  {
    "word": "pellucid",
    "tr": "duru, kristal gibi berrak",
    "sentence": "The mountain stream was pellucid even after the rain.",
    "level": "C2"
  },
  {
    "word": "penchant",
    "tr": "özel eğilim, düşkünlük",
    "sentence": "He has a penchant for collecting vintage fountain pens.",
    "level": "C2"
  },
  {
    "word": "pernicious",
    "tr": "çok zararlı, yıkıcı",
    "sentence": "False rumors can have a pernicious effect on morale.",
    "level": "C2"
  },
  {
    "word": "perspicacious",
    "tr": "keskin zekalı, basiretli",
    "sentence": "A perspicacious editor spotted the flaw immediately.",
    "level": "C2"
  },
  {
    "word": "plethora",
    "tr": "aşırı bolluk, çokluk",
    "sentence": "The internet offers a plethora of free learning tools.",
    "level": "C2"
  },
  {
    "word": "proclivity",
    "tr": "doğal eğilim, yatkınlık",
    "sentence": "She has a strong proclivity for solving logic puzzles.",
    "level": "C2"
  },
  {
    "word": "quintessential",
    "tr": "en tipik, özünü yansıtan",
    "sentence": "Turkish tea in a tulip glass is the quintessential welcome.",
    "level": "C2"
  },
  {
    "word": "quixotic",
    "tr": "aşırı idealist, hayalperest",
    "sentence": "Launching a paper magazine today seemed quixotic yet brave.",
    "level": "C2"
  },
  {
    "word": "recalcitrant",
    "tr": "dik başlı, inatçı",
    "sentence": "Even the recalcitrant critic praised the final performance.",
    "level": "C2"
  },
  {
    "word": "reproach",
    "tr": "kınamak, ayıplamak",
    "sentence": "Her conduct was beyond reproach during the entire trial.",
    "level": "C2"
  },
  {
    "word": "sagacious",
    "tr": "bilge, öngörülü",
    "sentence": "Her sagacious advice saved the team from a costly error.",
    "level": "C2"
  },
  {
    "word": "serendipity",
    "tr": "mutlu tesadüf",
    "sentence": "Finding that rare book in a tiny alley was pure serendipity.",
    "level": "C2"
  },
  {
    "word": "superfluous",
    "tr": "gereksiz, fazlalık",
    "sentence": "Remove superfluous adjectives to sharpen your writing.",
    "level": "C2"
  },
  {
    "word": "surreptitious",
    "tr": "gizli saklı, kaçamak",
    "sentence": "She cast a surreptitious glance at her wristwatch.",
    "level": "C2"
  },
  {
    "word": "sycophant",
    "tr": "dalkavuk, yaltakçı",
    "sentence": "Wise leaders prefer honest critics over sycophants.",
    "level": "C2"
  },
  {
    "word": "taciturn",
    "tr": "az konuşan, sessiz",
    "sentence": "The farmer was a taciturn man who valued deeds over words.",
    "level": "C2"
  },
  {
    "word": "tenacious",
    "tr": "azimli, inatçı, bırakmayan",
    "sentence": "Her tenacious effort helped her win the gold medal.",
    "level": "C2"
  },
  {
    "word": "transient",
    "tr": "geçici, kısa süreli",
    "sentence": "Summer storms are intense yet transient.",
    "level": "C2"
  },
  {
    "word": "ubiquity",
    "tr": "her yerde bulunma hali",
    "sentence": "The ubiquity of cameras has transformed street photography.",
    "level": "C2"
  },
  {
    "word": "veracity",
    "tr": "doğruluk, dürüstlük",
    "sentence": "Officials questioned the veracity of the witness claims.",
    "level": "C2"
  },
  {
    "word": "verisimilitude",
    "tr": "gerçeğe benzerlik",
    "sentence": "Careful dialogue gave the novel remarkable verisimilitude.",
    "level": "C2"
  },
  {
    "word": "vociferous",
    "tr": "yüksek sesle itiraz eden",
    "sentence": "Protesters made vociferous demands for clean water.",
    "level": "C2"
  },
  {
    "word": "zenith",
    "tr": "zirve, doruk noktası",
    "sentence": "The empire reached the zenith of its power in the 16th century.",
    "level": "C2"
  }
];

  root.WORDY_DICTIONARY = WORDY_DICTIONARY;
})(typeof window !== 'undefined' ? window : globalThis);
