// Compiles src/content/*.ink to JSON next to it. Run: pnpm ink
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Compiler } from 'inkjs/full';

export const compileInk = (source: string) => {
  const c = new Compiler(source);
  const story = c.Compile();
  if (c.errors.length) throw new Error(c.errors.join('\n'));
  return story.ToJson() as string;
};

if (import.meta.main) {
  const dir = new URL('../src/content/', import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.ink'))) {
    writeFileSync(new URL(f.replace(/\.ink$/, '.json'), dir), `${compileInk(readFileSync(new URL(f, dir), 'utf8'))}\n`);
    console.log(`compiled ${f}`);
  }
}
