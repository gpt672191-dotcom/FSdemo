// คลังท่าออกกำลังกายและรูปแบบแผน (Exercise library and plan templates)

/* ---------- Exercise library ----------
   cat: lower | upper | core | cardio | mobility
   eq: none | db | gym     jump: high-impact     adv: intermediate only
   timed: hold in seconds  side: per side        machine: steady cardio in minutes */
const EX = [
  // Lower
  { id: "squat", cat: "lower", eq: "none", th: "สควอท", en: "Bodyweight squat", cth: "ดันสะโพกไปด้านหลัง เข่าตามแนวปลายเท้า", cen: "Sit hips back, knees track over toes" },
  { id: "lunge", cat: "lower", eq: "none", side: 1, th: "ลันจ์ถอยหลัง", en: "Reverse lunge", cth: "ก้าวถอยหลัง ลดเข่าหลังลงใกล้พื้น", cen: "Step back, lower back knee toward floor" },
  { id: "bridge", cat: "lower", eq: "none", th: "ยกสะโพก (Glute bridge)", en: "Glute bridge", cth: "บีบก้นขณะยกสะโพก ค้าง 1 วินาที", cen: "Squeeze glutes at the top, pause 1 s" },
  { id: "wallsit", cat: "lower", eq: "none", timed: 1, th: "นั่งพิงกำแพง", en: "Wall sit", cth: "เข่างอประมาณ 90 องศา หลังแนบกำแพง", cen: "Knees at about 90°, back flat on wall" },
  { id: "calf", cat: "lower", eq: "none", th: "เขย่งปลายเท้า", en: "Calf raise", cth: "ขึ้นช้าๆ ลงช้าๆ จับผนังช่วยทรงตัวได้", cen: "Up slowly, down slowly, hold a wall for balance" },
  { id: "jsquat", cat: "lower", eq: "none", jump: 1, adv: 1, th: "สควอทกระโดด", en: "Jump squat", cth: "ลงพื้นเบาๆ ด้วยเข่าที่งอเล็กน้อย", cen: "Land softly with bent knees" },
  { id: "gsquat", cat: "lower", eq: "db", th: "กอบเล็ทสควอท", en: "Goblet squat", cth: "ถือดัมเบลชิดอก หลังตรง", cen: "Hold dumbbell at chest, chest up" },
  { id: "rdl", cat: "lower", eq: "db", th: "โรมาเนียนเดดลิฟต์", en: "Dumbbell Romanian deadlift", cth: "พับสะโพก หลังตรง ดัมเบลชิดขา", cen: "Hinge at hips, flat back, weights close to legs" },
  { id: "legpress", cat: "lower", eq: "gym", th: "เลกเพรส", en: "Leg press", cth: "อย่าล็อกเข่าตอนเหยียดสุด", cen: "Don't lock your knees at the top" },
  { id: "legcurl", cat: "lower", eq: "gym", th: "เลกเคิร์ล", en: "Leg curl machine", cth: "งอเข่าช้าๆ ควบคุมตอนปล่อย", cen: "Curl slowly, control the return" },
  // Upper
  { id: "pushup", cat: "upper", eq: "none", th: "วิดพื้น (คุกเข่าได้)", en: "Push-up (knees OK)", cth: "ลำตัวตรงเป็นแนวเดียว ศอกทำมุม 45 องศา", cen: "Body in a straight line, elbows at 45°" },
  { id: "inclinepush", cat: "upper", eq: "none", th: "วิดพื้นมือวางโต๊ะ", en: "Incline push-up", cth: "มือวางบนโต๊ะหรือเก้าอี้ที่มั่นคง", cen: "Hands on a sturdy table or bench" },
  { id: "dip", cat: "upper", eq: "none", th: "ดิปเก้าอี้", en: "Chair dip", cth: "ศอกชี้ไปด้านหลัง ลงแค่พอรู้สึกตึง", cen: "Elbows point back, lower only as far as comfortable" },
  { id: "superman", cat: "upper", eq: "none", th: "ซูเปอร์แมน", en: "Superman", cth: "ยกแขนและขาพร้อมกัน ค้าง 2 วินาที", cen: "Lift arms and legs together, hold 2 s" },
  { id: "pikepush", cat: "upper", eq: "none", adv: 1, th: "ไพค์พุชอัพ", en: "Pike push-up", cth: "ยกสะโพกสูง ลดศีรษะลงระหว่างมือ", cen: "Hips high, lower head between hands" },
  { id: "dbrow", cat: "upper", eq: "db", side: 1, th: "ดัมเบลโรว์", en: "Dumbbell row", cth: "ดึงศอกไปทางสะโพก บีบสะบัก", cen: "Pull elbow toward hip, squeeze shoulder blade" },
  { id: "dbpress", cat: "upper", eq: "db", th: "ดัมเบลชอลเดอร์เพรส", en: "Dumbbell shoulder press", cth: "เกร็งหน้าท้อง อย่าแอ่นหลัง", cen: "Brace core, don't arch your back" },
  { id: "floorpress", cat: "upper", eq: "db", th: "ดัมเบลเพรสบนพื้น", en: "Dumbbell floor press", cth: "นอนหงาย ดันดัมเบลขึ้นตรงเหนืออก", cen: "Lie down, press weights straight over chest" },
  { id: "curl", cat: "upper", eq: "db", th: "ไบเซ็ปเคิร์ล", en: "Biceps curl", cth: "ศอกชิดลำตัว ไม่เหวี่ยง", cen: "Elbows by your sides, no swinging" },
  { id: "pulldown", cat: "upper", eq: "gym", th: "แลทพูลดาวน์", en: "Lat pulldown", cth: "ดึงบาร์ลงมาที่อกบน", cen: "Pull bar to upper chest" },
  { id: "cablerow", cat: "upper", eq: "gym", th: "เคเบิลโรว์", en: "Seated cable row", cth: "หลังตรง ดึงเข้าหาท้อง", cen: "Tall back, pull to your belly" },
  { id: "chestpress", cat: "upper", eq: "gym", th: "เชสต์เพรสเครื่อง", en: "Chest press machine", cth: "ดันออกช้าๆ อย่าล็อกศอก", cen: "Press out slowly, soft elbows" },
  // Core
  { id: "plank", cat: "core", eq: "none", timed: 1, th: "แพลงก์", en: "Plank", cth: "ลำตัวตรง เกร็งหน้าท้องและก้น", cen: "Straight line, brace abs and glutes" },
  { id: "deadbug", cat: "core", eq: "none", side: 1, th: "เดดบั๊ก", en: "Dead bug", cth: "หลังล่างแนบพื้นตลอดเวลา", cen: "Keep lower back pressed to the floor" },
  { id: "birddog", cat: "core", eq: "none", side: 1, th: "เบิร์ดด็อก", en: "Bird dog", cth: "เหยียดแขนและขาตรงข้าม ลำตัวนิ่ง", cen: "Reach opposite arm and leg, keep torso still" },
  { id: "sideplank", cat: "core", eq: "none", timed: 1, side: 1, th: "แพลงก์ด้านข้าง", en: "Side plank", cth: "คุกเข่าได้ถ้ายังไม่แข็งแรง", cen: "Drop to knees if needed" },
  { id: "crunch", cat: "core", eq: "none", th: "ครันช์", en: "Crunch", cth: "ยกสะบักขึ้นจากพื้น อย่าดึงคอ", cen: "Lift shoulder blades, don't pull your neck" },
  // Cardio
  { id: "jj", cat: "cardio", eq: "none", jump: 1, th: "จัมปิงแจ็ค", en: "Jumping jacks", cth: "ลงพื้นด้วยปลายเท้าเบาๆ", cen: "Land lightly on the balls of your feet" },
  { id: "stepjack", cat: "cardio", eq: "none", th: "สเต็ปแจ็ค (ไม่กระโดด)", en: "Step jacks (no jump)", cth: "ก้าวออกข้างทีละข้างพร้อมยกแขน", cen: "Step out one side at a time, raise arms" },
  { id: "highknee", cat: "cardio", eq: "none", jump: 1, th: "ยกเข่าสูง", en: "High knees", cth: "ยกเข่าถึงระดับสะโพก", cen: "Drive knees to hip height" },
  { id: "march", cat: "cardio", eq: "none", th: "ย่ำเท้ายกเข่าเร็ว", en: "Fast knee march", cth: "ย่ำเร็วๆ แกว่งแขนแรงๆ", cen: "March fast, pump your arms" },
  { id: "climber", cat: "cardio", eq: "none", th: "เมาเทนไคลม์เบอร์", en: "Mountain climbers", cth: "สะโพกต่ำ ดึงเข่าเข้าหาอก", cen: "Hips low, drive knees to chest" },
  { id: "skater", cat: "cardio", eq: "none", jump: 1, th: "สเก็ตเตอร์", en: "Skater hops", cth: "กระโดดข้างแล้วทรงตัวขาเดียว", cen: "Hop sideways, balance on one leg" },
  { id: "boxstep", cat: "cardio", eq: "none", th: "ชกลมพร้อมก้าวเท้า", en: "Shadow boxing steps", cth: "ชกสลับซ้ายขวา ขยับเท้าตลอด", cen: "Punch alternately, keep feet moving" },
  { id: "burpee", cat: "cardio", eq: "none", jump: 1, adv: 1, th: "เบอร์พี", en: "Burpee", cth: "ทำช้าลงได้ ถ้ายังไม่ไหวให้ก้าวแทนกระโดด", cen: "Slow it down; step instead of jump if needed" },
  { id: "bike", cat: "cardio", eq: "gym", machine: 1, th: "ปั่นจักรยานอยู่กับที่", en: "Stationary bike", cth: "ความเหนื่อยระดับพูดได้แต่ร้องเพลงไม่ได้", cen: "Pace where you can talk but not sing" },
  { id: "tread", cat: "cardio", eq: "gym", machine: 1, th: "เดินเร็วบนลู่วิ่ง (ชัน)", en: "Incline treadmill walk", cth: "ไม่จับราว เดินชันประมาณ 5–8%", cen: "Don't hold rails, 5–8% incline" },
  { id: "rower", cat: "cardio", eq: "gym", machine: 1, th: "เครื่องพายเรือ", en: "Rowing machine", cth: "ถีบขา → เอนตัว → ดึงแขน", cen: "Legs → lean → arms" },
  // Mobility
  { id: "catcow", cat: "mobility", eq: "none", timed: 1, th: "แคท-คาว", en: "Cat-cow", cth: "หายใจเข้าแอ่นหลัง หายใจออกโก่งหลัง", cen: "Inhale to arch, exhale to round" },
  { id: "wgs", cat: "mobility", eq: "none", timed: 1, side: 1, th: "ยืดสะโพกพร้อมบิดตัว", en: "World's greatest stretch", cth: "ก้าวลันจ์ วางมือ แล้วบิดตัวชูแขน", cen: "Lunge, hand down, rotate and reach up" },
  { id: "hipflex", cat: "mobility", eq: "none", timed: 1, side: 1, th: "ยืดสะโพกด้านหน้า", en: "Hip flexor stretch", cth: "คุกเข่าข้างเดียว ดันสะโพกไปข้างหน้า", cen: "Half-kneel, push hips forward gently" },
  { id: "hamstring", cat: "mobility", eq: "none", timed: 1, side: 1, th: "ยืดต้นขาด้านหลัง", en: "Hamstring stretch", cth: "หลังตรง พับตัวจากสะโพก", cen: "Flat back, hinge from hips" },
  { id: "child", cat: "mobility", eq: "none", timed: 1, th: "ท่าเด็ก (Child's pose)", en: "Child's pose", cth: "หายใจลึกๆ ผ่อนคลายหลัง", cen: "Breathe deep, relax your back" },
  { id: "tspine", cat: "mobility", eq: "none", timed: 1, side: 1, th: "บิดหลังส่วนบน", en: "Thoracic rotation", cth: "นอนตะแคง เปิดแขนบนไปอีกด้าน", cen: "Lie on side, open top arm to the other side" },
  { id: "dog", cat: "mobility", eq: "none", timed: 1, th: "ท่าสุนัขก้มหน้า", en: "Downward dog", cth: "ดันสะโพกขึ้น งอเข่าได้", cen: "Push hips up, bend knees if needed" }
];

