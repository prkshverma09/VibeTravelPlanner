import type { AlgoliaCity } from '@vibe-travel/shared';
import type { TripState, TripAction } from '../context/TripContext';
import type { AddToTripPlanInput, AddToTripPlanOutput, ToolHandler } from './types';

export function createAddToTripPlanHandler(
  dispatch: React.Dispatch<TripAction>,
  fetchCity: (id: string) => Promise<AlgoliaCity | null>,
  state: TripState
): ToolHandler<AddToTripPlanInput, AddToTripPlanOutput> {
  return async ({ input, addToolResult }) => {
    const { city_id, duration_days, notes } = input;

    try {
      const city = await fetchCity(city_id);

      if (!city) {
        addToolResult({
          output: {
            success: false,
            message: `Could not find city with ID "${city_id}"`,
            tripPlan: state.tripPlan.map((d) => ({
              cityId: d.city.objectID,
              cityName: d.city.city,
              days: d.durationDays,
            })),
          },
        });
        return;
      }

      dispatch({
        type: 'ADD_TO_TRIP',
        payload: {
          city,
          durationDays: duration_days,
          notes,
        },
      });

      const updatedTripPlan = [
        ...state.tripPlan
          .filter((d) => d.city.objectID !== city_id)
          .map((d) => ({
            cityId: d.city.objectID,
            cityName: d.city.city,
            days: d.durationDays,
          })),
        {
          cityId: city.objectID,
          cityName: city.city,
          days: duration_days,
        },
      ];

      addToolResult({
        output: {
          success: true,
          message: `Added ${city.city} to your trip plan${duration_days ? ` for ${duration_days} days` : ''}`,
          tripPlan: updatedTripPlan,
        },
      });
    } catch (error) {
      addToolResult({
        output: {
          success: false,
          message: 'Error adding city to trip plan',
          tripPlan: state.tripPlan.map((d) => ({
            cityId: d.city.objectID,
            cityName: d.city.city,
            days: d.durationDays,
          })),
        },
      });
    }
  };
}
