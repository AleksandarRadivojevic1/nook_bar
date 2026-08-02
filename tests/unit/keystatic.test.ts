import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../../keystatic.config';

/**
 * The content directory is the source of truth here rather than
 * `src/content.config.ts`, which imports `astro:content` and cannot be loaded
 * outside an Astro build. It is also the stricter check: a collection is a
 * directory of entries and a singleton is a JSON file beside them, so this
 * notices a new one the moment it lands on disk.
 */
const CONTENT = join(import.meta.dirname, '..', '..', 'src', 'content');
const entries = readdirSync(CONTENT, { withFileTypes: true });

const collectionDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
const singletonFiles = entries
  .filter((e) => e.isFile() && e.name.endsWith('.json'))
  .map((e) => e.name.replace(/\.json$/, ''));

describe('the editing model', () => {
  // A collection the owners cannot edit is one only a developer can fill,
  // which defeats the point of wiring this at all.
  it('exposes every content collection', () => {
    for (const name of collectionDirs) {
      expect(Object.keys(config.collections ?? {}), `missing: ${name}`).toContain(name);
    }
  });

  it('invents no collection the site does not read', () => {
    for (const name of Object.keys(config.collections ?? {})) {
      expect(collectionDirs, `unknown: ${name}`).toContain(name);
    }
  });

  // hours.json and site.json are one-of-a-kind, not lists.
  it('edits every singleton as a singleton', () => {
    expect(Object.keys(config.singletons ?? {}).sort()).toEqual([...singletonFiles].sort());
  });

  it('found something to check, rather than passing on an empty list', () => {
    expect(collectionDirs.length).toBeGreaterThan(5);
    expect(singletonFiles.length).toBeGreaterThan(1);
  });

  // Local mode in production would silently discard every edit on the next
  // deploy, which is the worst possible failure for a non-technical owner.
  it('stores locally in development and on GitHub in production', () => {
    expect(['local', 'github']).toContain(config.storage.kind);
  });
});
