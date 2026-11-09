// คลังความรู้: บทความสั้นสำหรับมือใหม่ + ความเชื่อผิดๆ + เคล็ดลับประจำวัน (Knowledge library)
// เพิ่มบทความ: เพิ่มรายการใน ARTICLES (ต้องมีทั้ง th และ en)
// body: ข้อความธรรมดา = ย่อหน้า, ขึ้นต้นด้วย "- " = รายการ, ขึ้นต้นด้วย "## " = หัวข้อย่อย

const LEARN_CATS = ["basics", "nutrition", "recovery", "mind"];
const LEARN_CAT_ICON = { basics: "dumbbell", nutrition: "egg", recovery: "moon", mind: "sparkle" };

const ARTICLES = [
  { id: "first-week", cat: "basics", mins: 3, fig: "squat",
    th: { t: "สัปดาห์แรกของการออกกำลังกาย", s: "เริ่มให้ถูก ไม่เจ็บ และอยากทำต่อ",
      b: ["สัปดาห์แรกไม่ได้วัดกันที่ความหนัก แต่วัดที่ว่าคุณทำได้ครบและอยากกลับมาทำอีก",
        "## แผนง่ายๆ 7 วัน", "- ออกกำลังกาย 3 วัน เช่น จันทร์ พุธ ศุกร์ ครั้งละ 20–30 นาที", "- วันที่เหลือเดินเบาๆ 20 นาที", "- เลือก 4–5 ท่าพื้นฐาน: สควอท วิดพื้น (คุกเข่าได้) ยกสะโพก แพลงก์ เดินเร็ว",
        "## จำไว้", "- ทำเบากว่าที่คิดว่าทำได้ 20% กล้ามเนื้อจะเมื่อยน้อยลง", "- เมื่อยวันรุ่งขึ้นเป็นเรื่องปกติ เจ็บแปลบคือสัญญาณให้หยุด", "- จดสิ่งที่ทำไว้ สัปดาห์หน้าจะได้เพิ่มทีละนิด"] },
    en: { t: "Your first week of training", s: "Start right, stay pain-free, and want to come back",
      b: ["Week one isn't about how hard you train. It's about finishing every session and wanting to do it again.",
        "## A simple 7-day plan", "- Train 3 days, e.g. Mon, Wed, Fri, for 20–30 minutes", "- On the other days, walk gently for 20 minutes", "- Pick 4–5 basics: squat, push-up (knees OK), glute bridge, plank, brisk walk",
        "## Remember", "- Go about 20% easier than you think you can; you'll be less sore", "- Next-day soreness is normal; sharp pain means stop", "- Write down what you did so you can add a little next week"] } },

  { id: "warmup", cat: "basics", mins: 2, fig: "march",
    th: { t: "วอร์มอัพ 5 นาที ที่ควรทำทุกครั้ง", s: "ลดการบาดเจ็บ และทำให้ร่างกายพร้อม",
      b: ["การวอร์มอัพทำให้หัวใจเต้นเร็วขึ้น กล้ามเนื้ออุ่น และข้อต่อขยับได้ดีขึ้น ใช้เวลาแค่ 5 นาที",
        "## ทำตามนี้ (ท่าละ 30–45 วินาที)", "- ย่ำเท้าอยู่กับที่ แกว่งแขน", "- หมุนแขนไปหน้าและหลัง", "- หมุนสะโพก", "- สควอทครึ่งทางช้าๆ 10 ครั้ง", "- ลันจ์ถอยหลังเบาๆ ข้างละ 5 ครั้ง",
        "ไม่จำเป็นต้องยืดค้างนานๆ ก่อนออกกำลังกาย เก็บการยืดค้างไว้ตอนคูลดาวน์ดีกว่า"] },
    en: { t: "The 5-minute warm-up to do every time", s: "Fewer injuries and a body that's ready",
      b: ["A warm-up raises your heart rate, warms your muscles and loosens your joints. It only takes 5 minutes.",
        "## Do this (30–45 s each)", "- March in place, swinging your arms", "- Arm circles forward and back", "- Hip circles", "- 10 slow half squats", "- 5 gentle reverse lunges per side",
        "You don't need long static stretches before training. Save holding stretches for the cool-down."] } },

  { id: "form", cat: "basics", mins: 3, fig: "pushup",
    th: { t: "ท่าถูกต้องสำคัญกว่าจำนวนครั้ง", s: "หลัก 4 ข้อที่ใช้ได้กับทุกท่า",
      b: ["ทำ 8 ครั้งที่ถูกต้อง ได้ผลกว่าทำ 20 ครั้งแบบลวกๆ และเสี่ยงบาดเจ็บน้อยกว่ามาก",
        "## หลัก 4 ข้อ", "- เกร็งหน้าท้องเบาๆ เหมือนเตรียมโดนจิ้มพุง", "- หลังตรงเป็นแนวกลาง ไม่ห่อ ไม่แอ่น", "- ควบคุมจังหวะ: ลง 2–3 วินาที ขึ้น 1 วินาที", "- หายใจออกตอนออกแรง หายใจเข้าตอนผ่อน",
        "## เช็กง่ายๆ", "- ถ่ายวิดีโอตัวเองด้านข้าง แล้วเทียบกับภาพท่าในเว็บ", "- ถ้าท่าเริ่มเสีย ให้หยุดเซ็ตนั้นได้เลย"] },
    en: { t: "Good form beats more reps", s: "4 rules that work for every exercise",
      b: ["Eight clean reps do more than 20 sloppy ones, with far less injury risk.",
        "## The 4 rules", "- Brace your stomach lightly, as if someone might poke it", "- Keep a neutral back: not rounded, not arched", "- Control the tempo: 2–3 s down, 1 s up", "- Breathe out on the effort, in on the way back",
        "## Easy check", "- Film yourself from the side and compare with the moves on this site", "- When your form starts to slip, end the set"] } },

  { id: "progress", cat: "basics", mins: 3, fig: "dbpress",
    th: { t: "เพิ่มความยากอย่างไรให้ร่างกายพัฒนา", s: "หลักการเพิ่มทีละนิด (Progressive overload)",
      b: ["ร่างกายปรับตัวกับสิ่งที่ทำซ้ำๆ ถ้าทำเท่าเดิมตลอด ผลก็จะหยุดอยู่กับที่",
        "## เพิ่มได้ 5 แบบ (เลือกทีละอย่าง)", "- เพิ่มจำนวนครั้ง เช่น จาก 8 เป็น 10", "- เพิ่มเซ็ต เช่น จาก 2 เป็น 3", "- เพิ่มน้ำหนัก 2.5–5%", "- ทำช้าลง เพิ่มเวลาที่กล้ามเนื้อทำงาน", "- พักสั้นลง",
        "## เมื่อไรควรเพิ่ม", "ถ้าทำได้ครบทุกเซ็ตโดยครั้งสุดท้ายยังเหลือแรงอีก 2–3 ครั้ง สัปดาห์หน้าเพิ่มได้เลย"] },
    en: { t: "How to make progress", s: "Progressive overload, a little at a time",
      b: ["Your body adapts to what you repeat. Do the same thing forever and results stall.",
        "## 5 ways to add (one at a time)", "- More reps, e.g. 8 → 10", "- More sets, e.g. 2 → 3", "- 2.5–5% more weight", "- Slower reps, more time under tension", "- Shorter rests",
        "## When to add", "If you finish every set with 2–3 reps still in the tank, step it up next week."] } },

  { id: "plate", cat: "nutrition", mins: 3, fig: "drink",
    th: { t: "จานอาหารสำหรับคนออกกำลังกาย", s: "แบ่งจานง่ายๆ ไม่ต้องนับแคลอรี่ทุกมื้อ",
      b: ["ไม่ต้องกินคลีนจัด แค่จัดจานให้ถูกสัดส่วนก็ได้ผลดีแล้ว",
        "## แบ่งจานแบบนี้", "- ครึ่งจาน: ผักหลายสี", "- หนึ่งในสี่: โปรตีน เช่น อกไก่ ปลา ไข่ เต้าหู้ หมูไม่ติดมัน", "- หนึ่งในสี่: ข้าวหรือแป้ง เลือกข้าวกล้อง มัน หรือขนมปังโฮลวีตได้ยิ่งดี", "- ไขมันดีเล็กน้อย เช่น ถั่ว อะโวคาโด น้ำมันมะกอก",
        "## เคล็ดลับ", "- ลดน้ำหวาน ชานมไข่มุก น้ำอัดลม ให้ผลเร็วที่สุด", "- กินช้าลง 15–20 นาทีต่อมื้อ จะอิ่มเร็วขึ้น"] },
    en: { t: "The plate for active people", s: "A simple plate, no calorie counting every meal",
      b: ["You don't need an extreme clean diet. Getting the proportions right already works well.",
        "## Fill your plate like this", "- Half: colourful vegetables", "- A quarter: protein such as chicken, fish, eggs, tofu, lean pork", "- A quarter: rice or carbs; brown rice, potato or wholegrain bread are even better", "- A little healthy fat: nuts, avocado, olive oil",
        "## Tips", "- Cutting sugary drinks, bubble tea and soda gives the fastest results", "- Eat slower, 15–20 minutes a meal, and you'll feel full sooner"] } },

  { id: "protein", cat: "nutrition", mins: 2, fig: "curl",
    th: { t: "โปรตีน: กินเท่าไร กินอะไรดี", s: "ตัวช่วยหลักของการสร้างและรักษากล้ามเนื้อ",
      b: ["คนออกกำลังกายควรได้โปรตีนประมาณ 1.6–2.2 กรัมต่อน้ำหนักตัว 1 กก. ต่อวัน (คำนวณได้ในหน้าสร้างกล้าม)",
        "## ตัวอย่างโปรตีนโดยประมาณ", "- อกไก่ 100 กรัม ≈ 31 กรัม", "- ไข่ 1 ฟอง ≈ 6 กรัม", "- ปลา 100 กรัม ≈ 20–25 กรัม", "- เต้าหู้แข็ง 100 กรัม ≈ 15 กรัม", "- นมจืด 1 กล่อง (250 มล.) ≈ 8 กรัม",
        "แบ่งกินให้มีโปรตีนทุกมื้อ ดีกว่ากินรวดเดียวมื้อเดียว เวย์โปรตีนสะดวกแต่ไม่จำเป็น ถ้าอาหารปกติได้พออยู่แล้ว"] },
    en: { t: "Protein: how much and from what", s: "Your main helper for building and keeping muscle",
      b: ["Active people should aim for about 1.6–2.2 g of protein per kg of body weight a day (calculate it on the Build muscle page).",
        "## Rough protein amounts", "- Chicken breast 100 g ≈ 31 g", "- 1 egg ≈ 6 g", "- Fish 100 g ≈ 20–25 g", "- Firm tofu 100 g ≈ 15 g", "- Milk 250 ml ≈ 8 g",
        "Spread protein across every meal rather than one big one. Whey is convenient but not necessary if your food already covers it."] } },

  { id: "water", cat: "nutrition", mins: 2, fig: "drink",
    th: { t: "ดื่มน้ำเท่าไรถึงพอ", s: "สูตรง่ายๆ และสัญญาณว่าคุณขาดน้ำ",
      b: ["โดยทั่วไปดื่มประมาณ 30–35 มล. ต่อน้ำหนักตัว 1 กก. ต่อวัน เช่น หนัก 60 กก. ≈ 2 ลิตร",
        "## วันที่ออกกำลังกาย", "- ดื่ม 1–2 แก้ว ก่อนเริ่ม 30 นาที", "- จิบระหว่างพักทุก 15–20 นาที", "- ดื่มเพิ่มหลังจบ โดยเฉพาะถ้าเหงื่อออกมาก",
        "## สัญญาณขาดน้ำ", "- ปัสสาวะสีเข้ม", "- ปวดหัว เหนื่อยง่ายผิดปกติ", "- ปากแห้ง"] },
    en: { t: "How much water is enough?", s: "An easy rule and the signs you're low",
      b: ["As a rule, drink about 30–35 ml per kg of body weight a day; at 60 kg that's about 2 litres.",
        "## On training days", "- 1–2 glasses 30 minutes before you start", "- Sip during rests every 15–20 minutes", "- Drink more afterwards, especially if you sweat a lot",
        "## Signs you're low", "- Dark urine", "- Headache, unusual tiredness", "- Dry mouth"] } },

  { id: "sleep", cat: "recovery", mins: 2, fig: "sleep",
    th: { t: "นอนให้พอ = กล้ามโต ไขมันลด", s: "ทำไมการนอนสำคัญพอๆ กับการออกกำลังกาย",
      b: ["กล้ามเนื้อซ่อมแซมและโตขึ้นตอนพัก โดยเฉพาะตอนนอนหลับลึก นอนน้อยทำให้หิวง่ายและอยากของหวานมากขึ้นด้วย",
        "## นอนให้ดีขึ้น", "- ตั้งเป้า 7–9 ชั่วโมง เข้านอนเวลาเดิมทุกวัน", "- งดกาแฟหลังบ่าย 2", "- ห้องมืด เย็น เงียบ", "- วางมือถือก่อนนอน 30 นาที"] },
    en: { t: "Sleep well: build muscle, lose fat", s: "Why sleep matters as much as training",
      b: ["Muscles repair and grow while you rest, especially in deep sleep. Short sleep also makes you hungrier and crave sweets.",
        "## Sleep better", "- Aim for 7–9 hours at the same bedtime every day", "- No coffee after 2 pm", "- A dark, cool, quiet room", "- Put your phone down 30 minutes before bed"] } },

  { id: "soreness", cat: "recovery", mins: 2, fig: "child",
    th: { t: "เมื่อย vs เจ็บ ต่างกันอย่างไร", s: "รู้ว่าเมื่อไรฝึกต่อได้ เมื่อไรต้องหยุด",
      b: ["## เมื่อย (ปกติ)", "- ปวดตื้อๆ ทั่วกล้ามเนื้อ 1–3 วันหลังฝึก", "- ขยับเบาๆ แล้วดีขึ้น", "- ฝึกต่อได้ แต่เลือกส่วนอื่นหรือทำเบาลง",
        "## เจ็บ (ต้องระวัง)", "- เจ็บแปลบ จี๊ด หรือเจ็บที่ข้อต่อ", "- บวม ช้ำ หรือเจ็บมากขึ้นเรื่อยๆ", "- หยุดท่านั้น พัก ถ้าไม่ดีขึ้นใน 2–3 วันควรพบแพทย์",
        "การเดินเบาๆ ยืดเหยียด ดื่มน้ำ และนอนให้พอ ช่วยให้หายเมื่อยเร็วขึ้น"] },
    en: { t: "Soreness vs pain", s: "Know when to keep going and when to stop",
      b: ["## Soreness (normal)", "- A dull ache across the muscle 1–3 days after training", "- Feels better once you move", "- Keep training, but work other muscles or go lighter",
        "## Pain (be careful)", "- Sharp, stabbing pain, or pain in a joint", "- Swelling, bruising, or pain that keeps getting worse", "- Stop that move and rest; if it isn't better in 2–3 days, see a doctor",
        "Gentle walking, stretching, water and good sleep all help soreness fade faster."] } },

  { id: "rest-days", cat: "recovery", mins: 2, fig: "walk",
    th: { t: "วันพักสำคัญไม่แพ้วันฝึก", s: "พักแบบไหนให้ร่างกายฟื้นตัวเร็ว",
      b: ["มือใหม่ควรมีวันพักอย่างน้อย 2–3 วันต่อสัปดาห์ และไม่ควรฝึกกล้ามส่วนเดิมหนักๆ 2 วันติด",
        "## พักแบบแอคทีฟ", "- เดินเล่น 20–30 นาที", "- ยืดเหยียด หรือโยคะเบาๆ", "- ปั่นจักรยานสบายๆ",
        "ถ้ารู้สึกเหนื่อยล้าสะสม นอนไม่หลับ หรือหงุดหงิดง่าย อาจเป็นสัญญาณว่าฝึกมากเกินไป ลองพักเพิ่ม 1–2 วัน"] },
    en: { t: "Rest days matter as much as training days", s: "How to rest so you recover faster",
      b: ["Beginners should take at least 2–3 rest days a week and avoid training the same muscles hard two days in a row.",
        "## Active rest", "- A 20–30 minute walk", "- Stretching or gentle yoga", "- An easy bike ride",
        "If you feel worn out, sleep badly or get irritable, you may be overdoing it. Try an extra rest day or two."] } },

  { id: "habit", cat: "mind", mins: 3, fig: "jj",
    th: { t: "ทำให้การออกกำลังกายเป็นนิสัย", s: "เทคนิคที่ใช้ได้จริง เมื่อแรงจูงใจหมด",
      b: ["แรงจูงใจมาๆ หายๆ แต่นิสัยอยู่ได้นาน เป้าหมายคือทำให้การออกกำลังกายง่ายจนไม่ต้องคิด",
        "## เทคนิค", "- ผูกกับสิ่งที่ทำอยู่แล้ว: \"กลับถึงบ้านปุ๊บ เปลี่ยนชุดออกกำลังกาย\"", "- เริ่มให้เล็กมาก: วันแย่ๆ ทำแค่ 5 นาทีก็นับ", "- เตรียมชุดไว้ตั้งแต่คืนก่อน", "- ติ๊กปฏิทินทุกวันที่ทำ อย่าให้ขาดสองวันติด", "- หาเพื่อนทำด้วย หรือบอกเป้าหมายกับคนอื่น"] },
    en: { t: "Make exercise a habit", s: "Techniques that work when motivation runs out",
      b: ["Motivation comes and goes; habits last. The goal is to make exercise so easy you don't have to think.",
        "## Techniques", "- Attach it to something you already do: \"Get home, change into workout clothes\"", "- Start tiny: on a bad day, 5 minutes still counts", "- Lay out your clothes the night before", "- Tick a calendar every day you train; never miss twice in a row", "- Train with a friend or tell someone your goal"] } },

  { id: "plateau", cat: "mind", mins: 2, fig: "plank",
    th: { t: "น้ำหนักไม่ลด ทำยังไงดี", s: "เช็ก 5 ข้อก่อนท้อ",
      b: ["น้ำหนักขึ้นลงได้ 1–2 กก. ในแต่ละวันจากน้ำและอาหาร ให้ดูแนวโน้ม 2–3 สัปดาห์ ไม่ใช่ตัวเลขรายวัน",
        "## เช็ก 5 ข้อ", "- กินจริงเท่าไร? ลองจดอาหาร 3 วัน มักมีของว่างที่ลืมนับ", "- เครื่องดื่มหวานและแอลกอฮอล์", "- นอนพอไหม", "- ขยับร่างกายนอกเวลาออกกำลังกายน้อยลงหรือเปล่า", "- กล้ามเพิ่มขึ้นแต่ไขมันลด: ลองวัดรอบเอวดูด้วย"] },
    en: { t: "The scale isn't moving. Now what?", s: "Check these 5 things before giving up",
      b: ["Weight swings 1–2 kg day to day from water and food. Watch the 2–3 week trend, not daily numbers.",
        "## Check 5 things", "- How much are you really eating? Log 3 days; forgotten snacks are common", "- Sugary drinks and alcohol", "- Are you sleeping enough?", "- Are you moving less outside workouts?", "- Muscle up, fat down: measure your waist too"] } }
];

