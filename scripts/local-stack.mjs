import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import net from "node:net";

const rootDir = process.cwd();
const exampleEnvPath = path.join(rootDir, ".env.example");
const dockerEnvPath = path.join(rootDir, ".env");
const nextEnvPath = path.join(rootDir, ".env.local");
const bootstrapSqlPath = path.join(rootDir, "docker", "db", "bootstrap", "00-local-bootstrap.sql");
const migrationsDir = path.join(rootDir, "database", "migrations");
const seedPath = path.join(rootDir, "database", "seed", "seed.sql");

const requiredKeys = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_MODE",
  "NEXT_PUBLIC_BACKEND_URL",
  "NEXT_PUBLIC_BACKEND_ANON_KEY",
  "BACKEND_SERVICE_ROLE_KEY",
  "POSTGRES_PASSWORD",
  "JWT_SECRET",
  "LOCAL_DB_PORT",
  "LOCAL_BACKEND_PORT",
  "MAILPIT_SMTP_PORT",
  "MAILPIT_UI_PORT",
];

const syncedNextKeys = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_MODE",
  "NEXT_PUBLIC_BACKEND_URL",
  "NEXT_PUBLIC_BACKEND_ANON_KEY",
  "BACKEND_SERVICE_ROLE_KEY",
  "RAWG_API_KEY",
  "CHEAPSHARK_BASE_URL",
];

