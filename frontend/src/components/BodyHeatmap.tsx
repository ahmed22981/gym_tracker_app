import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter';

interface Props {
  data: Record<string, number>;
}
const MUSCLE_MAP: Record<string, Muscle> = {
  "back": "lower-back",
  "lats": "upper-back",
  "back-deltoids": "trapezius",  
  "trapezius": "trapezius",
  "biceps": "biceps",
  "triceps": "triceps",
  "chest": "chest",
  "abs": "abs",
  "quads": "quadriceps",
  "hamstrings": "hamstring",
  "calves": "calves",
  "glutes": "gluteal",
  "shoulders": "neck",
  'adductors': 'abductors',
  'obliques': 'obliques'
};

export default function BodyHeatmap({ data }: Props) {
  const rawData: IExerciseData[] = [];
  
  Object.entries(data).forEach(([muscle, count]) => {
    const key = muscle.toLowerCase().trim();
    const mappedMuscle = MUSCLE_MAP[key];

    if (mappedMuscle) {
      rawData.push({
        name: `${muscle} (${count} sets)`,
        muscles: [mappedMuscle]
      });
    }
  });

  return (
    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16 }}>FRONT</h4>
        <Model data={rawData} style={{ width: '14rem' }} type="anterior" />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16 }}>BACK</h4>
        <Model data={rawData} style={{ width: '14rem' }} type="posterior" />
      </div>
    </div>
  );
}