const MYTHS = [
  { th: ["ลดพุงได้ด้วยการซิทอัพเยอะๆ", "ร่างกายลดไขมันทั้งตัว ไม่ได้เลือกลดเฉพาะจุด ซิทอัพช่วยให้หน้าท้องแข็งแรง แต่ต้องคุมอาหารด้วยถึงจะเห็นพุงยุบ"],
    en: ["Lots of sit-ups burn belly fat", "Your body loses fat all over, not in one spot. Sit-ups strengthen your core, but you need diet too to see your belly shrink."] },
  { th: ["ผู้หญิงยกเวทแล้วจะตัวใหญ่", "ผู้หญิงมีฮอร์โมนสร้างกล้ามน้อยกว่าผู้ชายมาก การยกเวททำให้ร่างกายกระชับ แข็งแรง และเผาผลาญดีขึ้น"],
    en: ["Lifting weights makes women bulky", "Women have far less muscle-building hormone than men. Lifting makes you firmer, stronger and boosts metabolism."] },
  { th: ["ไม่เหงื่อออก = ไม่ได้ผล", "เหงื่อคือการระบายความร้อน ไม่ได้บอกว่าเผาผลาญมากน้อยแค่ไหน ห้องเย็นก็เหงื่อน้อยแต่ยังได้ผลเท่าเดิม"],
    en: ["No sweat means no results", "Sweat is how you cool down, not a measure of calories burned. In a cold room you sweat less but get the same benefit."] },
  { th: ["ต้องออกกำลังกายทุกวันถึงจะได้ผล", "3–4 วันต่อสัปดาห์อย่างสม่ำเสมอได้ผลดีมาก ร่างกายต้องการวันพักเพื่อฟื้นตัวและพัฒนา"],
    en: ["You have to train every day", "3–4 consistent days a week work very well. Your body needs rest days to recover and improve."] },
  { th: ["กินหลัง 2 ทุ่มแล้วอ้วน", "สิ่งสำคัญคือพลังงานรวมทั้งวัน ไม่ใช่เวลากิน แต่การกินดึกมักมาพร้อมของว่างที่ไม่จำเป็น"],
    en: ["Eating after 8 pm makes you fat", "What matters is your total energy for the day, not the clock. Late eating just often comes with extra snacks."] },
  { th: ["ไม่เจ็บ ไม่ได้ผล (No pain, no gain)", "เมื่อยได้ แต่ไม่ควรเจ็บ ความเจ็บคือสัญญาณเตือน การฝึกสม่ำเสมอแบบปลอดภัยได้ผลดีกว่าฝืนแล้วบาดเจ็บ"],
    en: ["No pain, no gain", "Effort yes, pain no. Pain is a warning. Steady, safe training beats pushing through and getting hurt."] }
];

