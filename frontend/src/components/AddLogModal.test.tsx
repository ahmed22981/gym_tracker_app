import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AddLogModal from './AddLogModal';
import * as api from '../api/client';
import { TimerProvider } from '../context/TimerContext';

vi.mock('../api/client', () => ({
  getExercises: vi.fn(),
  createLog: vi.fn(),
}));

describe('AddLogModal', () => {
  beforeEach(() => {
    vi.mocked(api.getExercises).mockResolvedValue([
      {
          id: 'ex1', name: 'Deadlift', target_muscle: 'Back',
          video_url: null,
          video_file: null,
          created_at: ''
      }
    ]);
  });

  test('submits form correctly', async () => {
    const mockOnAdded = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(api.createLog).mockResolvedValue({ id: 'log1', reps: 10, weight: 100 } as any);

    render(
      <TimerProvider>
        <AddLogModal 
          sessionId="sess1" 
          currentLogs={[]} 
          onAdded={mockOnAdded} 
          onClose={vi.fn()} 
        />
      </TimerProvider>
    );

    const select = await screen.findByRole('combobox');
    await userEvent.selectOptions(select, 'ex1');

    const repsInput = screen.getByLabelText(/REPS/i);
    const weightInput = screen.getByLabelText(/WEIGHT/i);
    
    await userEvent.clear(repsInput);
    await userEvent.type(repsInput, '5');
    
    await userEvent.clear(weightInput);
    await userEvent.type(weightInput, '120');

    await userEvent.click(screen.getByRole('button', { name: /Log Set/i }));

    expect(api.createLog).toHaveBeenCalledWith({
      session: 'sess1',
      exercise: 'ex1',
      set_number: 1,
      reps: 5,
      weight: 120
    });
    
    expect(mockOnAdded).toHaveBeenCalled();
  });
});