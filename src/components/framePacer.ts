/** Returns a check that says whether a requestAnimationFrame timestamp should draw at the given rate. */
export function createFramePacer(fps: number) {
  const interval = 1000 / fps;
  let last = 0;
  return (time: number) => {
    const elapsed = time - last;
    if (elapsed < interval) return false;
    // Carry the remainder so the average rate holds on any refresh rate.
    last = time - elapsed % interval;
    return true;
  };
}
