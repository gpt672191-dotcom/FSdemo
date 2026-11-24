// แชทโค้ช: ผู้ช่วยตอบอัตโนมัติ (Rule-based chat coach)
// ตอบจากข้อมูลในเว็บ + ข้อมูลร่างกายของผู้ใช้ ไม่ได้เรียก AI จริง และไม่ส่งข้อมูลออกนอกเบราว์เซอร์
// ถ้าจะต่อ AI จริงในอนาคต: แทนที่ฟังก์ชัน reply() ด้วยการเรียก API ผ่านเซิร์ฟเวอร์กลาง (ห้ามใส่ API key ในไฟล์นี้)

const COACH_T = {
  th: {
    title: "โค้ช FitStart", sub: "ผู้ช่วยตอบอัตโนมัติ", open: "ปรึกษาโค้ช", placeholder: "พิมพ์คำถาม เช่น ลดพุงยังไงดี",
    note: "ตอบอัตโนมัติจากข้อมูลในเว็บ ไม่ใช่คำแนะนำทางการแพทย์", clear: "ล้างแชท",
    hello: n => `สวัสดีครับ${n ? " คุณ" + n : ""}! ผมเป็นโค้ชผู้ช่วยของ FitStart ถามเรื่องออกกำลังกาย อาหาร หรือท่าต่างๆ ได้เลยครับ`,
    chips: ["BMI ของฉัน", "ควรกินกี่แคลอรี่", "ลดพุงยังไง", "ท่าสร้างกล้ามอก", "เริ่มยังไงดี", "ออกกำลังกายที่บ้าน"],
    askBody: "บอกส่วนสูง (ซม.) และน้ำหนัก (กก.) มาได้เลยครับ เช่น \"170 65\" หรือสมัครสมาชิกแล้วกรอกข้อมูลไว้ ผมจะจำให้",
    bmi: (b, cat, lo, hi) => `BMI ของคุณคือ <b>${b}</b> อยู่ในเกณฑ์ <b>${cat}</b> (เกณฑ์คนเอเชีย)<br>น้ำหนักที่เหมาะกับส่วนสูงนี้คือ ${lo}–${hi} กก.`,
    kcal: (bmr, tdee, lose) => `ร่างกายคุณใช้พลังงานประมาณ <b>${tdee} kcal/วัน</b> (พลังงานพื้นฐาน ${bmr})<br>ถ้าอยากลดน้ำหนัก กินประมาณ <b>${lose} kcal/วัน</b> จะลดได้ราว 0.25–0.5 กก./สัปดาห์`,
    kcalNeed: "ต้องรู้เพศ อายุ ส่วนสูง น้ำหนักก่อนครับ กรอกในหน้าข้อมูลส่วนตัว หรือใช้เครื่องคำนวณในหน้าลดน้ำหนักได้เลย",
    protein: (lo, hi, w) => `สำหรับน้ำหนัก ${w} กก. ควรกินโปรตีนประมาณ <b>${lo}–${hi} กรัม/วัน</b> แบ่งกินทุกมื้อ เช่น อกไก่ ไข่ ปลา นม เต้าหู้`,
    proteinNeed: "บอกน้ำหนักตัวมาได้เลยครับ เช่น \"น้ำหนัก 60\" ผมจะคำนวณโปรตีนให้",
    lose: "ลดน้ำหนักให้ได้ผล ทำ 4 อย่างนี้ครับ<br>1. กินน้อยกว่าที่ใช้ประมาณ 300–500 kcal/วัน<br>2. ฝึกแรงต้าน 2–3 วัน/สัปดาห์ เพื่อรักษากล้าม<br>3. เดินให้ได้ 7,000–10,000 ก้าว/วัน<br>4. นอน 7–9 ชั่วโมง<br>ลดพุงเฉพาะจุดไม่ได้นะครับ ต้องลดไขมันทั้งตัว",
    muscle: "สร้างกล้ามให้ได้ผล:<br>1. ฝึกแรงต้าน 8–12 ครั้งต่อเซ็ต ครั้งสุดท้ายต้องรู้สึกหนัก<br>2. ฝึกแต่ละส่วน 2 ครั้ง/สัปดาห์<br>3. กินโปรตีน 1.6–2.2 กรัม ต่อน้ำหนักตัว 1 กก.<br>4. เพิ่มน้ำหนักหรือจำนวนครั้งทีละนิด",
    group: g => `ท่าแนะนำสำหรับ<b>${g}</b>ครับ (เริ่มจากท่าไม่ใช้อุปกรณ์):`,
    exInfo: (n, cue, ms, eq, dose) => `<b>${n}</b><br>วิธีทำ: ${cue}<br>กล้ามเนื้อที่ใช้: ${ms}<br>อุปกรณ์: ${eq} · ${dose}`,
    home: "ท่าที่ทำที่บ้านได้ ไม่ต้องใช้อุปกรณ์ครับ ลองสร้างแผนแบบ \"ไม่มีอุปกรณ์\" ได้ด้วย",
    start: "เริ่มแบบนี้ครับ:<br>1. เริ่ม 2–3 วัน/สัปดาห์ ครั้งละ 15–30 นาที<br>2. เน้นท่าถูกต้องก่อน ยังไม่ต้องหนัก<br>3. วอร์มอัพ 5 นาทีทุกครั้ง<br>4. ให้ AI จัดแผนให้ แล้วทำตามไปทีละสัปดาห์",
    busy: "เวลาน้อยก็ได้ผลครับ ลองวงจร 15 นาที: สควอท วิดพื้น เมาเทนไคลม์เบอร์ แพลงก์ ทำท่าละ 40 วินาที พัก 20 วินาที วน 3 รอบ",
    pain: "ถ้าเจ็บแปลบ บวม หรือปวดข้อ <b>ให้หยุดทันที</b> และพักครับ ถ้าไม่ดีขึ้นใน 2–3 วัน หรือปวดมาก ควรพบแพทย์<br>ส่วนอาการเมื่อย 1–3 วันหลังออกกำลังกายเป็นเรื่องปกติ",
    sleep: "พักผ่อนสำคัญมากครับ กล้ามเนื้อซ่อมแซมตอนพัก นอน 7–9 ชั่วโมง และดื่มน้ำประมาณ 30–35 มล. ต่อน้ำหนักตัว 1 กก. ต่อวัน",
    food: "กินให้ครบหมู่ เน้นโปรตีนทุกมื้อ ผักครึ่งจาน ข้าวหรือแป้งพอประมาณ ลดของทอด ของหวาน และน้ำหวานครับ",
    plan: "ให้ AI จัดตารางออกกำลังกายให้ได้เลยครับ เลือกเป้าหมาย วัน เวลา อุปกรณ์ แล้วกดสร้างแผน",
    thanks: "ยินดีครับ! สู้ๆ นะครับ มีอะไรถามได้ตลอด",
    fallback: "ขอโทษครับ ผมยังตอบเรื่องนี้ไม่ได้ ลองถามเรื่องเหล่านี้ดูนะครับ",
    linkMuscle: "หน้าสร้างกล้าม", linkLose: "หน้าลดน้ำหนัก", linkPlan: "สร้างแผน", linkBmi: "คำนวณ BMI", linkProfile: "ข้อมูลส่วนตัว", linkMore: "เคล็ดลับ",
    water: (g, l) => `ควรดื่มน้ำประมาณ <b>${g} แก้ว/วัน</b> (ราว ${l} ลิตร) วันที่ออกกำลังกายหรืออากาศร้อนเพิ่มอีก 1–2 แก้ว<br>บันทึกการดื่มน้ำได้ในหน้าแนะนำ`,
    waterNeed: "โดยทั่วไปควรดื่มน้ำประมาณ 30–35 มล. ต่อน้ำหนักตัว 1 กก. ต่อวัน เข้าสู่ระบบแล้วกรอกน้ำหนัก ผมจะคำนวณเป็นจำนวนแก้วให้",
    proteinTrack: "นับโปรตีนที่กินแต่ละวันได้ในหน้าแนะนำ (กดอาหารที่กิน ระบบรวมให้)",
    warm: "ทุกครั้งที่ใช้โหมดนำออกกำลังกาย จะมี <b>วอร์มอัพ 3 ท่า</b> ก่อนเริ่ม และ <b>คูลดาวน์ยืดเหยียด 3 ท่า</b> หลังจบให้อัตโนมัติ ช่วยลดโอกาสบาดเจ็บ<br>ถ้ารีบ กด \"ข้ามวอร์มอัพ\" ได้ แต่แนะนำให้ทำ",
    remind: "กด <b>\"เพิ่มลงปฏิทิน\"</b> ใต้แผนในหน้าสร้างแผน เลือกเวลา แล้วเปิดไฟล์ที่ได้ มือถือจะเตือนก่อนออกกำลังกาย 30 นาทีทุกวันที่ต้องฝึก",
    badges: "ดูความคืบหน้า วันต่อเนื่อง ปฏิทินการฝึก และ <b>เหรียญรางวัล 9 เหรียญ</b> ได้ในหน้าข้อมูลส่วนตัว ออกกำลังกายด้วยโหมดนำ ระบบจะบันทึกให้เอง",
    library: "ดูท่าทั้งหมด 55 ท่าได้ที่คลังท่าในหน้าสร้างกล้าม ค้นหาชื่อท่า หรือกรองตามส่วนของร่างกายและอุปกรณ์ได้",
    install: "ติดตั้งเว็บนี้เป็นแอปได้ครับ<br>Android: เมนู Chrome แล้วเลือก \"เพิ่มลงในหน้าจอหลัก\"<br>iPhone: ปุ่มแชร์ใน Safari แล้วเลือก \"เพิ่มไปยังหน้าจอโฮม\"<br>เปิดหน้าที่เคยดูได้แม้ไม่มีเน็ต",
    progressA: "ร่างกายต้องการความท้าทายเพิ่มทีละน้อยครับ แผนในเว็บเพิ่มให้อัตโนมัติ (สัปดาห์ละ +1 ครั้งต่อเซ็ต และ +5 วินาทีในท่าจับเวลา จนครบ 4 สัปดาห์)<br>ถ้ายังง่ายไป: กด \"เปลี่ยนท่า\" เป็นท่าที่ยากขึ้น ดูท่ายากขึ้นในหน้าต่างรายละเอียดท่า หรือสร้างแผนใหม่ระดับกลาง<br>หลังจบแต่ละครั้งตอบว่า \"ง่ายไป\" ระบบจะแนะนำเพิ่มระดับให้",
    linkForYou: "หน้าแนะนำ", linkLib: "คลังท่า", linkProgress: "ความคืบหน้า"
  },
  en: {
    title: "FitStart Coach", sub: "Automatic helper", open: "Ask the coach", placeholder: "Ask something, e.g. how to lose belly fat",
    note: "Automatic answers from this site. Not medical advice.", clear: "Clear chat",
    hello: n => `Hi${n ? " " + n : ""}! I'm FitStart's coach helper. Ask me about workouts, food or any exercise.`,
    chips: ["My BMI", "How many calories?", "Lose belly fat", "Chest exercises", "How do I start?", "Home workout"],
    askBody: "Tell me your height (cm) and weight (kg), e.g. \"170 65\". Or sign up and fill in your profile so I remember.",
    bmi: (b, cat, lo, hi) => `Your BMI is <b>${b}</b>, which is <b>${cat}</b> (Asian cut-offs).<br>A healthy weight for your height is ${lo}–${hi} kg.`,
    kcal: (bmr, tdee, lose) => `You burn about <b>${tdee} kcal/day</b> (base ${bmr}).<br>To lose weight, eat about <b>${lose} kcal/day</b> for roughly 0.25–0.5 kg per week.`,
    kcalNeed: "I need your sex, age, height and weight first. Fill in your profile, or use the calculator on the Lose weight page.",
    protein: (lo, hi, w) => `At ${w} kg, aim for about <b>${lo}–${hi} g of protein a day</b>, spread over your meals: chicken, eggs, fish, milk, tofu.`,
    proteinNeed: "Tell me your weight, e.g. \"weight 60\", and I'll work out your protein.",
    lose: "To lose weight, do these 4 things:<br>1. Eat 300–500 kcal/day less than you burn<br>2. Strength train 2–3 days/week to keep muscle<br>3. Walk 7,000–10,000 steps a day<br>4. Sleep 7–9 hours<br>You can't spot-reduce belly fat; you lose fat all over.",
    muscle: "To build muscle:<br>1. Lift for 8–12 reps per set, with the last rep hard<br>2. Train each muscle twice a week<br>3. Eat 1.6–2.2 g protein per kg of body weight<br>4. Add a little weight or reps over time",
    group: g => `Recommended <b>${g}</b> exercises (no-equipment ones first):`,
    exInfo: (n, cue, ms, eq, dose) => `<b>${n}</b><br>How: ${cue}<br>Muscles: ${ms}<br>Equipment: ${eq} · ${dose}`,
    home: "Here are moves you can do at home with no equipment. You can also build a no-equipment plan.",
    start: "Start like this:<br>1. 2–3 days a week, 15–30 minutes each<br>2. Focus on good form before going heavy<br>3. Warm up for 5 minutes every time<br>4. Let AI build your plan, then follow it week by week",
    busy: "Short on time? Try a 15-minute circuit: squat, push-up, mountain climbers, plank. 40 s on, 20 s rest, 3 rounds.",
    pain: "If you feel sharp pain, swelling or joint pain, <b>stop right away</b> and rest. If it isn't better in 2–3 days or it's severe, see a doctor.<br>Muscle soreness for 1–3 days after training is normal.",
    sleep: "Rest matters: muscles repair while you sleep. Get 7–9 hours, and drink about 30–35 ml of water per kg of body weight a day.",
    food: "Eat balanced meals: protein every meal, half a plate of veg, a moderate portion of rice or carbs, and less fried food, sweets and sugary drinks.",
    plan: "Let AI build your workout schedule: pick your goal, days, time and equipment, then press generate.",
    thanks: "You're welcome! Keep going, and ask me anytime.",
    fallback: "Sorry, I can't answer that yet. Try one of these:",
    linkMuscle: "Build muscle page", linkLose: "Lose weight page", linkPlan: "Build a plan", linkBmi: "BMI calculator", linkProfile: "My profile", linkMore: "Tips",
    water: (g, l) => `Aim for about <b>${g} glasses a day</b> (around ${l} L). Add 1–2 glasses on workout days or hot days.<br>You can log your water on the For you page.`,
    waterNeed: "A common guide is 30–35 ml of water per kg of body weight a day. Log in and add your weight, and I'll turn it into glasses.",
    proteinTrack: "You can count the protein you eat each day on the For you page (tap the foods, it adds them up).",
    warm: "Every guided workout now starts with a <b>3-move warm-up</b> and ends with a <b>3-move cool-down stretch</b>, to lower the risk of injury.<br>In a hurry? Tap \"Skip warm-up\", but it's worth doing.",
    remind: "Tap <b>\"Add to calendar\"</b> under your plan on the Build a plan page, pick a time, and open the file. Your phone will remind you 30 minutes before every training day.",
    badges: "Your progress, streak, training calendar and <b>9 badges</b> are on your profile page. Guided workouts are logged automatically.",
    library: "All 55 exercises are in the library on the Build muscle page. Search by name or filter by body part and equipment.",
    install: "You can install this site as an app.<br>Android: Chrome menu, then \"Add to Home screen\"<br>iPhone: Share button in Safari, then \"Add to Home Screen\"<br>Pages you've opened work offline too.",
    progressA: "Your body needs a little more challenge over time. Your plan here steps up automatically (+1 rep per set and +5 s on timed moves each week for 4 weeks).<br>Still too easy? Use \"Swap move\" to pick a harder one, check the harder version in the exercise window, or make an intermediate plan.<br>Answer \"Too easy\" after workouts and we'll suggest moving up.",
    linkForYou: "For you", linkLib: "Exercise library", linkProgress: "Progress"
  }
};
const ct = () => COACH_T[lang];

