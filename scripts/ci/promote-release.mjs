import { appendFile, mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { loadManifest } from "./release-manifest.mjs";

const run = (command, label) => new Promise((resolve, reject) => {
  const child = spawn(command, { shell: true, stdio: "inherit", env: process.env });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${label} failed with exit ${code}`)));
});

export function deploymentArguments(manifest, environment) {
  return ["compose", "-f", "docker-compose.release.yml", "-p", `opengym-${environment}`, "up", "-d", "--no-build"];
}

export function promotionPlan(manifest, environment) {
  return ["migration", `deploy:${environment}:${manifest.tag}`, "smoke"];
}

export function validateDevEvidenceRecord(record, manifest) {
  if (record?.environment !== "dev" || record?.smoke !== "passed" || record?.tag !== manifest.tag || record?.images?.web !== manifest.images.web || record?.images?.api !== manifest.images.api) {
    throw new Error("SIT promotion requires DEV evidence for this exact release manifest");
  }
}

async function validateDevEvidence(path, manifest) {
  const records = (await readFile(path, "utf8")).trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  validateDevEvidenceRecord(records.at(-1), manifest);
}

export async function promote(environment = process.env.TARGET_ENV) {
  if (environment !== "dev" && environment !== "sit") throw new Error("TARGET_ENV must be dev or sit");
  if (!process.env.RELEASE_MANIFEST || !process.env.MIGRATE_COMMAND || !process.env.SMOKE_COMMAND) {
    throw new Error("RELEASE_MANIFEST, MIGRATE_COMMAND, and SMOKE_COMMAND are required");
  }
  const manifest = await loadManifest(process.env.RELEASE_MANIFEST);
  if (environment === "sit") {
    if (!process.env.DEV_PROMOTION_EVIDENCE) throw new Error("SIT promotion requires DEV_PROMOTION_EVIDENCE artifact path");
    await validateDevEvidence(process.env.DEV_PROMOTION_EVIDENCE, manifest);
  }
  process.env.RELEASE_WEB_IMAGE = manifest.images.web;
  process.env.RELEASE_API_IMAGE = manifest.images.api;
  await run(process.env.MIGRATE_COMMAND, "migration");
  await new Promise((resolve, reject) => {
    const child = spawn("docker", deploymentArguments(manifest, environment), { stdio: "inherit", env: process.env });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`deployment failed with exit ${code}`)));
  });
  await run(process.env.SMOKE_COMMAND, "smoke check");
  const evidenceDirectory = process.env.EVIDENCE_DIR ?? "artifacts/promotion";
  await mkdir(evidenceDirectory, { recursive: true });
  await appendFile(`${evidenceDirectory}/${environment}.jsonl`, `${JSON.stringify({ environment, tag: manifest.tag, images: manifest.images, migratedBeforeDeploy: true, smoke: "passed", steps: promotionPlan(manifest, environment) })}\n`);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1].replaceAll("\\", "/")) await promote();
