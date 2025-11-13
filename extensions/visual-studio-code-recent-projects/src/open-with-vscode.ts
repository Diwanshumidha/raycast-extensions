import { closeMainWindow, getFrontmostApplication, getSelectedFinderItems, open, showToast, Toast } from "@raycast/api";
import { runAppleScript, showFailureToast } from "@raycast/utils";
import { build, bundleIdentifier } from "./preferences";
import { getCurrentFinderPath } from "./utils/apple-scripts";
import { resolveUriToPath } from "./utils/utils";

// Function to get selected Path Finder items
const getSelectedPathFinderItems = async () => {
  const script = `
    tell application "Path Finder"
      set thePaths to {}
      repeat with pfItem in (get selection)
        set the end of thePaths to POSIX path of pfItem
      end repeat
      return thePaths
    end tell
  `;

  const paths = await runAppleScript(script);
  return paths.split(","); // Assuming the paths are comma-separated
};

export default async function main() {
  try {
    let selectedItems: { path: string }[] = [];
    const currentApp = await getFrontmostApplication();

    if (currentApp.name === "Finder") {
      selectedItems = await getSelectedFinderItems();
    } else if (currentApp.name === "Path Finder") {
      if (process.platform === "win32") return showFailureToast("Path Finder is not supported on Windows");
      const paths = await getSelectedPathFinderItems();
      selectedItems = paths.map((p) => ({ path: p }));
    }

    const applicationName = process.platform === "win32" ? build : bundleIdentifier;

    if (selectedItems.length === 0) {
      const currentPath = await getCurrentFinderPath();
      if (currentPath.length === 0) throw new Error("Not a valid directory");
      const uri = process.platform === "win32" ? resolveUriToPath(currentPath) : currentPath;

      await open(uri, applicationName);
    } else {
      for (const item of selectedItems) {
        const uri = process.platform === "win32" ? resolveUriToPath(item.path) : item.path;
        await open(uri, applicationName);
      }
    }

    await closeMainWindow();
  } catch (error) {
    console.error(error);
    await showToast({
      title: "Failed opening selected Finder or Path Finder item",
      style: Toast.Style.Failure,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