/* ---------------- The coach's "brain" ---------------- */
const KW = {
  pain: ["ปวด", "เจ็บ", "บาดเจ็บ", "บวม", "pain", "hurt", "injur", "sore"],
  hello: ["สวัสดี", "หวัดดี", "ดีครับ", "ดีค่ะ", "hello", "hi ", "hey"],
  thanks: ["ขอบคุณ", "ขอบใจ", "thank", "thx"],
  bmi: ["bmi", "บีเอ็มไอ", "ดัชนีมวล", "อ้วนไหม", "อ้วนมั้ย", "น้ำหนักเกิน"],
  kcal: ["แคล", "kcal", "calorie", "พลังงาน", "tdee", "bmr", "กินเท่าไหร่", "กินเท่าไร"],
  protein: ["โปรตีน", "protein", "เวย์", "whey"],
  lose: ["ลดน้ำหนัก", "ลดพุง", "ลดไขมัน", "น้ำหนักขึ้น", "อ้วน", "พุง", "lose", "fat", "belly", "slim", "weight gain"],
  muscle: ["สร้างกล้าม", "เพิ่มกล้าม", "กล้ามโต", "build muscle", "gain muscle", "bulk"],
  home: ["ที่บ้าน", "ไม่มีอุปกรณ์", "ไม่มีเครื่อง", "home", "no equipment", "bodyweight"],
  start: ["เริ่ม", "มือใหม่", "ไม่เคย", "start", "beginner", "new to"],
  busy: ["ไม่มีเวลา", "เวลาน้อย", "ยุ่ง", "busy", "no time", "quick"],
  water: ["ดื่มน้ำ", "กินน้ำ", "น้ำกี่", "น้ำวันละ", "water", "hydrat"],
  warm: ["วอร์ม", "อบอุ่นร่างกาย", "คูลดาวน์", "ยืดเหยียด", "stretch", "mobility", "warm up", "warm-up", "warmup", "cool down", "cool-down"],
  when: ["ตอนเช้า", "ตอนเย็น", "ตอนไหนดี", "เวลาไหนดี", "ช่วงไหนดี", "ก่อนนอน", "กลางคืน", "ตอนดึก", "what time", "when should i work out", "morning or evening", "best time", "at night"],
  eatwhen: ["กินก่อน", "กินหลัง", "ก่อนออกกำลัง", "หลังออกกำลัง", "ท้องว่าง", "ท้องว่าง", "eat before", "eat after", "before workout", "after workout", "empty stomach"],
  plateau: ["น้ำหนักไม่ลง", "น้ำหนักขึ้นลง", "ทำไมน้ำหนักขึ้น", "น้ำหนักขึ้นทั้งที่", "น้ำหนักนิ่ง", "ไม่ลดเลย", "not losing weight", "weight went up", "weight is up", "plateau", "scale won't move", "weight going down", "weight down", "not going down", "weight not", "not losing"],
  week: ["สรุปสัปดาห์", "สัปดาห์นี้เป็นยังไง", "สัปดาห์นี้ทำไปเท่าไหร่", "สรุปผล", "สรุปให้หน่อย", "weekly summary", "this week so far", "how did i do this week", "my week"],
  goalw: ["น้ำหนักเป้าหมาย", "เป้าหมายน้ำหนัก", "เป้าน้ำหนัก", "ถึงเป้า", "อีกนานไหม", "อีกนานแค่ไหน", "goal weight", "target weight", "reach my goal", "how long until"],
  today: ["วันนี้ทำอะไร", "วันนี้ต้องทำ", "วันนี้ออกกำลัง", "วันนี้เล่น", "วันนี้ฝึก", "ของวันนี้", "today"],
  remind: ["เตือน", "ปฏิทิน", "ลืม", "remind", "calendar", "forget"],
  badges: ["เหรียญ", "รางวัล", "ความคืบหน้า", "ต่อเนื่อง", "badge", "progress", "streak", "achievement"],
  progress: ["เพิ่มความหนัก", "ง่ายไป", "ไม่หนักแล้ว", "ไม่เหนื่อย", "ไม่เห็นผล", "ทำยังไงต่อ", "ขั้นต่อไป", "progress", "too easy", "plateau", "next step", "harder"],
  library: ["ท่าทั้งหมด", "คลังท่า", "ค้นหาท่า", "all exercise", "exercise list", "library"],
  install: ["ติดตั้ง", "แอป", "หน้าจอหลัก", "ออฟไลน์", "install", " app", "home screen", "offline"],
  sleep: ["นอน", "พักผ่อน", "sleep", "rest"],
  food: ["อาหาร", "กินอะไร", "เมนู", "food", "diet", "eat", "meal"],
  plan: ["แผน", "ตาราง", "plan", "schedule", "program"]
};
// More beginner questions (round 87): sore muscles, rest days, whey, gaining weight, no jumping, plan too hard, swapping, data, motivation
const KW2 = {
  doms: ["เมื่อย", "ระบม", "ปวดกล้ามเนื้อหลังออก", "ปวดกล้ามเนื้อวันแรก", "ปวดกล้ามเนื้อหลังเล่น", "doms", "sore muscles", "sore after", "muscles are sore"],
  rest: ["พักกี่วัน", "วันพัก", "ทุกวันได้ไหม", "ทุกวันได้มั้ย", "ออกทุกวัน", "rest day", "every day", "how many rest"],
  whey: ["เวย์จำเป็น", "ต้องกินเวย์", "เวย์ดีไหม", "need whey", "is whey"],
  gain: ["เพิ่มน้ำหนัก", "ผอม", "อยากอ้วน", "น้ำหนักน้อย", "gain weight", "too thin", "skinny", "underweight"],
  nojump: ["กระโดดไม่ได้", "ไม่กระโดด", "ไม่อยากกระโดด", "คอนโด", "เสียงดัง", "เพื่อนบ้าน", "no jump", "no jumping", "apartment", "neighbours", "neighbors"],
  hard: ["ยากไป", "หนักไป", "เหนื่อยเกินไป", "too hard", "too difficult", "can't keep up"],
  swap: ["เปลี่ยนท่า", "สลับท่า", "ไม่ชอบท่า", "swap", "change a move", "replace"],
  data: ["ย้ายข้อมูล", "เครื่องใหม่", "สำรองข้อมูล", "ลบบัญชี", "ลบข้อมูล", "export", "backup", "new phone", "delete my account", "delete account"],
  runvsweights: ["วิ่งหรือเวท", "เวทหรือวิ่ง", "คาร์ดิโอหรือเวท", "เวทหรือคาร์ดิโอ", "cardio or weights", "weights or cardio", "running or weights", "running better", "better than weights", "better than running", "run or lift", "lifting or running"],
  cardio: ["คาร์ดิโอคือ", "คาร์ดิโอคืออะไร", "what is cardio"],
  rice: ["ข้าวเหนียว", "กินข้าวได้ไหม", "งดข้าว", "งดแป้ง", "กินแป้ง", "sticky rice", "cut carbs", "no rice", "eat rice"],
  eggs: ["ไข่วันละ", "กินไข่กี่ฟอง", "ไข่กี่ฟอง", "eggs a day", "how many eggs"],
  short: ["10 นาทีพอ", "นาทีพอไหม", "นาทีพอมั้ย", "ทำแค่", "enough time", "is 10 minutes", "only 10 minutes", "15 minutes enough"],
  steps: ["ก้าวเดิน", "เดินวันละ", "กี่ก้าว", "steps a day", "how many steps"],
  condition: ["เบาหวาน", "ความดัน", "โรคหัวใจ", "หอบหืด", "ตั้งครรภ์", "ท้องอยู่", "diabetes", "blood pressure", "heart disease", "asthma", "pregnant"],
  device: ["มือถือได้ไหม", "ใช้ในมือถือ", "ใช้บนมือถือ", "แอปมือถือ", "on my phone", "use on phone", "mobile"],
  motivate: ["ท้อ", "ขี้เกียจ", "ไม่มีแรงจูงใจ", "เบื่อ", "ไม่อยากทำ", "lazy", "unmotivated", "motivation", "give up", "bored"]
};
const KW2_T = {
  th: {
    doms: "ปวดเมื่อยกล้ามเนื้อ 1–3 วันหลังออกกำลังกาย (โดยเฉพาะครั้งแรกๆ) เป็นเรื่องปกติครับ เรียกว่า DOMS แปลว่ากล้ามเนื้อกำลังปรับตัว<br>- ขยับเบาๆ เดิน ยืดเหยียด ช่วยให้หายเร็วกว่านอนนิ่งๆ<br>- นอนให้พอ ดื่มน้ำ กินโปรตีน<br>- ฝึกส่วนอื่นได้ หรือทำเบาลง<br>แต่ถ้า<b>เจ็บแปลบ ปวดที่ข้อ บวม หรือเกิน 5 วัน</b> ให้หยุดและปรึกษาแพทย์",
    rest: "มือใหม่ออกกำลังกาย 3–4 วันต่อสัปดาห์ แล้วพักวันเว้นวันก็พอครับ กล้ามเนื้อโตตอนพัก ส่วนเดินหรือยืดเหยียดเบาๆ ทำทุกวันได้ ถ้าอยากฝึกติดกันให้สลับส่วน เช่น ช่วงบนวันหนึ่ง ช่วงล่างอีกวัน (แผนในเว็บจัดวันพักให้แล้ว)",
    whey: "เวย์<b>ไม่จำเป็น</b>ครับ เป็นแค่อาหารโปรตีนแบบผงที่สะดวก ถ้ากินไข่ นม อกไก่ ปลา เต้าหู้ ได้ถึงเป้าโปรตีนต่อวันก็ไม่ต้องใช้ ลองนับโปรตีนที่หน้าแนะนำดูก่อนว่าขาดเท่าไหร่",
    gain: "อยากเพิ่มน้ำหนักให้เป็นกล้าม ไม่ใช่ไขมัน:<br>1. กินมากกว่าที่ใช้วันละ 300–500 kcal (เพิ่มมื้อว่าง เช่น นม กล้วย ถั่ว ข้าวเพิ่ม)<br>2. โปรตีน 1.6–2 กรัม/กก.<br>3. ฝึกสร้างกล้าม 3 วัน/สัปดาห์ ค่อยๆ เพิ่มความหนัก<br>4. นอน 7–9 ชั่วโมง<br>เพิ่มสัปดาห์ละ 0.25–0.5 กก. กำลังดี",
    nojump: "ไม่ต้องกระโดดก็เหนื่อยได้ครับ ใช้ท่าแบบไม่กระโดด เช่น สเต็ปแจ็ค ย่ำเท้ายกเข่า สควอท ลันจ์ช้าๆ เมาน์เทนไคลม์เบอร์ช้าๆ<br>- หน้าสร้างแผน: ติ๊ก \"ไม่กระโดด\" ระบบจะเลือกแต่ท่าที่ไม่กระโดด<br>- คลังท่า: กดตัวกรอง \"ไม่กระโดด\"",
    hard: "หนักไปไม่ใช่เรื่องแย่ครับ ปรับให้พอดีได้:<br>1. ลดจำนวนครั้ง/เซ็ต หรือพักนานขึ้น (+15 วิในโหมดนำ)<br>2. ใช้ท่าที่ง่ายลง (ในหน้ารายละเอียดท่ามี \"ท่าง่ายลง\")<br>3. สร้างแผนใหม่แบบ 15 นาที และไม่กระโดด<br>ร่างกายจะปรับตัวภายใน 2–3 สัปดาห์",
    swap: "ได้ครับ ในหน้าสร้างแผน เปิดการ์ดของวันนั้นแล้วกด \"เปลี่ยนท่า\" ข้างท่าที่ไม่ชอบ ระบบจะสลับเป็นท่าอื่นในกลุ่มเดียวกันที่ใช้อุปกรณ์ได้ และจำไว้กับแผนเลย",
    data: "ข้อมูลทั้งหมดเก็บในเบราว์เซอร์เครื่องนี้ครับ<br>- ย้ายเครื่อง: หน้าตั้งค่า > ดาวน์โหลดข้อมูล แล้วไปเครื่องใหม่ กด \"นำเข้าข้อมูล\"<br>- ลบข้อมูล/ลบบัญชี: หน้าตั้งค่า ส่วนท้ายสุด (ต้องกดยืนยัน)",
    runvsweights: "ทั้งคู่ดีครับ ใช้ร่วมกันดีที่สุด:<br>- <b>เวท/บอดี้เวท</b>: สร้างและรักษากล้ามเนื้อ ทำให้รูปร่างกระชับ เผาผลาญดีขึ้นในระยะยาว<br>- <b>วิ่ง/คาร์ดิโอ</b>: หัวใจปอดแข็งแรง เผาแคลอรี่ระหว่างทำมาก<br>มือใหม่: เวท 2–3 วัน + คาร์ดิโอเบาๆ 2–3 วัน/สัปดาห์ แผนในเว็บจัดให้แบบนี้อยู่แล้ว",
    cardio: "คาร์ดิโอคือการออกกำลังกายที่ทำให้หัวใจเต้นเร็วต่อเนื่อง เช่น เดินเร็ว วิ่ง ปั่นจักรยาน ว่ายน้ำ กระโดดเชือก หรือวงจรท่าต่อเนื่อง ช่วยหัวใจ ปอด และเผาพลังงาน<br>ความหนักที่พอดีสำหรับมือใหม่: <b>ยังพูดได้แต่ร้องเพลงไม่ได้</b> สัปดาห์ละ 150 นาที (เช่น วันละ 30 นาที 5 วัน)",
    rice: "กินข้าวได้ครับ ไม่ต้องงดแป้ง ที่สำคัญคือ<b>ปริมาณรวมทั้งวัน</b><br>- ข้าวสวย/ข้าวเหนียว มื้อละประมาณ 1 ทัพพี (ข้าวเหนียวพลังงานสูงกว่าเล็กน้อย ปั้นก้อนเท่ากำปั้นเล็ก)<br>- เพิ่มผักครึ่งจาน และโปรตีนทุกมื้อ จะอิ่มนาน<br>- ลดน้ำหวาน ขนม ของทอด ได้ผลกว่างดข้าว",
    eggs: "คนสุขภาพดีกินไข่ได้วันละ 1–2 ฟอง สบายๆ ครับ (ไข่ 1 ฟอง โปรตีนประมาณ 6 กรัม) ถ้ามีไขมันในเลือดสูงหรือเป็นเบาหวาน ให้กินไข่ขาวเพิ่มแทนไข่แดง หรือถามแพทย์ นับโปรตีนจากไข่ได้ที่ตัวนับในหน้าแนะนำ",
    short: "พอครับ! 10–15 นาทีที่ทำจริงดีกว่า 1 ชั่วโมงที่ไม่ได้ทำ เริ่มจากวงจรสั้นๆ (เช่น สควอท วิดพื้น แพลงก์ วนรอบ) ทำให้สม่ำเสมอ 3 วัน/สัปดาห์ แล้วค่อยเพิ่มเวลา สร้างแผนแบบ 15 นาทีได้ที่หน้าสร้างแผน",
    steps: "เป้าหมายที่ดีคือ 7,000–10,000 ก้าว/วัน แต่ถ้าตอนนี้เดินน้อย ให้เพิ่มทีละ 1,000–2,000 ก้าวจากเดิมก็ได้ผลแล้ว<br>เคล็ดลับ: เดินหลังอาหาร 10 นาที ขึ้นบันไดแทนลิฟต์ ลงรถก่อนถึง 1 ป้าย",
    condition: "ออกกำลังกายได้และมักช่วยให้ดีขึ้นครับ แต่ถ้ามีโรคประจำตัว (เบาหวาน ความดัน หัวใจ หอบหืด) หรือตั้งครรภ์ <b>ควรปรึกษาแพทย์ก่อนเริ่ม</b><br>- เริ่มเบาๆ เช่น เดินเร็ว ยืดเหยียด<br>- พกยา/ของหวาน (ถ้าเป็นเบาหวาน) ดื่มน้ำ<br>- หยุดทันทีถ้าเจ็บหน้าอก หน้ามืด หายใจไม่ทัน<br>ทำแบบเช็กความพร้อม (PAR-Q+) ในหน้าสร้างแผนก่อนได้",
    device: "ใช้ได้ครับ เว็บนี้ออกแบบให้ใช้บนมือถือ และติดตั้งเป็นแอปได้: บน Android กดเมนูเบราว์เซอร์ > เพิ่มลงหน้าจอหลัก, บน iPhone กดปุ่มแชร์ > เพิ่มไปยังหน้าจอโฮม เปิดได้แม้ไม่มีเน็ต",
    motivate: "รู้สึกท้อเป็นเรื่องปกติครับ ลองแบบนี้:<br>1. ลดเป้าให้เล็กมาก แค่ 10 นาที หรือ 1 ท่าก็นับ<br>2. ใส่เวลาออกกำลังกายลงปฏิทิน เหมือนนัดสำคัญ<br>3. ดูความคืบหน้า วันต่อเนื่อง และเหรียญรางวัล<br>4. ชวนเพื่อนทำด้วย<br>ความสม่ำเสมอสำคัญกว่าความหนัก ทำน้อยแต่ทำบ่อยชนะเสมอ"
  },
  en: {
    doms: "Sore muscles 1–3 days after a workout (especially at the start) are normal; it's called DOMS and means your muscles are adapting.<br>- Light movement, walking and stretching help more than resting still<br>- Sleep, water and protein<br>- Train other body parts or go lighter<br>But if it's <b>sharp, in a joint, swollen, or lasts over 5 days</b>, stop and see a doctor.",
    rest: "As a beginner, 3–4 workouts a week with a rest day in between is plenty; muscles grow while you rest. Easy walking or stretching is fine every day. To train on back-to-back days, alternate body parts (upper one day, lower the next). Your plan already includes rest days.",
    whey: "Whey is <b>not necessary</b>. It's just convenient powdered protein. If eggs, milk, chicken, fish or tofu get you to your daily protein goal, you don't need it. Count your protein on the For you page first.",
    gain: "To gain weight as muscle, not fat:<br>1. Eat 300–500 kcal more than you burn (add snacks like milk, bananas, nuts, more rice)<br>2. Protein 1.6–2 g per kg<br>3. Strength training 3 days a week, adding a little each week<br>4. Sleep 7–9 hours<br>0.25–0.5 kg a week is a good pace.",
    nojump: "You can get your heart rate up without jumping: step jacks, marching high knees, squats, slow lunges, slow mountain climbers.<br>- Build a plan: tick \"No jumping\" and only no-jump moves are picked<br>- Exercise library: use the \"No jumping\" filter",
    hard: "Too hard is easy to fix:<br>1. Fewer reps or longer rests (+15 s in workout mode)<br>2. Use the easier version (shown on each exercise's detail)<br>3. Make a new 15-minute, no-jump plan<br>Your body adapts in 2–3 weeks.",
    swap: "Yes. On the Build a plan page, open that day's card and tap \"Swap move\" next to the move you don't like. You get another move from the same group that fits your equipment, saved with the plan.",
    data: "All your data lives in this browser.<br>- New phone: Settings > Download my data, then on the new device tap \"Import data\"<br>- Delete data or account: at the bottom of Settings (asks you to confirm)",
    runvsweights: "Both are good, and together is best:<br>- <b>Weights/bodyweight</b>: build and keep muscle, look toned, burn more over time<br>- <b>Running/cardio</b>: heart and lungs, burns a lot while you do it<br>Beginners: strength 2–3 days + easy cardio 2–3 days a week. Your plan here already mixes them.",
    cardio: "Cardio is exercise that keeps your heart rate up for a while: brisk walking, running, cycling, swimming, skipping, or a non-stop circuit. It's good for your heart and lungs and burns energy.<br>Right effort for beginners: <b>you can talk but not sing</b>. Aim for 150 minutes a week (e.g. 30 minutes, 5 days).",
    rice: "You can eat rice; no need to cut carbs. What matters is the <b>total for the day</b>.<br>- About one scoop of rice or sticky rice per meal (sticky rice is a bit denser; a small fist-sized ball)<br>- Half a plate of vegetables and protein at every meal keep you full<br>- Cutting sweet drinks, snacks and fried food works better than cutting rice",
    eggs: "Healthy people can eat 1–2 eggs a day without worry (one egg has about 6 g of protein). If you have high blood fats or diabetes, add egg whites instead of yolks or ask your doctor. Count eggs in the protein tracker on the For you page.",
    short: "Yes! 10–15 minutes you actually do beats an hour you skip. Start with a short circuit (squats, push-ups, plank, repeat) 3 days a week, then add time. Make a 15-minute plan on the Build a plan page.",
    steps: "A good goal is 7,000–10,000 steps a day, but if you walk little now, adding 1,000–2,000 steps to your usual already helps.<br>Tips: walk 10 minutes after meals, take the stairs, get off one stop early.",
    condition: "Exercise is usually allowed and often helps, but with a health condition (diabetes, blood pressure, heart, asthma) or pregnancy <b>check with your doctor before starting</b>.<br>- Start gently: brisk walking, stretching<br>- Keep your medicine/a sweet snack (diabetes) and water nearby<br>- Stop at once for chest pain, dizziness or severe breathlessness<br>Do the readiness check (PAR-Q+) on the Build a plan page first.",
    device: "Yes. The site is made for phones and can be installed as an app: on Android, browser menu > Add to Home screen; on iPhone, Share > Add to Home Screen. It even opens without internet.",
    motivate: "Feeling unmotivated is normal. Try this:<br>1. Make the goal tiny: 10 minutes or one move counts<br>2. Put workouts in your calendar like an appointment<br>3. Look at your progress, streak and badges<br>4. Bring a friend<br>Consistency beats intensity: small and often always wins."
  }
};
const KW2_LINK = { runvsweights: "planner.html", cardio: "weight-loss.html", rice: "weight-loss.html", eggs: "for-you.html#fyProtein", short: "planner.html?time=15", steps: "for-you.html", condition: "planner.html", device: "more.html#faq", doms: "more.html#faq", rest: "planner.html#plan", whey: "for-you.html#fyProtein", gain: "planner.html?goal=muscle", nojump: "planner.html?impact=low", hard: "planner.html?time=15&impact=low", swap: "planner.html#plan", data: "settings.html", motivate: "profile.html#progress" };

