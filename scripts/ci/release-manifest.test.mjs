import assert from "node:assert/strict";
import test from "node:test";
import { createManifest, validateManifest } from "./release-manifest.mjs";
import { deploymentArguments, promotionPlan, validateDevEvidenceRecord } from "./promote-release.mjs";

test("AC-01-13 creates a matched immutable release pair", () => {
  const manifest = createManifest({ tag: "abcdef1234567", registryImage: "registry.example/opengym" });
  assert.equal(manifest.images.web, "registry.example/opengym/web:abcdef1234567");
  assert.equal(manifest.images.api, "registry.example/opengym/api:abcdef1234567");
});

test("AC-01-13 rejects a release pair with mismatched tags", () => {
  assert.throws(() => validateManifest({ version: 1, tag: "abcdef1234567", images: { web: "registry/web:abcdef1234567", api: "registry/api:other" } }), /must match/);
});

test("AC-01-13 deploys only the repository release compose definition", () => {
  const manifest = createManifest({ tag: "abcdef1234567", registryImage: "registry.example/opengym" });
  assert.deepEqual(deploymentArguments(manifest, "sit"), ["compose", "-f", "docker-compose.release.yml", "-p", "opengym-sit", "up", "-d", "--no-build"]);
});

test("AC-01-13 requires matching DEV evidence before SIT and orders promotion safely", () => {
  const manifest = createManifest({ tag: "abcdef1234567", registryImage: "registry.example/opengym" });
  assert.doesNotThrow(() => validateDevEvidenceRecord({ environment: "dev", smoke: "passed", tag: manifest.tag, images: manifest.images }, manifest));
  assert.throws(() => validateDevEvidenceRecord({ environment: "dev", smoke: "passed", tag: "different", images: manifest.images }, manifest), /exact release/);
  assert.deepEqual(promotionPlan(manifest, "sit"), ["migration", "deploy:sit:abcdef1234567", "smoke"]);
});