const LEARN_T = {
  th: { title: "คลังความรู้", sub: "บทความสั้นๆ อ่านจบใน 2–3 นาที", all: "ทั้งหมด",
    cat_basics: "พื้นฐาน", cat_nutrition: "อาหาร", cat_recovery: "การพักฟื้น", cat_mind: "แรงจูงใจ",
    mins: n => `อ่าน ${n} นาที`, read: "อ่านต่อ", mythTitle: "ความเชื่อผิดๆ ที่พบบ่อย", mythSub: "แตะการ์ดเพื่อดูความจริง",
    myth: "ความเชื่อ", fact: "ความจริง", tipToday: "เคล็ดลับวันนี้", moreTips: "ดูบทความทั้งหมด →", close: "ปิด" },
  en: { title: "Knowledge library", sub: "Short articles you can read in 2–3 minutes", all: "All",
    cat_basics: "Basics", cat_nutrition: "Nutrition", cat_recovery: "Recovery", cat_mind: "Motivation",
    mins: n => `${n} min read`, read: "Read", mythTitle: "Common fitness myths", mythSub: "Tap a card to see the truth",
    myth: "Myth", fact: "Fact", tipToday: "Tip of the day", moreTips: "See all articles →", close: "Close" }
};
const lt = () => LEARN_T[lang];

