import { HostIntegrationInstaller } from "openwiki/dist/integrations/install/installer.js";
import { getHostTarget } from "openwiki/dist/integrations/install/registry.js";

const target = getHostTarget("codex");
const result = await new HostIntegrationInstaller().install(target, {
  scope: "project",
  root: process.argv[2] ?? ".",
  mcpServerCommand: {
    command: "pnpm",
    args: ["exec", "openwiki", "mcp", "--host", "codex"],
  },
});

process.stdout.write(
  `${result.changed ? "installed" : "unchanged"} Codex\n` +
    `skill: ${result.skillDirectory}\n` +
    `mcp: ${result.mcpConfig}\n`,
);
