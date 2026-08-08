export type FormGuide = {
  key: string;
  label: string;
  cues: string[];
  mistakes: string[];
  /** Optional short looping MP4. Lazy-loaded only when the guide is opened. */
  videoUrl?: string;
};

export const FORM_GUIDES: FormGuide[] = [
  {
    key: "pushups",
    label: "Pushups",
    cues: [
      "Hands just outside shoulder width, fingers spread",
      "Squeeze glutes and brace the core — body in one line",
      "Elbows track back at about 45°, not flared wide",
      "Chest to fist height, then press the floor away",
    ],
    mistakes: ["Hips sagging or piking", "Head craning forward", "Half reps at the bottom"],
  },
  {
    key: "situps",
    label: "Situps",
    cues: [
      "Feet flat, knees bent at about 90°",
      "Hands light on the chest or temples — never pull the neck",
      "Curl the spine up one vertebra at a time",
      "Lower with control for a 2-count",
    ],
    mistakes: ["Yanking the neck", "Using momentum to bounce off the floor"],
  },
  {
    key: "pullup-ladder",
    label: "Pull-Ups",
    cues: [
      "Full hang start, shoulders packed down",
      "Drive elbows to the ribs, chest toward the bar",
      "Keep legs quiet — no kipping on strict sets",
      "Lower to a full hang each rep",
    ],
    mistakes: ["Chin-tilting instead of clearing the bar", "Short range at the bottom"],
  },
  {
    key: "plank",
    label: "Plank",
    cues: [
      "Elbows under shoulders, forearms parallel",
      "Tuck the pelvis, ribs down, glutes tight",
      "Push the floor away to spread the shoulder blades",
      "Breathe steadily — no breath holding",
    ],
    mistakes: ["Hips too high or sagging", "Shrugged shoulders"],
  },
  {
    key: "dead-hang",
    label: "Dead Hang",
    cues: [
      "Full grip, thumbs wrapped around the bar",
      "Shoulders active — a slight pull down, not fully slack",
      "Relax the legs and let the spine decompress",
      "Set the bar or a mat within dropping distance",
    ],
    mistakes: ["Completely passive shoulders", "Death-gripping and burning out early"],
  },
  {
    key: "squats",
    label: "Squats",
    cues: [
      "Feet shoulder width, toes slightly out",
      "Brace, then sit back and down between the hips",
      "Knees track over the middle toes",
      "Drive through mid-foot, squeeze glutes at the top",
    ],
    mistakes: ["Heels lifting", "Knees caving in", "Cutting depth short"],
  },
];

export function getFormGuide(key: string) {
  return FORM_GUIDES.find((g) => g.key === key);
}

export type RecoveryItem = { name: string; duration: string; detail: string };

export const RECOVERY_SUGGESTIONS: RecoveryItem[] = [
  { name: "Easy walk", duration: "20–30 min", detail: "Conversational pace. Blood flow without added fatigue." },
  { name: "Cat–cow flow", duration: "2 min", detail: "Slow spinal waves, matched to your breathing." },
  { name: "90/90 hip switches", duration: "3 min", detail: "Open the hips after squat and ladder days." },
  { name: "Thoracic opener on wall", duration: "2 min", detail: "Restores overhead reach for pull-ups." },
  { name: "Couch stretch", duration: "2 min / side", detail: "Hip flexors and quads — hold, don't bounce." },
  { name: "Dead hang (passive)", duration: "30–60 s", detail: "Decompress the spine, stretch the lats." },
  { name: "Box breathing", duration: "3 min", detail: "4 in, 4 hold, 4 out, 4 hold. Downshifts the nervous system." },
];

export type SequenceStep = { name: string; seconds: number };

export const WARMUP_SEQUENCE: SequenceStep[] = [
  { name: "Arm circles", seconds: 30 },
  { name: "Shoulder taps in plank", seconds: 30 },
  { name: "Bodyweight squats", seconds: 45 },
  { name: "Hip openers", seconds: 45 },
  { name: "Scapular pulls / hangs", seconds: 30 },
  { name: "Slow pushups", seconds: 30 },
];

export const COOLDOWN_SEQUENCE: SequenceStep[] = [
  { name: "Child's pose", seconds: 45 },
  { name: "Cobra / chest opener", seconds: 30 },
  { name: "Couch stretch — left", seconds: 45 },
  { name: "Couch stretch — right", seconds: 45 },
  { name: "Hamstring fold", seconds: 45 },
  { name: "Box breathing", seconds: 60 },
];