const serviceContainers = {
  db: "squadlink-local-db",
  auth: "squadlink-local-auth",
  rest: "squadlink-local-rest",
  gateway: "squadlink-local-gateway",
  mailpit: "squadlink-local-mailpit",
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseEnvFile(filePath) {
  const parsed = {};
  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function stringifyEnv(envEntries) {
  return `${Object.entries(envEntries)
    .map(([key, value]) => `${key}=${value ?? ""}`)
    .join("\n")}\n`;
}

function normalizeEnv(envEntries) {
  const normalized = { ...envEntries };

  normalized.NEXT_PUBLIC_BACKEND_URL ??= normalized.NEXT_PUBLIC_SUPABASE_URL ?? "";
  normalized.NEXT_PUBLIC_BACKEND_ANON_KEY ??= normalized.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  normalized.BACKEND_SERVICE_ROLE_KEY ??= normalized.SUPABASE_SERVICE_ROLE_KEY ?? "";
  normalized.LOCAL_BACKEND_PORT ??= normalized.LOCAL_SUPABASE_PORT ?? "";
  normalized.NEXT_PUBLIC_APP_MODE ??= "local";

  normalized.NEXT_PUBLIC_SUPABASE_URL ??= normalized.NEXT_PUBLIC_BACKEND_URL;
  normalized.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= normalized.NEXT_PUBLIC_BACKEND_ANON_KEY;
  normalized.SUPABASE_SERVICE_ROLE_KEY ??= normalized.BACKEND_SERVICE_ROLE_KEY;
  normalized.LOCAL_SUPABASE_PORT ??= normalized.LOCAL_BACKEND_PORT;

  return normalized;
}

function ensureEnvFiles() {
  if (!existsSync(exampleEnvPath)) {
    fail("Falta .env.example en la raiz del proyecto.");
  }

  if (!existsSync(dockerEnvPath)) {
    copyFileSync(exampleEnvPath, dockerEnvPath);
    console.log("Se ha creado .env a partir de .env.example. Revisa los valores antes de continuar.");
  }

  const parsedDockerEnv = parseEnvFile(dockerEnvPath);
  const envFromDockerFile = normalizeEnv(parsedDockerEnv);
  const normalizedDockerEnvText = stringifyEnv(envFromDockerFile);
  const originalDockerEnvText = existsSync(dockerEnvPath) ? readFileSync(dockerEnvPath, "utf8") : "";

  if (normalizedDockerEnvText !== originalDockerEnvText) {
    writeFileSync(dockerEnvPath, normalizedDockerEnvText, "utf8");
  }

  for (const key of requiredKeys) {
    if (!envFromDockerFile[key]?.trim()) {
      fail(`La variable ${key} esta vacia o no existe en .env.`);
    }
  }

  if (!["local", "backend", "supabase"].includes(envFromDockerFile.NEXT_PUBLIC_APP_MODE)) {
    fail("NEXT_PUBLIC_APP_MODE debe ser 'local', 'backend' o 'supabase'.");
  }

  if (envFromDockerFile.JWT_SECRET.length < 32) {
    fail("JWT_SECRET debe tener al menos 32 caracteres.");
  }

  const nextEnv = existsSync(nextEnvPath) ? normalizeEnv(parseEnvFile(nextEnvPath)) : {};
  let nextEnvChanged = false;

  for (const key of syncedNextKeys) {
    if (nextEnv[key] !== envFromDockerFile[key]) {
      nextEnv[key] = envFromDockerFile[key] ?? "";
      nextEnvChanged = true;
    }
  }

  if (!existsSync(nextEnvPath) || nextEnvChanged) {
    writeFileSync(nextEnvPath, stringifyEnv(nextEnv), "utf8");
    console.log("Se ha sincronizado .env.local con las variables del backend local.");
  }

  return {
    ...process.env,
    ...envFromDockerFile,
  };
}

let env = ensureEnvFiles();

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env,
      stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
      shell: false,
    });

    if (options.input) {
      child.stdin.write(options.input);
      child.stdin.end();
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} fallo con codigo ${code}`));
    });
  });
}

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env,
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    if (options.input) {
      child.stdin.write(options.input);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `${command} fallo con codigo ${code}`));
    });
  });
}

function composeArgs(...args) {
  return ["compose", ...args];
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "0.0.0.0");
  });
}

async function ensureRequiredPortsAvailable() {
  const portsToCheck = [
    { key: "LOCAL_DB_PORT", label: "PostgreSQL", serviceName: "db" },
    { key: "LOCAL_BACKEND_PORT", label: "Backend gateway", serviceName: "gateway" },
    { key: "MAILPIT_SMTP_PORT", label: "Mailpit SMTP", serviceName: "mailpit" },
    { key: "MAILPIT_UI_PORT", label: "Mailpit UI", serviceName: "mailpit" },
  ];

  for (const { key, label, serviceName } of portsToCheck) {
    const rawPort = env[key];
    const port = Number(rawPort);

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      fail(`La variable ${key} debe ser un puerto valido. Valor actual: ${rawPort}`);
    }

    try {
      const containerStatus = await runCapture("docker", [
        "inspect",
        "--format",
        "{{.State.Status}}",
        serviceContainers[serviceName],
      ]);

      if (containerStatus === "running") {
        continue;
      }
    } catch {
      // Si no existe el contenedor, comprobamos el puerto del host.
    }

    const available = await isPortAvailable(port);
    if (!available) {
      fail(`El puerto ${port} (${label}) ya esta en uso. Cambia ${key} en .env y, si aplica, ajusta NEXT_PUBLIC_BACKEND_URL.`);
    }
  }
}

async function ensureDockerReady() {
  try {
    await run("docker", ["info"]);
  } catch {
    fail("Docker no esta disponible. Abre Docker Desktop, espera a que arranque y vuelve a ejecutar el comando.");
  }
}

async function waitForDb() {
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    try {
      await run("docker", composeArgs("exec", "-T", "db", "pg_isready", "-U", "postgres", "-h", "localhost"));
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  fail("La base de datos local no respondio a tiempo. Revisa `npm run local:logs`.");
}

async function waitForServiceHealthy(serviceName) {
  const containerName = serviceContainers[serviceName];

  for (let attempt = 1; attempt <= 40; attempt += 1) {
    try {
      const status = await runCapture("docker", [
        "inspect",
        "--format",
        "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
        containerName,
      ]);

      if (status === "healthy" || status === "running") {
        return;
      }

      if (status === "unhealthy" || status === "exited") {
        await run("docker", composeArgs("logs", "--tail", "120", serviceName));
        fail(`El servicio ${serviceName} quedo en estado ${status}.`);
      }
    } catch {
      // Esperamos a que exista el contenedor.
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  await run("docker", composeArgs("logs", "--tail", "120", serviceName));
  fail(`Timeout esperando a que ${serviceName} estuviera healthy.`);
}

async function applySqlText(sql, variables = {}, databaseUser = "postgres") {
  const args = composeArgs("exec", "-T", "db", "psql", "-v", "ON_ERROR_STOP=1", "-U", databaseUser, "-d", "postgres");

  for (const [key, value] of Object.entries(variables)) {
    args.push("-v", `${key}=${value}`);
  }

  await run("docker", args, { input: sql });
}

async function applySqlFile(filePath, variables = {}, databaseUser = "postgres") {
  const sql = readFileSync(filePath, "utf8");
  console.log(`Aplicando ${path.relative(rootDir, filePath)}...`);
  await applySqlText(sql, variables, databaseUser);
}

async function bootstrapDbRuntime() {
  await applySqlFile(
    bootstrapSqlPath,
    {
      postgres_password: env.POSTGRES_PASSWORD,
      jwt_secret: env.JWT_SECRET,
      jwt_exp: env.JWT_EXPIRY ?? "3600",
    },
    "supabase_admin",
  );
}

function getMigrationFiles() {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => path.join(migrationsDir, file));
}

async function ensureMigrationTable() {
  await applySqlText(`
    create table if not exists public.schema_migrations (
      name text primary key,
      applied_at timestamptz not null default timezone('utc', now())
    );
  `);
}

async function getAppliedMigrationNames() {
  const stdout = await runCapture("docker", [
    ...composeArgs(
      "exec",
      "-T",
      "db",
      "psql",
      "-t",
      "-A",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-c",
      "select name from public.schema_migrations order by name;",
    ),
  ]);

  return new Set(stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

async function schemaAlreadyPresent() {
  const stdout = await runCapture("docker", [
    ...composeArgs(
      "exec",
      "-T",
      "db",
      "psql",
      "-t",
      "-A",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-c",
      "select case when to_regclass('public.profiles') is null then '0' else '1' end;",
    ),
  ]);

  return stdout.trim() === "1";
}

async function markMigrationApplied(fileName) {
  const escaped = fileName.replaceAll("'", "''");
  await applySqlText(`insert into public.schema_migrations(name) values ('${escaped}') on conflict do nothing;`);
}

async function up() {
  env = ensureEnvFiles();
  await ensureDockerReady();
  await ensureRequiredPortsAvailable();

  await run("docker", composeArgs("up", "-d", "--remove-orphans", "db", "mailpit"));
  await waitForDb();
  await waitForServiceHealthy("mailpit");

  await bootstrapDbRuntime();

  await run("docker", composeArgs("up", "-d", "--remove-orphans", "auth", "rest"));
  await waitForServiceHealthy("auth");
  await waitForServiceHealthy("rest");

  await run("docker", composeArgs("up", "-d", "--remove-orphans", "gateway"));
  await waitForServiceHealthy("gateway");
}

async function down(removeVolumes = false) {
  env = ensureEnvFiles();
  await ensureDockerReady();

  const args = ["down", "--remove-orphans"];
  if (removeVolumes) {
    args.push("-v");
  }

  await run("docker", composeArgs(...args));
}

async function migrate() {
  env = ensureEnvFiles();
  await ensureDockerReady();
  await waitForDb();
  await ensureMigrationTable();

  let applied = await getAppliedMigrationNames();
  if (applied.size === 0 && (await schemaAlreadyPresent())) {
    for (const filePath of getMigrationFiles()) {
      await markMigrationApplied(path.basename(filePath));
    }

    applied = await getAppliedMigrationNames();
  }

  for (const filePath of getMigrationFiles()) {
    const fileName = path.basename(filePath);
    if (applied.has(fileName)) {
      continue;
    }

    await applySqlFile(filePath);
    await markMigrationApplied(fileName);
  }
}

async function seed() {
  env = ensureEnvFiles();
  await ensureDockerReady();
  await waitForDb();
  await applySqlFile(seedPath);
}

async function reset() {
  env = ensureEnvFiles();
  await ensureDockerReady();
  await down(true);
  await up();
}

async function logs() {
  env = ensureEnvFiles();
  await ensureDockerReady();
  await run("docker", composeArgs("logs", "-f", "--tail", "200", "db", "auth", "rest", "gateway", "mailpit"));
}

const command = process.argv[2];

switch (command) {
  case "up":
    await up();
    break;
  case "down":
    await down(process.argv.includes("--volumes"));
    break;
  case "migrate":
    await migrate();
    break;
  case "seed":
    await seed();
    break;
  case "reset":
    await reset();
    break;
  case "logs":
    await logs();
    break;
  default:
    fail("Uso: node scripts/local-stack.mjs <up|down|migrate|seed|reset|logs>");
}