function articleBody(lines) {
  let html = "", list = false;
  for (const l of lines) {
    if (l.startsWith("- ")) { if (!list) { html += "<ul>"; list = true; } html += `<li>${esc(l.slice(2))}</li>`; continue; }
    if (list) { html += "</ul>"; list = false; }
    html += l.startsWith("## ") ? `<h4>${esc(l.slice(3))}</h4>` : `<p>${esc(l)}</p>`;
  }
  return html + (list ? "</ul>" : "");
}

/* ---------- Article reader (shared by home tip and library) ---------- */
function openArticle(id) {
  const a = ARTICLES.find(x => x.id === id); if (!a) return;
  const c = a[lang], tx = lt();
  let el = $("#reader");
  if (!el) {
    document.body.insertAdjacentHTML("beforeend", '<div class="reader-bg" id="reader" hidden><article class="reader" role="dialog" aria-modal="true"></article></div>');
    el = $("#reader");
    el.addEventListener("click", e => { if (e.target === el || e.target.closest("[data-rclose]")) closeArticle(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !el.hidden) closeArticle(); });
  }
  el.querySelector(".reader").innerHTML = `
    <div class="reader-hero"><div class="fig" data-fig="${a.fig}"></div>
      <button type="button" class="reader-x" data-rclose aria-label="${tx.close}">${icon("close")}</button></div>
    <div class="reader-in">
      <span class="ar-cat">${icon(LEARN_CAT_ICON[a.cat])}${tx["cat_" + a.cat]} · ${tx.mins(a.mins)}</span>
      <h2>${esc(c.t)}</h2><p class="reader-sub">${esc(c.s)}</p>
      <div class="reader-body">${articleBody(c.b)}</div>
    </div>`;
  el.hidden = false; document.body.classList.add("reader-open");
}
function closeArticle() { $("#reader").hidden = true; document.body.classList.remove("reader-open"); }

