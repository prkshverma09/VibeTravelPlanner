import type { TripState, TripAction } from '../context/TripContext';
import type { SavePreferenceInput, SavePreferenceOutput, ToolHandler } from './types';

export function createSavePreferenceHandler(
  dispatch: React.Dispatch<TripAction>,
  state: TripState
): ToolHandler<SavePreferenceInput, SavePreferenceOutput> {
  return ({ input, addToolResult }) => {
    const { category, value, priority } = input;

    dispatch({
      type: 'ADD_PREFERENCE',
      payload: {
        category,
        value,
        priority: priority || 'nice_to_have',
      },
    });

    const currentPreferences = [
      ...state.preferences.map((p) => `${p.category}: ${p.value}`),
      `${category}: ${value}`,
    ];

    addToolResult({
      output: {
        success: true,
        message: `Saved preference: ${category} = "${value}"`,
        currentPreferences,
      },
    });
  };
}
