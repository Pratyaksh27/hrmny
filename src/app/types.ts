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

  export type NormalizedTranscriptItem = {
    role: "user" | "assistant";
    content: string;
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

  export interface Tool {
    type: "function";
    name: string;
    description: string;
  }


  export interface AgentConfig {
    name: string;
    publicDescription: string; // gives context to agent transfer tool
    instructions: string;
    tools: Tool[];
    toolLogic?: Record<
      string,
      (args: any, transcriptLogsFiltered: TranscriptItem[]) => Promise<any> | any
    >;
    downstreamAgents?:
      | AgentConfig[]
      | { name: string; publicDescription: string }[];
  }

  export type TargetParticipant = {
    employeeId: string;
    role?: "claimant" | "defendant" | "witness";
    firstName?: string;
    lastName?: string;
  }
  
  export type AllAgentConfigsType = Record<string, AgentConfig[]>;