/* ---------- Library on more.html ---------- */
if ($("#libraryBox")) {
  let cat = "all";
  const draw = () => {
    const tx = lt();
    const chips = ["all", ...LEARN_CATS].map(k =>
      `<button type="button" data-lcat="${k}" class="${k === cat ? "on" : ""}">${k === "all" ? tx.all : icon(LEARN_CAT_ICON[k]) + tx["cat_" + k]}</button>`).join("");
    const cards = ARTICLES.filter(a => cat === "all" || a.cat === cat).map(a => `
      <button type="button" class="ar-card" data-art="${a.id}">
        <div class="fig" data-fig="${a.fig}"></div>
        <span class="ar-cat">${icon(LEARN_CAT_ICON[a.cat])}${tx["cat_" + a.cat]} · ${tx.mins(a.mins)}</span>
        <b>${esc(a[lang].t)}</b><small>${esc(a[lang].s)}</small>
        <span class="ar-go">${tx.read} →</span>
      </button>`).join("");
    $("#libraryBox").innerHTML = `
      <div class="sec-head"><h2>${tx.title}</h2><p>${tx.sub}</p></div>
      <div class="ex-filter lib-filter">${chips}</div>
      <div class="ar-grid">${cards}</div>`;
  };
  $("#libraryBox").addEventListener("click", e => {
    const c = e.target.closest("[data-lcat]"); if (c) { cat = c.dataset.lcat; draw(); return; }
    const a = e.target.closest("[data-art]"); if (a) openArticle(a.dataset.art);
  });
  onRender(draw);
}

