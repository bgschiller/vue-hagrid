export function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