/* Day templates: ordered slot categories (first N used by session length) */
const TEMPLATES = {
  lose:   [{ type: "circuit", slots: ["lower", "upper", "cardio", "core", "cardio", "lower", "upper"] },
           { type: "cardio",  slots: ["cardio", "core", "cardio", "lower", "cardio", "core", "upper"] }],
  muscle: [{ type: "upper",   slots: ["upper", "upper", "core", "upper", "upper", "core", "upper"] },
           { type: "lower",   slots: ["lower", "lower", "core", "lower", "lower", "core", "lower"] },
           { type: "full",    slots: ["lower", "upper", "core", "lower", "upper", "core", "upper"] }],
  endure: [{ type: "cardio",  slots: ["cardio", "lower", "cardio", "core", "cardio", "upper", "cardio"] },
           { type: "full",    slots: ["lower", "upper", "cardio", "core", "lower", "cardio", "upper"] }],
  flex:   [{ type: "mobility", slots: ["mobility", "mobility", "core", "mobility", "mobility", "core", "mobility"] },
           { type: "full",     slots: ["mobility", "lower", "core", "mobility", "upper", "mobility", "core"] }]
};
const SCHEDULE = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] };
const COUNT = { 15: 3, 30: 5, 45: 7 };

const OPTIONS = {
  goal: ["lose", "muscle", "endure", "flex"],
  level: ["beg", "int"],
  days: ["2", "3", "4", "5"],
  time: ["15", "30", "45"],
  equip: ["none", "db", "gym"],
  impact: ["any", "low"]
};
const DEFAULTS = { goal: "lose", level: "beg", days: "3", time: "30", equip: "none", impact: "any" };
