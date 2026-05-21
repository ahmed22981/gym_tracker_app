import { render, screen, act, fireEvent } from '@testing-library/react'; // استبدلنا userEvent بـ fireEvent
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimerProvider, useTimer } from '../context/TimerContext';
import FloatingTimer from './FloatingTimer';

const TimerController = () => {
  const { startTimer } = useTimer();
  return <button onClick={() => startTimer(60)}>Start 1 Min</button>;
};

describe('Timer Logic and FloatingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('starts timer, counts down, and adds time', () => {
    render(
      <TimerProvider>
        <TimerController />
        <FloatingTimer />
      </TimerProvider>
    );

    expect(screen.queryByText('01:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Start 1 Min'));
    expect(screen.getByText('01:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(screen.getByText('00:58')).toBeInTheDocument();

    fireEvent.click(screen.getByText('30s'));
    expect(screen.getByText('01:28')).toBeInTheDocument();
  });
});