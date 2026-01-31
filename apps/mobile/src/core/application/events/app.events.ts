import { Events } from "core/domain/base";
import { singleton } from "tsyringe";

export type AppEvent = { type: "APP_INITIALIZING" } | { type: "APP_INITIALIZED" } | { type: "APP_ERROR"; error: string };

@singleton()
export class AppEvents extends Events<AppEvent> {}
