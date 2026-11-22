import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const tagPattern = /^[0-9a-f]{7,64}$/;

export function createManifest({ tag, registryImage }) {
  if (!tagPattern.test(tag)) throw new Error("RELEASE_TAG must be an immutable commit SHA");
  if (!registryImage || registryImage.includes("@")) throw new Error("REGISTRY_IMAGE is required");
  return {
    version: 1,
    tag,
    images: {
      web: `${registryImage}/web:${tag}`,
      api: `${registryImage}/api:${tag}`,
    },
  };
}

export function validateManifest(manifest) {
  if (!manifest || manifest.version !== 1 || !tagPattern.test(manifest.tag)) throw new Error("release manifest has an invalid tag");
  for (const image of Object.values(manifest.images ?? {})) {
    if (typeof image !== "string" || !image.endsWith(`:${manifest.tag}`)) throw new Error("release manifest image tags must match the release tag");
  }
  if (!manifest.images?.web || !manifest.images?.api) throw new Error("release manifest needs web and api images");
  return manifest;
}

export async function loadManifest(path) {
  return validateManifest(JSON.parse(await readFile(path, "utf8")));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const output = process.argv[2] ?? "artifacts/release/release-manifest.json";
  const manifest = createManifest({ tag: process.env.RELEASE_TAG ?? process.env.CI_COMMIT_SHA ?? "", registryImage: process.env.REGISTRY_IMAGE ?? process.env.CI_REGISTRY_IMAGE ?? "" });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`${output}\n`);
}
