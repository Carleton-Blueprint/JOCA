export interface Event {
    title: string;
    date: Date;
    description: string
    location: string
    isPublic: boolean
}

export interface GetEventsData {
    events: Event[];
}