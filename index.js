import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { spawn, execSync } from "child_process";
import semver from "semver";
import axios from "axios";
import express from "express";

import {} from "dotenv/config";
import logger from "./core/var/modules/logger.js";
import { loadPlugins } from "./core/var/modules/installDep.js";

import {
    isGlitch,
    isReplit,
    isGitHub,
} from "./core/var/modules/environments.get.js";

console.clear();

/* ======================
   KEEP ALIVE SERVER
====================== */
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => res.send("XaviaBot is alive 🚀"));
app.listen(PORT, () =>
    logger.custom(`Keep-alive server running on port ${PORT}`, "SERVER")
);

/* ======================
   NODE VERSION CHECK
====================== */
function upNodeReplit() {
    return new Promise((resolve) => {
        execSync(
            "npm i --save-dev node@16 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH"
        );
        resolve();
    });
}

(async () => {
    if (process.version.slice(1).split(".")[0] < 16) {
        if (isReplit) {
            try {
                logger.warn("Installing Node.js v16 for Replit...");
                await upNodeReplit();
            } catch (err) {
                logger.error(err);
                process.exit(0);
            }
        }
        logger.error("Node.js v16 or higher is required.");
        process.exit(0);
    }

    if (isGlitch) {
        const WATCH_FILE = {
            restart: { include: ["\\.json"] },
            throttle: 3000,
        };

        if (
            !existsSync(process.cwd() + "/watch.json") ||
            !statSync(process.cwd() + "/watch.json").isFile()
        ) {
            logger.warn("Glitch detected. Creating watch.json...");
            writeFileSync(
                process.cwd() + "/watch.json",
                JSON.stringify(WATCH_FILE, null, 2)
            );
            execSync("refresh");
        }
    }

    if (isGitHub) {
        logger.warn("Running on GitHub is not recommended.");
    }
})();

/* ======================
   CHECK UPDATE
====================== */
async function checkUpdate() {
    logger.custom("Checking for updates...", "UPDATE");
    try {
        const res = await axios.get(
            "https://raw.githubusercontent.com/XaviaTeam/XaviaBot/main/package.json"
        );

        const latest = res.data.version;
        const current = JSON.parse(
            readFileSync("./package.json")
        ).version;

        if (semver.lt(current, latest)) {
            logger.warn(`New version available: ${latest}`);
            logger.warn(`Current version: ${current}`);
        } else {
            logger.custom("No updates available.", "UPDATE");
        }
    } catch {
        logger.warn("Failed to check for updates.");
    }
}

/* ======================
   MQTT REFRESH (NO RESTART)
====================== */
const ONE_HOUR = 60 * 60 * 1000;

function refreshListenMQTT() {
    try {
        if (typeof global.listenmqtt === "function") {
            global.listenmqtt();
            logger.custom("listenmqtt refreshed.", "MQTT");
        } else {
            logger.warn("listenmqtt not found.");
        }
    } catch {
        logger.error("Failed to refresh listenmqtt.");
    }
}

/* ======================
   AUTO RESTART (CRASH ONLY)
====================== */
let child = null;

function startBot(reason = "") {
    if (reason) logger.warn(reason);

    child = spawn(
        "node",
        [
            "--trace-warnings",
            "--experimental-import-meta-resolve",
            "--expose-gc",
            "core/_build.js",
        ],
        {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env,
        }
    );

    child.on("close", (code) => {
        logger.error(`Bot stopped with exit code ${code}`);
        logger.warn("Restarting bot automatically...");
        setTimeout(() => startBot("Auto-restart after crash"), 5000);
    });

    child.on("error", (err) => {
        logger.error("Child process error: " + err.message);
        startBot("Restarting after process error");
    });
}

/* ======================
   MAIN
====================== */
async function main() {
    await checkUpdate();
    await loadPlugins();

    startBot();

    // فقط Refresh بدون Restart
    setInterval(refreshListenMQTT, ONE_HOUR);
}

main();
