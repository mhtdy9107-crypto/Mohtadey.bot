import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { spawn, execSync } from "child_process";
import semver from "semver";
import axios from "axios";

import {} from "dotenv/config";
import logger from "./core/var/modules/logger.js";
import { loadPlugins } from "./core/var/modules/installDep.js";

import {
    isGlitch,
    isReplit,
    isGitHub,
} from "./core/var/modules/environments.get.js";

console.clear();

// Install newer node version on some old Repls
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
                logger.warn("Installing Node.js v16 for Repl.it...");
                await upNodeReplit();
                if (process.version.slice(1).split(".")[0] < 16)
                    throw new Error("Failed to install Node.js v16.");
            } catch (err) {
                logger.error(err);
                process.exit(0);
            }
        }
        logger.error(
            "Xavia requires Node 16 or higher. Please update your version of Node."
        );
        process.exit(0);
    }

    if (isGlitch) {
        const WATCH_FILE = {
            restart: {
                include: ["\\.json"],
            },
            throttle: 3000,
        };

        if (
            !existsSync(process.cwd() + "/watch.json") ||
            !statSync(process.cwd() + "/watch.json").isFile()
        ) {
            logger.warn("Glitch environment detected. Creating watch.json...");
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

// =======================
// CHECK UPDATE
// =======================
async function checkUpdate() {
    logger.custom("Checking for updates...", "UPDATE");
    try {
        const res = await axios.get(
            "https://raw.githubusercontent.com/XaviaTeam/XaviaBot/main/package.json"
        );

        const { version } = res.data;
        const currentVersion = JSON.parse(
            readFileSync("./package.json")
        ).version;

        if (semver.lt(currentVersion, version)) {
            logger.warn(`New version available: ${version}`);
            logger.warn(`Current version: ${currentVersion}`);
        } else {
            logger.custom("No updates available.", "UPDATE");
        }
    } catch (err) {
        logger.error("Failed to check for updates.");
    }
}

// =======================
// MQTT REFRESH HANDLER
// =======================
const ONE_HOUR = 60 * 60 * 1000;

function refreshListenMQTT() {
    try {
        if (global.listenmqtt) {
            if (typeof global.listenmqtt === "function") {
                global.listenmqtt();
                logger.custom("listenmqtt callback refreshed.", "MQTT");
            }
        } else {
            logger.warn("listenmqtt not found, skipping refresh.");
        }
    } catch (err) {
        logger.error("Failed to refresh listenmqtt callback.");
    }
}

// =======================
// MAIN
// =======================
async function main() {
    await checkUpdate();
    await loadPlugins();

    const child = spawn(
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

    // ⛔ لا إعادة تشغيل تلقائي
    child.on("close", (code) => {
        console.log();
        logger.error(`XaviaBot stopped with exit code ${code}`);
        logger.warn("Auto-restart is disabled. Press Ctrl + C to exit.");
    });

    // 🔄 تحديث listenmqtt كل ساعة بدون restart
    setInterval(refreshListenMQTT, ONE_HOUR);
}

main();
