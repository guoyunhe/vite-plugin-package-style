import { stat } from 'fs/promises';
import MagicString from 'magic-string';
import micromatch from 'micromatch';
import { join } from 'path';
import type { Plugin } from 'vite';

async function styleExists(style: string) {
  const stylePath = join('node_modules', style);

  try {
    await stat(stylePath);
    return true;
  } catch (e) {
    return false;
  }
}

// Regular expression to get import statements
// https://github.com/antonkc/MOR/blob/main/matchJsImports.md
const importRegex =
  /(?<=(?:[\s\n;])|^)(?:import[\s\n]*((?:(?<=[\s\n])type)?)(?=[\n\s*{])[\s\n]*)((?:(?:[_$\w][_$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_$\w][_$\w0-9]*)))?(?=(?:[\n\s]*,[\n\s]*[{*])|(?:[\n\s]+from)))?)[\s\n,]*((?:\*[\n\s]*(?:as[\s\n]+(?:[_$\w][_$\w0-9]*))(?=[\n\s]+from))?)[\s\n,]*((?:\{[n\s]*(?:(?:[_$\w][_$\w0-9]*)(?:[\s\n]+(?:as[\s\n]+(?:[_$\w][_$\w0-9]*)))?[\s\n]*,?[\s\n]*)*\}(?=[\n\s]*from))?)(?:[\s\n]*((?:from)?))[\s\n]*(?:["']([^"']*)(["']))[\s\n]*?;?/gm;

// Regular expression to filter JavaScript and TypeScript
const sourceRegex = /\.[cm]?[tj]sx?$/;

interface PackageStyleRule {
  // Include package names
  // Support glob matching, e.g. ['@ant-design/*', 'bootstrap-*']
  include: string[];
  // Exclude package names
  // Support glob matching, e.g. ['@ant-design/*', 'bootstrap-*']
  exclude?: string[];
  // Resovle style import path
  // e.g. @myorg/my-package/dist/style.css
  resolveStyle: (packageName?: string) => string;
}

interface PackageStyleOptions {
  rules: PackageStyleRule[];
}
/**
 * Vite plugin to automatically import styles from packages
 */
export default function packageStyle({ rules }: PackageStyleOptions): Plugin {
  const cached: Record<string, string> = {};
  return {
    name: 'vite:package-style',
    enforce: 'post',
    transform: async (code: string, id: string) => {
      // Ignore node_modules
      if (id.includes('/node_modules/')) return;
      // Transform only JS and TS
      if (!sourceRegex.test(id)) return;

      const match = code.matchAll(importRegex);
      const packages = Array.from(match).map((arr) => arr[6]);
      const styles = (
        await Promise.all(
          packages.map(async (pkg) => {
            let style = cached[pkg];
            if (!style) {
              rules.forEach((rule) => {
                if (micromatch([pkg], rule.include, { ignore: rule.exclude }).length > 0) {
                  style = rule.resolveStyle(pkg);
                }
              });
              if (style && !(await styleExists(style))) {
                style = '';
              }
              cached[pkg] = style;
            }
            return style;
          })
        )
      ).filter(Boolean);

      if (!styles.length) return;

      const magicString = new MagicString(code);
      magicString.prepend(
        styles
          .map((style) => `import '${style}';\n`)
          .join('')
          .trim()
      );

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
    },
  };
}
