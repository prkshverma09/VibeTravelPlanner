import type { TripState, TripAction } from '../context/TripContext';
import type { ClearPreferencesInput, ClearPreferencesOutput, ToolHandler } from './types';

export function createClearPreferencesHandler(
  dispatch: React.Dispatch<TripAction>,
  state: TripState
): ToolHandler<ClearPreferencesInput, ClearPreferencesOutput> {
  return ({ input, addToolResult }) => {
    const { category } = input;
    const isAll = category === null || category === 'all';

    const clearedCount = isAll
      ? state.preferences.length
      : state.preferences.filter((p) => p.category === category).length;

    dispatch({
      type: 'CLEAR_PREFERENCES',
      payload: { category: isAll ? 'all' : category },
    });

    const message = isAll
      ? `Cleared all ${clearedCount} preferences. Starting fresh!`
      : `Cleared ${clearedCount} ${category} preference${clearedCount !== 1 ? 's' : ''}`;

    addToolResult({
      output: {
        success: true,
        message,
        clearedCount,
      },
    });
  };
}
