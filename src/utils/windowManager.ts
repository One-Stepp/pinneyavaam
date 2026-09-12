// Singleton window manager to enforce at most 1 link/window is opened at a time

let singleRewardWindow: Window | null = null;

/**
 * Opens or focuses a single reward window, ensuring no multiple tabs/windows are created.
 * Uses a persistent target name 'UselessRewardSingleWindow'.
 */
export function openSingleRewardLink(url: string): boolean {
  try {
    // If a window is already open and valid, try navigating it
    if (singleRewardWindow && !singleRewardWindow.closed) {
      try {
        singleRewardWindow.location.href = url;
        singleRewardWindow.focus();
        return true;
      } catch {
        // Fallback if cross-origin policy prevents direct location manipulation
      }
    }

    // Open with a fixed target name so the browser strictly opens/reuses only 1 window
    singleRewardWindow = window.open(url, 'UselessRewardSingleWindow');
    if (!singleRewardWindow || singleRewardWindow.closed || typeof singleRewardWindow.closed === 'undefined') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
