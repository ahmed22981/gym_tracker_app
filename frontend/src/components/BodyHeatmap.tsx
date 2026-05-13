import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter';

interface Props {
  data: Record<string, number>;
}

export default function BodyHeatmap({ data }: Props) {
  const rawData: IExerciseData[] = [];
  
  Object.entries(data).forEach(([muscle, count]) => {
    const normalizedMuscle = muscle.toLowerCase().trim().replace(" ", "-") as Muscle;
    
    for (let i = 0; i < count; i++) {
      rawData.push({
        name: "Workout Set",
        muscles: [normalizedMuscle]
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