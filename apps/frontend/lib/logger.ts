import "server-only";

import pino from "pino";
import { ecsFormat } from "@elastic/ecs-pino-format";


const isProd = process.env.NODE_ENV === "production";
const pretty = !isProd && process.env.LOG_PRETTY !== "false";

const layout = isProd
  ? ecsFormat({ serviceName: "frontend" })
  : {
      base: { service: "frontend" },
      timestamp: pino.stdTimeFunctions.isoTime,
      serializers: { err: pino.stdSerializers.err },
    };

// Pass thrown errors under the `err` key — pino's serializer (and ECS) map it to a full structured
// stack. Any other key drops the non-enumerable Error fields (message/stack), logging `{}`.
const root = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  ...layout,
  redact: {
    paths: [
      "authorization", "cookie", "token", "accessToken", "password", "secret", "email",
      "*.authorization", "*.cookie", "*.token", "*.accessToken", "*.password", "*.secret", "*.email",
    ],
    censor: "[redacted]",
  },
  ...(pretty
    ? { transport: { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } } }
    : {}),
});

type LogContext = Record<string, unknown>;

export const logger = {
  error(scope: string, message: string, context?: LogContext) {
    root.error({ scope, ...context }, message);
  },
  warn(scope: string, message: string, context?: LogContext) {
    root.warn({ scope, ...context }, message);
  },
  info(scope: string, message: string, context?: LogContext) {
    root.info({ scope, ...context }, message);
  },
  debug(scope: string, message: string, context?: LogContext) {
    root.debug({ scope, ...context }, message);
  },
};