/* ---------- Myths vs facts (flip cards) ---------- */
if ($("#myths")) {
  const draw = () => {
    const tx = lt();
    $("#myths").innerHTML = `
      <div class="sec-head"><h2>${tx.mythTitle}</h2><p>${tx.mythSub}</p></div>
      <div class="myth-grid">${MYTHS.map(m => `
        <button type="button" class="myth" aria-pressed="false">
          <span class="myth-face front"><small>✕ ${tx.myth}</small><b>${esc(m[lang][0])}</b></span>
          <span class="myth-face back"><small>✓ ${tx.fact}</small><span>${esc(m[lang][1])}</span></span>
        </button>`).join("")}</div>`;
  };
  $("#myths").addEventListener("click", e => {
    const m = e.target.closest(".myth"); if (!m) return;
    m.classList.toggle("flipped"); m.setAttribute("aria-pressed", m.classList.contains("flipped"));
  });
  onRender(draw);
}

/* ---------- Tip of the day (home) ---------- */
if ($("#tipToday")) {
  const day = Math.floor(Date.now() / 86400000);
  const a = ARTICLES[day % ARTICLES.length];
  onRender(() => {
    const tx = lt(), c = a[lang];
    const first = c.b.find(l => !l.startsWith("- ") && !l.startsWith("## ")) || c.s;
    $("#tipToday").innerHTML = `
      <div class="tip-today">
        <div class="tt-fig"><div class="fig" data-fig="${a.fig}"></div></div>
        <div class="tt-txt">
          <span class="ar-cat">${icon("sparkle")}${tx.tipToday} · ${tx["cat_" + a.cat]}</span>
          <h3>${esc(c.t)}</h3>
          <p>${esc(first.replace(/^- /, ""))}</p>
          <div class="btn-row"><button type="button" class="btn sm" data-art="${a.id}">${tx.read} →</button><a class="btn sm ghost" href="more.html#library">${tx.moreTips}</a></div>
        </div>
      </div>`;
  });
  $("#tipToday").addEventListener("click", e => { const b = e.target.closest("[data-art]"); if (b) openArticle(b.dataset.art); });
}
