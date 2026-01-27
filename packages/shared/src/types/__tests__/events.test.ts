import { describe, it, expect, expectTypeOf } from 'vitest';
import type { ClickEvent, ConversionEvent, InsightsEvent } from '../events';

describe('Event Types', () => {
  it('should have valid ClickEvent structure', () => {
    const event: ClickEvent = {
      eventType: 'click',
      eventName: 'City Card Clicked',
      index: 'travel_destinations',
      objectIDs: ['tokyo-japan'],
      userToken: 'user-123',
      timestamp: Date.now()
    };
    
    expect(event.eventType).toBe('click');
    expect(event.objectIDs).toHaveLength(1);
  });

  it('should have valid ConversionEvent structure', () => {
    const event: ConversionEvent = {
      eventType: 'conversion',
      eventName: 'Trip Planned',
      index: 'travel_destinations',
      objectIDs: ['paris-france'],
      userToken: 'user-123',
      queryID: 'query-abc'
    };
    
    expect(event.eventType).toBe('conversion');
    expect(event.queryID).toBe('query-abc');
  });

  it('should allow queryID in after-search events', () => {
    const event: ClickEvent = {
      eventType: 'click',
      eventName: 'City Card Clicked After Search',
      index: 'travel_destinations',
      objectIDs: ['tokyo-japan'],
      userToken: 'user-123',
      queryID: 'query-xyz'
    };
    
    expect(event.queryID).toBe('query-xyz');
  });

  it('should allow positions in click events', () => {
    const event: ClickEvent = {
      eventType: 'click',
      eventName: 'City Card Clicked',
      index: 'travel_destinations',
      objectIDs: ['tokyo-japan'],
      userToken: 'user-123',
      positions: [1]
    };
    
    expect(event.positions).toEqual([1]);
  });

  it('should enforce event type correctly', () => {
    expectTypeOf<ClickEvent['eventType']>().toMatchTypeOf<'click'>();
    expectTypeOf<ConversionEvent['eventType']>().toMatchTypeOf<'conversion'>();
  });

  it('should have InsightsEvent as union type', () => {
    const clickEvent: InsightsEvent = {
      eventType: 'click',
      eventName: 'Click',
      index: 'travel_destinations',
      objectIDs: ['test'],
      userToken: 'user-123'
    };

    const conversionEvent: InsightsEvent = {
      eventType: 'conversion',
      eventName: 'Conversion',
      index: 'travel_destinations',
      objectIDs: ['test'],
      userToken: 'user-123'
    };

    expect(clickEvent.eventType).toBe('click');
    expect(conversionEvent.eventType).toBe('conversion');
  });
});
