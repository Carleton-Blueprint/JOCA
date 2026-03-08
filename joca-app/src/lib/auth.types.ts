import type { Session } from "better-auth";

export interface CustomUser {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    hasPaid: boolean; // Add your custom field here
}

export interface CustomSession extends Session {
    user: CustomUser;
}