const GROUP_KW = {
  chest: ["อก", "chest", "pec"], back: ["หลัง", "back", "lat"], shoulders: ["ไหล่", "shoulder", "delt"],
  arms: ["แขน", "arm", "bicep", "tricep", "ไบเซ็ป", "ไทรเซ็ป"], legs: ["ขา", "ต้นขา", "น่อง", "leg", "thigh", "calf"],
  glutes: ["ก้น", "สะโพก", "glute", "butt", "hip"], core: ["หน้าท้อง", "ซิกแพ็ก", "abs", "core", "six pack", "sixpack"]
};
const has = (m, list) => list.some(k => m.includes(k));

// Timing questions every beginner asks
const TIMING_T = {
  th: { when: "เวลาที่ดีที่สุดคือ<b>เวลาที่คุณทำได้สม่ำเสมอ</b>ครับ เช้าหรือเย็นได้ผลพอๆ กัน<br>- ตอนเช้า: ทำเสร็จแล้วไม่มีอะไรมาขัด เหมาะกับคนชอบตื่นเช้า วอร์มอัพให้นานขึ้นเพราะร่างกายยังตึง<br>- ตอนเย็น: ร่างกายอุ่นแล้ว ยกได้ดี<br>- ก่อนนอน: ได้ แต่ควรเลิกก่อนนอนอย่างน้อย 1–2 ชั่วโมง ถ้านอนไม่หลับให้เลื่อนให้เร็วขึ้นหรือเลือกยืดเหยียดเบาๆ แทน<br>ลองใส่เวลาลงปฏิทินในหน้าสร้างแผน จะช่วยให้ไม่ลืม",
        eat: "<b>ก่อนออกกำลังกาย</b>: ถ้ากินมื้อใหญ่ให้เว้น 2–3 ชั่วโมง หรือกินของว่างเบาๆ ก่อน 30–60 นาที เช่น กล้วย 1 ลูก ขนมปัง 1 แผ่น นม 1 กล่อง ถ้าท้องว่างแล้วไม่หน้ามืดก็ทำได้ แต่ถ้าวิงเวียนให้กินก่อนเสมอ<br><b>หลังออกกำลังกาย</b>: ดื่มน้ำ แล้วกินมื้อปกติที่มีโปรตีน (ไข่ อกไก่ นม เต้าหู้) ภายใน 1–2 ชั่วโมง ไม่ต้องรีบภายใน 30 นาทีก็ได้ สำคัญที่โปรตีนรวมทั้งวันมากกว่า" },
  en: { when: "The best time is <b>the time you can stick to</b>. Morning and evening work about the same.<br>- Morning: done before the day gets busy; warm up a bit longer because you're stiffer.<br>- Evening: your body is already warm, lifts often feel stronger.<br>- Before bed: fine, but finish 1–2 hours before sleep. If it keeps you awake, move it earlier or do gentle stretching instead.<br>Add your workout times to your calendar on the Build a plan page so you don't forget.",
        eat: "<b>Before</b>: after a big meal wait 2–3 hours, or have a small snack 30–60 minutes before (a banana, a slice of bread, a carton of milk). Training on an empty stomach is fine if you feel OK; if you get dizzy, always eat first.<br><b>After</b>: drink water, then have a normal meal with protein (eggs, chicken, milk, tofu) within 1–2 hours. No need to rush within 30 minutes; your total protein for the day matters more." }
};

