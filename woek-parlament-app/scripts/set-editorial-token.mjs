#!/usr/bin/env node

import fs from "node:fs";
import { loadEnvFile, stringifyEnv } from "./env-utils.mjs";

const token = process.env.NEW_EDITORIAL_API_TOKEN;
if (!token || token.length < 32) throw new Error("NEW_EDITORIAL_API_TOKEN must contain a long random secret.");
const values = loadEnvFile(".env.local");
values.EDITORIAL_API_TOKEN = token;
fs.writeFileSync(".env.local", stringifyEnv(values), { mode: 0o600 });
console.log("Stored the editorial access token in protected local configuration.");
