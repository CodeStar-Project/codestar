import type { Instrumentation } from "next";


export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logger } = await import("./lib/logger");
  logger.error("onRequestError", "unhandled server error", {
    err,
    method: request.method,
    route: request.path.split("?")[0],
    routerKind: context.routerKind,
    routePath: context.routePath,
    renderSource: context.renderSource,
  });
};
