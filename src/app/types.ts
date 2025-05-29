import { z } from "zod";

export interface TranscriptItem {
    itemId: string;
    type: "MESSAGE" | "BREADCRUMB";
    role?: "user" | "assistant";
    title?: string;
    data?: Record<string, unknown>;
    expanded: boolean;
    timestamp: string;
    createdAtMs: number;
    status: "IN_PROGRESS" | "DONE";
    isHidden: boolean;
    guardrailResult?: unknown;
  }


  export interface ServerEvent {
    type: string;
    event_id?: string;
    item_id?: string;
    transcript?: string;
    delta?: string;
    session?: {
      id?: string;
    };
    item?: {
      id?: string;
      object?: string;
      type?: string;
      status?: string;
      name?: string;
      arguments?: string;
      role?: "user" | "assistant";
      content?: {
        type?: string;
        transcript?: string | null;
        text?: string;
      }[];
    };
    response?: {
      output?: {
        id: string;
        type?: string;
        name?: string;
        arguments?: unknown;
        call_id?: string;
        role: string;
        content?: unknown;
      }[];
      metadata: Record<string, unknown>;
      status_details?: {
        error?: unknown;
      };
    };
  }