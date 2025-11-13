import { runPowerShellScript } from "@raycast/utils";
import { runAppleScript } from "run-applescript";

const getCurrentFinderPathScript = `
try
    tell application "Finder"
        return POSIX path of (insertion location as alias)
    end tell
on error
    return ""
end try
`;

// Retrieves the first File Explorer window path on Windows.
// I was not able to find any method to access the insertion location like macOS,
// so we get the path of the first active File Explorer window instead.
// This need improvements in the future.
const getCurrentExplorerPathPowerShellScript = `
function Get-CurrentExplorerPath {
    try {
        $shell = New-Object -ComObject Shell.Application
        $explorer = $shell.Windows() | Where-Object { $_.Name -eq 'File Explorer' -or $_.FullName -like '*explorer.exe' } | Select-Object -First 1
        if ($explorer -and $explorer.Document -and $explorer.Document.Folder) {
            return $explorer.Document.Folder.Self.Path
        } else {
            return ""
        }
    } catch {
        return ""
    }
}

return Get-CurrentExplorerPath
`;

export const getCurrentFinderPath = async () => {
  if (process.platform === "win32") {
    const result = await runPowerShellScript(getCurrentExplorerPathPowerShellScript);

    return result.trim();
  } else {
    return await runAppleScript(getCurrentFinderPathScript);
  }
};
