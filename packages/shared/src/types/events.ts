export interface BaseEvent {
  eventName: string;
  index: string;
  objectIDs: string[];
  userToken: string;
  timestamp?: number;
  queryID?: string;
}

export interface ClickEvent extends BaseEvent {
  eventType: 'click';
  positions?: number[];
}

export interface ConversionEvent extends BaseEvent {
  eventType: 'conversion';
}

export interface ViewEvent extends BaseEvent {
  eventType: 'view';
}

export type InsightsEvent = ClickEvent | ConversionEvent | ViewEvent;

export interface InsightsEventParams {
  objectID: string;
  position?: number;
  queryID?: string;
  eventName?: string;
}

export interface ClickEventParams extends InsightsEventParams {
  position: number;
}

export interface ConversionEventParams extends InsightsEventParams {
  eventName: string;
}
