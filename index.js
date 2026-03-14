import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

function getCfg(api) {
  return api?.config?.plugins?.entries?.['lightpanda-tool']?.config ?? {};
}
function truncate(text, maxChars) {
  if (!text || text.length <= maxChars) return text || '';
  return text.slice(0, maxChars) + `\n\n[truncated ${text.length - maxChars} chars]`;
}

export default function register(api) {
  api.registerTool({
    name: 'lightpanda_browser',
    label: 'Lightpanda Browser',
    description: 'Fast JS-aware page extraction via Lightpanda CLI. Prefer this for public unauthenticated browsing/extraction before heavier browser automation.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        url: { type: 'string', description: 'HTTP(S) URL to fetch/render.' },
        dump: { type: 'string', enum: ['markdown', 'html', 'semantic_tree', 'semantic_tree_text'], description: 'Output format.' },
        stripMode: { type: 'string', description: 'Optional strip mode, e.g. full, js, css, ui, or comma-separated.' },
        withFrames: { type: 'boolean' },
        obeyRobots: { type: 'boolean' },
        timeoutMs: { type: 'number', minimum: 1000, maximum: 120000 }
      },
      required: ['url']
    },
    async execute(_toolCallId, params) {
      const cfg = getCfg(api);
      const command = cfg.command || 'lightpanda';
      const dump = params?.dump || cfg.defaultDump || 'markdown';
      const stripMode = typeof params?.stripMode === 'string' && params.stripMode.trim()
        ? params.stripMode.trim()
        : (cfg.defaultStripMode || (dump === 'markdown' ? 'full' : ''));
      const timeoutMs = Number(params?.timeoutMs || cfg.defaultTimeoutMs || 15000);
      const maxOutputChars = Number(cfg.maxOutputChars || 12000);
      const args = ['fetch', '--dump', dump, '--http_timeout', String(timeoutMs)];
      if (stripMode) args.push('--strip_mode', stripMode);
      if (params?.withFrames) args.push('--with_frames');
      if (params?.obeyRobots) args.push('--obey_robots');
      args.push(String(params.url));

      try {
        const { stdout, stderr } = await execFileAsync(command, args, {
          env: { ...process.env, LIGHTPANDA_DISABLE_TELEMETRY: 'true' },
          maxBuffer: 20 * 1024 * 1024,
        });
        return {
          content: [{ type: 'text', text: truncate(stdout || '', maxOutputChars) }],
          details: { command, args, dump, stripMode, timeoutMs, stderr: stderr ? truncate(stderr, 2000) : '' },
        };
      } catch (err) {
        const text = err?.stdout || err?.message || String(err);
        const stderr = err?.stderr || '';
        return {
          content: [{ type: 'text', text: truncate(text + (stderr ? `\n\nSTDERR:\n${stderr}` : ''), maxOutputChars) }],
          details: { error: true, command, args, dump, stripMode, timeoutMs },
        };
      }
    }
  });
}
