export type ExerciseTemplate = {
  name: string;
  sets: string;
  imageKey: string;
  note?: string;
};

const exercise = (name: string, sets: string, imageKey: string, note?: string): ExerciseTemplate => ({ name, sets, imageKey, note });

export const ABC_TEMPLATES: Readonly<Record<'A' | 'B' | 'C', readonly ExerciseTemplate[]>> = {
  A: [
    exercise('Supino inclinado com barra', '2×10, 2×8', 'barbell-incline-bench'),
    exercise('Supino reto com halteres', '4×12 a 15', 'dumbbell-flat-bench'),
    exercise('Peck deck', '2×12, 2×10', 'peck-deck'),
    exercise('Cross over', '3×10', 'cable-crossover'),
    exercise('Elevação frontal com halteres', '4×10', 'dumbbell-front-raise'),
    exercise('Elevação frontal sentado com anilha', '4×8', 'seated-plate-front-raise'),
    exercise('Tríceps na polia com cordas', '3×15', 'rope-pushdown'),
    exercise('Tríceps na polia com barra', '3×15', 'bar-pushdown'),
    exercise('Tríceps supinado com barra W', '3×15', 'reverse-w-bar-pushdown'),
  ],
  B: [
    exercise('Puxada frontal com triângulo', '3×12', 'triangle-lat-pulldown', 'Breve pausa na contração máxima'),
    exercise('Puxada frontal com barra', '3×15', 'bar-lat-pulldown', 'Breve pausa na contração máxima'),
    exercise('Pull over com halter', '3×15', 'dumbbell-pullover'),
    exercise('Remada articulada', '2×12, 2×10', 'machine-row', 'Progressão de carga'),
    exercise('Peck deck invertido', '4×12', 'reverse-peck-deck'),
    exercise('Remada alta na polia', '4×8', 'cable-upright-row'),
    exercise('Rosca direta com barra', '3×12', 'barbell-curl'),
    exercise('Rosca alternada hammer', '4×10 cada lado', 'hammer-curl'),
    exercise('Rosca concentrada unilateral', '3×12', 'concentration-curl'),
  ],
  C: [
    exercise('Agachamento livre', '2×12, 3×10', 'barbell-squat'),
    exercise('Leg press', '4×15', 'leg-press'),
    exercise('Mesa flexora', '4×12', 'lying-leg-curl', 'Breve pausa na contração máxima'),
    exercise('Agachamento sumô com halter', '4×10', 'dumbbell-sumo-squat'),
    exercise('Cadeira extensora', '3×(7+7+7)', 'leg-extension'),
    exercise('Desenvolvimento articulado', '4×12', 'machine-shoulder-press'),
    exercise('Elevação lateral com halteres', '3×12', 'dumbbell-lateral-raise'),
    exercise('Encolhimento de ombros com halteres', '3×15', 'dumbbell-shrug'),
    exercise('Panturrilhas — flexão plantar no banco', '3×20', 'seated-calf-raise'),
    exercise('Prancha frontal', '3×30 s', 'plank'),
    exercise('Flexão plantar em pé unilateral', '3×15', 'single-leg-standing-calf-raise'),
    exercise('Elevação de pernas', '3×15', 'lying-leg-raise'),
    exercise('Flexão plantar no leg press', '3×15', 'leg-press-calf-raise'),
    exercise('Abdominais no colchonete', '3×15', 'mat-crunch'),
  ],
};

export function getTemplateForChallengeDay(dayNumber: number): readonly ExerciseTemplate[] {
  return ABC_TEMPLATES[(['A', 'B', 'C'] as const)[(dayNumber - 1) % 3]];
}