// "Why isn't my weight going down?": daily swings are normal; look at the weekly average; what to check
function plateauAnswer(u) {
  const th = lang === "th", ws = (u && u.weights) || [];
  const dayN = d => Math.floor(new Date(d + "T00:00:00") / 864e5), n = new Date(), today = dayN(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`);
  const avg = (a, b) => { const xs = ws.filter(x => { const k = today - dayN(x.d); return k >= a && k < b; }).map(x => +x.w); return xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : null; };
  const now = avg(0, 7), before = avg(7, 14);
  let mine = "";
  if (now !== null && before !== null) {
    const d = now - before;
    mine = th ? `<br><br>ข้อมูลของคุณ: เฉลี่ย 7 วันล่าสุด ${now.toFixed(1)} กก. เทียบสัปดาห์ก่อน ${before.toFixed(1)} กก. (${d > 0 ? "+" : ""}${d.toFixed(1)}) ${d <= 0 ? "แนวโน้มลดลงอยู่แล้ว ทำต่อไปครับ" : "ขึ้นเล็กน้อย ลองเช็กข้อด้านบน"}`
      : `<br><br>Your data: last 7 days average ${now.toFixed(1)} kg vs ${before.toFixed(1)} kg the week before (${d > 0 ? "+" : ""}${d.toFixed(1)}). ${d <= 0 ? "The trend is already going down, keep going." : "A small rise; check the list above."}`;
  }
  const text = th
    ? `น้ำหนักขึ้นลงวันละ 0.5–1 กก. เป็นเรื่องปกติครับ (น้ำ เกลือ อาหารที่ยังอยู่ในท้อง และช่วงแรกที่เริ่มออกกำลังกายกล้ามเนื้อจะเก็บน้ำเพิ่ม) ให้ดู<b>ค่าเฉลี่ยรายสัปดาห์</b>แทนตัวเลขรายวัน<br><br>ถ้าเฉลี่ยไม่ลง 2–3 สัปดาห์ ลองเช็ก:<br>1. กินเกินโดยไม่รู้ตัว (น้ำหวาน ขนม ของทอด)<br>2. นอนน้อยกว่า 7 ชั่วโมง<br>3. เดินน้อย ลองเพิ่มก้าวเดินวันละ 2,000 ก้าว<br>4. ดูรอบเอวด้วย บางทีเอวลดแม้น้ำหนักนิ่ง${mine}`
    : `Weight moving 0.5–1 kg a day is normal (water, salt, food in your gut, and new exercisers' muscles hold extra water). Watch the <b>weekly average</b>, not single days.<br><br>If the average hasn't dropped for 2–3 weeks, check:<br>1. Hidden extra food (sweet drinks, snacks, fried food)<br>2. Sleep under 7 hours<br>3. Low daily steps; add about 2,000 a day<br>4. Your waist; it can shrink while the scale stays still${mine}`;
  return { text, links: [{ href: "profile.html#progress", label: th ? "ดูกราฟน้ำหนัก" : "See my weight chart" }] };
}

// "How was my week?": workouts, minutes, kcal, water and protein since Monday
function weekAnswer(u) {
  const th = lang === "th";
  if (!u) return { text: th ? "ล็อกอินก่อนนะครับ ผมจะสรุปการออกกำลังกาย น้ำ และโปรตีนของสัปดาห์นี้ให้" : "Log in first and I'll sum up your workouts, water and protein this week." };
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const days = []; for (const d = new Date(mon); d <= new Date(); d.setDate(d.getDate() + 1)) days.push(key(d));
  const log = (u.log || []).filter(x => x.d >= days[0]);
  const wDays = new Set(log.map(x => x.d)).size, mins = log.reduce((a, x) => a + (+x.mins || 0), 0), kcal = log.reduce((a, x) => a + (+x.kcal || 0), 0);
  const water = days.map(d => (u.water || {})[d] || 0).filter(Boolean);
  const pr = days.map(d => { const day = (u.protein || {})[d] || {}; return FOODS.reduce((a, f) => a + f.g * (day[f.id] || 0), 0); }).filter(Boolean);
  const avg = a => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  const lines = th ? [
    `<b>สรุปสัปดาห์นี้</b> (ตั้งแต่วันจันทร์ ${days.length} วัน)`,
    wDays ? `ออกกำลังกาย ${wDays} วัน รวม ${mins} นาที${kcal ? ` เผาผลาญประมาณ ${kcal} kcal` : ""}` : "ยังไม่ได้ออกกำลังกายเลย เริ่มวันนี้ 10 นาทีก็ยังดีครับ",
    water.length ? `บันทึกน้ำ ${water.length} วัน เฉลี่ย ${avg(water)} แก้ว/วัน` : "ยังไม่ได้บันทึกน้ำดื่ม",
    pr.length ? `บันทึกโปรตีน ${pr.length} วัน เฉลี่ย ${avg(pr)} กรัม/วัน` : "",
    wDays >= 3 ? "ทำได้ดีมาก รักษาจังหวะนี้ไว้" : wDays ? "ดีแล้ว ลองเพิ่มอีก 1 วันให้ถึง 3 วัน/สัปดาห์" : ""
  ] : [
    `<b>Your week so far</b> (${days.length} day${days.length > 1 ? "s" : ""} since Monday)`,
    wDays ? `Worked out ${wDays} day${wDays > 1 ? "s" : ""}, ${mins} min in total${kcal ? `, about ${kcal} kcal` : ""}` : "No workouts yet. Even 10 minutes today is a good start.",
    water.length ? `Water logged ${water.length} day${water.length > 1 ? "s" : ""}, ${avg(water)} glasses a day on average` : "No water logged yet",
    pr.length ? `Protein logged ${pr.length} day${pr.length > 1 ? "s" : ""}, ${avg(pr)} g a day on average` : "",
    wDays >= 3 ? "Great work, keep this rhythm." : wDays ? "Nice. Try one more day to reach 3 a week." : ""
  ];
  return { text: lines.filter(Boolean).join("<br>"), links: [{ href: "profile.html#progress", label: th ? "ดูความคืบหน้า" : "See my progress" }] };
}

// Goal weight (set on the profile page): how far, and how long at a safe pace
const GOALW_T = {
  th: { none: (r) => `ยังไม่ได้ตั้งน้ำหนักเป้าหมายครับ ${r ? `น้ำหนักที่ดีต่อสุขภาพสำหรับส่วนสูงของคุณคือ <b>${r[0]}–${r[1]} กก.</b> ` : ""}เริ่มจากเป้าเล็กๆ ลด 5% ก่อนก็เห็นผลแล้ว ตั้งเป้าได้ที่หน้าข้อมูลส่วนตัว ส่วนน้ำหนัก`,
        left: (cur, g, kg, w1, w2) => `ตอนนี้ ${cur} กก. เป้าหมาย ${g} กก. เหลืออีก <b>${kg.toFixed(1)} กก.</b> ถ้าไปอย่างปลอดภัย (สัปดาห์ละ 0.25–0.5 กก.) ใช้เวลาประมาณ <b>${w1}–${w2} สัปดาห์</b> ค่อยเป็นค่อยไปจะไม่เด้งกลับครับ`,
        reached: (g) => `คุณถึงเป้า ${g} กก. แล้วครับ เก่งมาก ต่อไปลองรักษาน้ำหนักนี้ไว้ หรือตั้งเป้าใหม่ เช่น ทำท่าให้ได้มากขึ้น`,
        link: "ตั้ง/ดูเป้าหมาย" },
  en: { none: (r) => `You haven't set a goal weight yet. ${r ? `A healthy weight for your height is <b>${r[0]}–${r[1]} kg</b>. ` : ""}Start small: losing 5% already helps. Set a goal on your Profile page, in the weight section.`,
        left: (cur, g, kg, w1, w2) => `You're at ${cur} kg and your goal is ${g} kg: <b>${kg.toFixed(1)} kg</b> to go. At a safe pace (0.25–0.5 kg a week) that's about <b>${w1}–${w2} weeks</b>. Slow and steady keeps it off.`,
        reached: (g) => `You've reached your ${g} kg goal. Great job! Now keep it there, or set a new goal like doing more reps.`,
        link: "Set or see my goal" }
};
function goalWAnswer(u) {
  const tx = GOALW_T[lang], links = [{ href: "profile.html#progress", label: tx.link }];
  const pr = u && u.profile, h = pr && pr.height, m = h / 100;
  if (!u || !u.goalW) return { text: tx.none(h ? [(18.5 * m * m).toFixed(1), (22.9 * m * m).toFixed(1)] : null), links };
  const ws = u.weights || [], cur = ws.length ? ws[ws.length - 1].w : pr && pr.weight;
  if (!cur) return { text: tx.none(null), links };
  const start = ws.length ? ws[0].w : cur, g = u.goalW, left = g < start ? cur - g : g - cur;
  if (left <= 0.05) return { text: tx.reached(g), links };
  return { text: tx.left(cur, g, left, Math.ceil(left / 0.5), Math.ceil(left / 0.25)), links };
}

// "What's my workout today?": read the current plan (same schedule as the planner and the home strip)
const TODAY_T = {
  th: { work: (d, m, n) => `วันนี้เป็นวันออกกำลังกายครับ: <b>${d}</b> ประมาณ ${m} นาที ${n} ท่า เริ่มด้วยวอร์มอัพสั้นๆ แล้วทำตามโหมดนำได้เลย`,
        rest: "วันนี้เป็น<b>วันพัก</b>ครับ ให้กล้ามเนื้อได้ซ่อมแซม เดินเบาๆ หรือยืดเหยียด 5-10 นาทีก็พอ",
        done: m => `วันนี้คุณออกกำลังกายไปแล้ว ${m} นาที เก่งมากครับ ดื่มน้ำ พักผ่อนให้พอ แล้วเจอกันรอบหน้า`,
        none: "ยังไม่มีแผนครับ ตอบคำถาม 6 ข้อในหน้าสร้างแผน ใช้เวลาไม่ถึงนาที แล้วผมจะบอกได้ว่าวันไหนทำอะไร",
        go: "เปิดแผนของวันนี้", plan: "ดูแผน" },
  en: { work: (d, m, n) => `Today is a workout day: <b>${d}</b>, about ${m} min, ${n} moves. Start with a short warm-up, then follow the guided workout.`,
        rest: "Today is a <b>rest day</b>. Let your muscles recover: an easy walk or 5-10 minutes of stretching is plenty.",
        done: m => `You already worked out ${m} min today. Great job! Drink water, rest well, and see you next time.`,
        none: "You don't have a plan yet. Answer 6 quick questions on the Build a plan page and I can tell you what to do each day.",
        go: "Open today's plan", plan: "See plan" }
};
function todayAnswer(u) {
  const tx = TODAY_T[lang], plan = store.get("fs-plan", null);
  if (!plan || !plan.answers || !SCHEDULE[plan.answers.days]) return { text: tx.none, links: [{ href: "planner.html", label: tx.plan }] };
  const n = new Date(), k = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  const mins = u && u.log ? u.log.filter(x => x.d === k).reduce((a, x) => a + (+x.mins || 0), 0) : 0;
  if (mins) return { text: tx.done(mins), links: [{ href: "planner.html#plan", label: tx.plan }] };
  const a = plan.answers, wd = (new Date().getDay() + 6) % 7, i = SCHEDULE[a.days].indexOf(wd);
  if (i < 0) return { text: tx.rest, ex: ["catcow", "hamstring", "child"], links: [{ href: "planner.html#plan", label: tx.plan }] };
  const tpl = TEMPLATES[a.goal][i % TEMPLATES[a.goal].length];
  return { text: tx.work(t().dayType[tpl.type], a.time, COUNT[a.time]), links: [{ href: `planner.html?day=${i}#plan`, label: tx.go }] };
}

// Remember what we last asked, so "170 65" after "BMI?" is understood
let coachWaiting = null;

// Body numbers written in a question: "อายุ 20 สูง 170 หนัก 65 หญิง" / "20 years 170 cm 65 kg female"
function bodyTyped(m, nums) {
  const pick = re => { const x = m.match(re); return x ? +x[1] : NaN; };
  let age = pick(/(?:อายุ|age)\s*(\d{2})/) || pick(/(\d{2})\s*(?:ปี|years?|yrs?)/);
  const height = pick(/(?:สูง|height)\s*(\d{3})/) || pick(/(\d{3})\s*(?:ซม|cm)/);
  const weight = pick(/(?:หนัก|น้ำหนัก|weight)\s*(\d{2,3}(?:\.\d)?)/) || pick(/(\d{2,3}(?:\.\d)?)\s*(?:กก|กิโล|kg)/);
  if (!(age >= 13 && age <= 90 && height >= 100 && height <= 230 && weight >= 25 && weight <= 250)) return null;
  const female = /หญิง|ผู้หญิง|female|woman|girl/.test(m), male = /ชาย|ผู้ชาย|male|man|boy/.test(m.replace(/female|woman/g, ""));
  return { age, height, weight, sex: female ? "f" : "m", guessSex: !female && !male };
}

function bodyFrom(u) { return u && hasBody(u.profile) ? u.profile : null; }

function exCard(ids) { return ids.slice(0, 4); }

// Suggestion chips: logged-in users see their daily questions first; guests see how to start
function coachChips() {
  const u = currentUser(), th = lang === "th";
  if (!u) return ct().chips;
  const mine = th ? ["วันนี้ต้องทำอะไร", "สรุปสัปดาห์นี้", "อีกนานไหมจะถึงเป้า", "ทำไมน้ำหนักไม่ลง"] : ["What's my workout today?", "How did I do this week?", "How long until my goal weight?", "Why isn't my weight going down?"];
  return [...mine, ...ct().chips.slice(0, 3)];
}

function reply(raw) {
  const tx = ct(), m = " " + raw.toLowerCase().trim() + " ";
  const u = currentUser(), p = bodyFrom(u);
  const nums = (raw.match(/\d+(\.\d+)?/g) || []).map(Number);
  const links = (...ls) => ls.map(([href, label]) => ({ href, label }));

  // Numbers after we asked for height/weight
  if (coachWaiting === "bmi" && nums.length >= 2) {
    coachWaiting = null;
    let h = nums.find(n => n >= 100 && n <= 230), w = nums.find(n => n !== h && n >= 25 && n <= 250);
    if (h && w) return bmiAnswer(h, w);
  }
  if (coachWaiting === "protein" && nums.length) {
    coachWaiting = null;
    const w = nums.find(n => n >= 25 && n <= 250);
    if (w) return proteinAnswer(w);
  }

  // sore-after-training questions come before the general pain answer (which says stop)
  if (has(m, KW2.doms)) return { text: KW2_T[lang].doms, links: [{ href: KW2_LINK.doms, label: tx.linkMore }] };
  if (has(m, KW2.condition)) return { text: KW2_T[lang].condition, links: [{ href: KW2_LINK.condition, label: lang === "th" ? "เช็กความพร้อม" : "Readiness check" }] };
  if (has(m, KW.pain)) return { text: tx.pain, links: links(["more.html#faq", tx.linkMore]) };
  if (has(m, KW.thanks)) return { text: tx.thanks };
  for (const k of ["whey", "gain", "nojump", "hard", "swap", "data", "rest", "motivate", "runvsweights", "cardio", "rice", "eggs", "short", "steps", "device"])
    if (has(m, KW2[k])) return { text: KW2_T[lang][k], links: [{ href: KW2_LINK[k], label: lang === "th" ? "ไปที่หน้านี้" : "Open this page" }] };
  if (has(m, KW.bmi)) {
    // numbers typed in the question ("bmi 170 65") win over the saved profile
    const h = nums.find(n => n >= 100 && n <= 230), w = nums.find(n => n !== h && n >= 25 && n <= 250);
    if (h && w) return bmiAnswer(h, w);
    if (p) return bmiAnswer(p.height, p.weight);
    coachWaiting = "bmi";
    return { text: tx.askBody, links: links(["bmi.html", tx.linkBmi]) };
  }
  // Protein before calories: "โปรตีนควรกินเท่าไหร่" also contains the calorie phrase "กินเท่าไหร่"
  if (has(m, KW.protein)) {
    const w = nums.find(n => n >= 25 && n <= 250);
    if (w) return proteinAnswer(w); // "protein for 80 kg" uses 80, not the profile weight
    if (p) return proteinAnswer(p.weight);
    coachWaiting = "protein";
    return { text: tx.proteinNeed };
  }
  if (has(m, KW.kcal)) {
    // body numbers typed in the question ("อายุ 20 สูง 170 หนัก 65 ผู้ชาย") win over the profile
    const typed = bodyTyped(m, nums);
    const b = typed || p;
    if (!b) return { text: tx.kcalNeed, links: links(["weight-loss.html", tx.linkLose], ["profile.html", tx.linkProfile]) };
    const bmr = health.bmr(b.weight, b.height, b.age, b.sex), tdee = bmr * ACT_FACTORS[((typed ? 1 : b.activity) || 1) - 1];
    return { text: tx.kcal(round10(bmr), round10(tdee), round10(Math.max(health.minKcal(b.sex), tdee - 500))) + (typed && typed.guessSex ? (lang === "th" ? "<br>(คิดแบบผู้ชาย ถ้าเป็นผู้หญิงพิมพ์ \"หญิง\" เพิ่ม)" : "<br>(Calculated as male; add \"female\" if needed.)") : ""), links: links(["for-you.html", t().navForYou]) };
  }
  if (has(m, KW.water)) {
    if (p) { const g = Math.min(16, Math.max(6, Math.round(p.weight * 33 / 250))); return { text: tx.water(g, (p.weight * 0.033).toFixed(1)), links: links(["for-you.html#fyWater", tx.linkForYou]) }; }
    return { text: tx.waterNeed, links: links(["profile.html", tx.linkProfile]) };
  }
  if (has(m, KW.warm)) return { text: tx.warm, ex: ["march", "wgs", "hamstring", "child"], links: links(["planner.html", tx.linkPlan]) };
  if (has(m, KW.eatwhen)) return { text: TIMING_T[lang].eat, links: links(["for-you.html#fyProtein", tx.linkForYou]) };
  if (has(m, KW.when)) return { text: TIMING_T[lang].when, links: links(["planner.html#plan", tx.linkPlan]) };
  if (has(m, KW.plateau)) return plateauAnswer(u);
  if (has(m, KW.week)) return weekAnswer(u);
  if (has(m, KW.goalw)) return goalWAnswer(u);
  if (has(m, KW.today)) return todayAnswer(u);
  if (has(m, KW.remind)) return { text: tx.remind, links: links(["planner.html#plan", tx.linkPlan]) };
  if (has(m, KW.badges)) return { text: tx.badges, links: links(["profile.html#progress", tx.linkProgress]) };
  if (has(m, KW.progress)) return { text: tx.progressA, links: links(["planner.html#plan", tx.linkPlan], ["muscle.html#allex", tx.linkLib]) };
  if (has(m, KW.library)) return { text: tx.library, links: links(["muscle.html#allex", tx.linkLib]) };
  if (has(m, KW.install)) return { text: tx.install };

  // A specific exercise by name (longest match wins)
  // short names people actually type ("lunges", "push up", "deadlift") count too
  const ALIAS = { lunge: ["lunge", "ลันจ์"], pushup: ["push up", "pushup", "push-up"], pullup: ["pull up", "pullup", "chin up", "ดึงข้อ"], rdl: ["deadlift", "เดดลิฟต์"],
    dbrow: ["dumbbell row"], climber: ["mountain climber"], jj: ["jumping jack"], hipthrust: ["hip thrust"], burpee: ["burpee"], crunch: ["crunch"], wallsit: ["wall sit"], legraise: ["leg raise"] };
  const hit = EX.map(e => {
    const names = [e.th.split(" (")[0], e.en, ...(ALIAS[e.id] || [])].map(s => s.toLowerCase());
    const n = names.find(s => s.length > 2 && m.includes(s));
    return n ? { e, len: n.length } : null;
  }).filter(Boolean).sort((a, b) => b.len - a.len)[0];
  if (hit) {
    const e = hit.e, T0 = t();
    const ms = (MUSCLES[e.id] || []).map(g => T0[`mg_${g}`]).join(", ") || T0[`part_${e.cat}`];
    const dose = e.timed ? T0.mgDoseTimed : T0.mgDose;
    return { text: tx.exInfo(e[lang], lang === "th" ? e.cth : e.cen, ms, T0[`equip_${e.eq}`], dose), ex: [e.id] };
  }

  if (has(m, KW.lose)) return { text: tx.lose, links: links(["weight-loss.html", tx.linkLose], ["planner.html?goal=lose", tx.linkPlan]) };

  // A muscle group
  // "อก" (chest) also sits inside "ออก" (ออกกำลังกาย = exercise) and "หลัง" (back) inside "หลังจาก" (after): drop those words first
  const mg = m.replace(/ออก|หลังจาก|หลังออก/g, " ");
  const g = Object.keys(GROUP_KW).find(k => has(mg, GROUP_KW[k]));
  if (g) {
    const list = EX.filter(e => (MUSCLES[e.id] || [])[0] === g).sort((a, b) => (a.eq === "none" ? 0 : 1) - (b.eq === "none" ? 0 : 1));
    return { text: tx.group(t()[`mg_${g}`]), ex: exCard(list.map(e => e.id)), links: links([`muscle.html#${g}`, tx.linkMuscle]) };
  }
  if (has(m, KW.muscle)) return { text: tx.muscle, links: links(["muscle.html", tx.linkMuscle], ["planner.html?goal=muscle", tx.linkPlan]) };
  if (has(m, KW.home)) return { text: tx.home, ex: ["squat", "pushup", "bridge", "plank"], links: links(["planner.html?equip=none", tx.linkPlan]) };
  if (has(m, KW.busy)) return { text: tx.busy, ex: ["squat", "pushup", "climber", "plank"] };
  if (has(m, KW.start)) return { text: tx.start, links: links(["planner.html", tx.linkPlan]) };
  if (has(m, KW.food)) return { text: tx.food, links: links(["weight-loss.html", tx.linkLose]) };
  if (has(m, KW.sleep)) return { text: tx.sleep };
  if (has(m, KW.plan)) return { text: tx.plan, links: links(["planner.html", tx.linkPlan]) };
  if (has(m, KW.hello)) return { text: tx.hello(u && u.name), chips: coachChips() };
  // Just height and weight ("ผมสูง 170 หนัก 65", "175 cm 80 kg", "170 65"): answer with BMI
  {
    const h = nums.find(n => n >= 100 && n <= 230), w = nums.find(n => n !== h && n >= 25 && n <= 250);
    if (h && w && nums.length <= 3) return bmiAnswer(h, w);
  }
  return { text: tx.fallback, chips: coachChips() };

  function bmiAnswer(h, w) {
    const b = health.bmi(w, h), [lo, hi] = health.ideal(h).map(x => x.toFixed(1));
    const age = p && +p.age, teen = age && age < 18
      ? (lang === "th" ? `<br><br>หมายเหตุ: คุณอายุ ${age} ปี เกณฑ์นี้เป็นของผู้ใหญ่ วัยรุ่นต้องดู BMI เทียบกับอายุ ใช้เป็นแนวทางคร่าวๆ และอย่าอดอาหารนะครับ` : `<br><br>Note: you're ${age}. These cut-offs are for adults; teens should use BMI-for-age charts. Treat this as a rough guide and don't crash diet.`) : "";
    return { text: tx.bmi(b.toFixed(1), t().bmiCat[health.bmiIdx(b)], lo, hi) + teen, links: links(["for-you.html", t().navForYou]) };
  }
  function proteinAnswer(w) {
    return { text: tx.protein(Math.round(w * 1.6), Math.round(w * 2.2), w) + "<br>" + tx.proteinTrack, links: links(["for-you.html#fyProtein", tx.linkForYou], ["muscle.html", tx.linkMuscle]) };
  }
}

/* ---------------- Chat window ---------------- */
document.body.insertAdjacentHTML("beforeend", `
<button type="button" class="coach-fab" id="coachFab" aria-controls="coachPanel" aria-expanded="false">
  ${icon("chat")}<span id="coachFabTxt"></span>
</button>
<section class="coach" id="coachPanel" hidden aria-label="Chat">
  <div class="coach-head">
    <img src="img/logo.svg" alt="" width="36" height="36">
    <div class="coach-who"><b id="coachTitle"></b><small><i class="coach-dot"></i><span id="coachSub"></span></small></div>
    <button type="button" class="coach-x" id="coachClear" title="">${icon("refresh")}</button>
    <button type="button" class="coach-x" id="coachClose" aria-label="Close">${icon("close")}</button>
  </div>
  <div class="coach-log" id="coachLog" aria-live="polite"></div>
  <div class="coach-chips" id="coachChips"></div>
  <form class="coach-input" id="coachForm" autocomplete="off">
    <input id="coachIn" type="text" maxlength="200">
    <button type="submit" class="coach-send" aria-label="Send">${icon("send")}</button>
  </form>
  <p class="coach-note" id="coachNote"></p>
</section>`);

const coachLog = $("#coachLog");
let coachHistory = (() => { try { return JSON.parse(sessionStorage.getItem("fs-coach") || "[]"); } catch { return []; } })();
const saveHistory = () => { try { sessionStorage.setItem("fs-coach", JSON.stringify(coachHistory.slice(-40))); } catch {} };

function bubbleHTML(msg) {
  if (msg.who === "me") return `<div class="cm me">${esc(msg.text)}</div>`;
  const r = msg.r;
  const ex = (r.ex || []).map(id => {
    const e = EX.find(x => x.id === id);
    return e ? `<div class="cm-ex"><div class="fig" data-fig="${e.id}"></div><span>${e[lang]}</span></div>` : "";
  }).join("");
  const links = (r.links || []).map(l => `<a class="cm-link" href="${l.href}">${l.label} →</a>`).join("");
  return `<div class="cm bot"><div>${r.text}</div>${ex ? `<div class="cm-exs">${ex}</div>` : ""}${links ? `<div class="cm-links">${links}</div>` : ""}</div>`;
}

function drawLog() {
  coachLog.innerHTML = coachHistory.map(bubbleHTML).join("");
  coachLog.scrollTop = coachLog.scrollHeight;
  const last = [...coachHistory].reverse().find(x => x.who === "bot");
  const chips = (last && last.r.chips) || coachChips();
  $("#coachChips").innerHTML = chips.map(c => `<button type="button" class="coach-chip">${esc(c)}</button>`).join("");
}

function greet() {
  const u = currentUser();
  coachHistory = [{ who: "bot", r: { text: ct().hello(u && u.name), chips: coachChips() } }];
  saveHistory(); drawLog();
}

function ask(text) {
  text = text.trim();
  if (!text) return;
  coachHistory.push({ who: "me", text });
  drawLog();
  coachLog.insertAdjacentHTML("beforeend", '<div class="cm bot typing"><span></span><span></span><span></span></div>');
  coachLog.scrollTop = coachLog.scrollHeight;
  setTimeout(() => {
    coachHistory.push({ who: "bot", r: reply(text) });
    saveHistory(); drawLog();
  }, 550);
}

function setOpen(open) {
  $("#coachPanel").hidden = !open;
  $("#coachFab").setAttribute("aria-expanded", open);
  document.body.classList.toggle("coach-open", open);
  if (open) {
    if (!coachHistory.length) greet(); else drawLog();
    setTimeout(() => $("#coachIn").focus(), 50);
  }
}

$("#coachFab").onclick = () => setOpen($("#coachPanel").hidden);
$("#coachClose").onclick = () => setOpen(false);
$("#coachClear").onclick = () => { coachWaiting = null; greet(); };
$("#coachForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#coachIn").value; $("#coachIn").value = ""; ask(v); });
$("#coachChips").addEventListener("click", e => { const b = e.target.closest(".coach-chip"); if (b) ask(b.textContent); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#coachPanel").hidden) setOpen(false); });

onRender(() => {
  const tx = ct();
  $("#coachFabTxt").textContent = tx.open;
  $("#coachFab").setAttribute("aria-label", tx.open);
  $("#coachTitle").textContent = tx.title;
  $("#coachSub").textContent = tx.sub;
  $("#coachIn").placeholder = tx.placeholder;
  $("#coachNote").textContent = tx.note;
  $("#coachClear").title = tx.clear; $("#coachClear").setAttribute("aria-label", tx.clear);
  if (!$("#coachPanel").hidden) drawLog();
});
