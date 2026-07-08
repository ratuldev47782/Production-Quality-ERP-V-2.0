// [//Scripts/generateMachineData.js]
const fs = require("fs");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

function toNumber(value) {
  const num = Number(value);
  return Number.isNaN(num) || num < 0 ? 0 : num;
}

function padSerial(num) {
  return String(num).padStart(3, "0");
}

function makeAutoPrefix(machineName) {
  const words = machineName
    .replace(/[()\/,-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !["M", "C", "MC"].includes(word.toUpperCase()));

  const prefix = words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join("");

  return prefix || "MC";
}

function createUnits({ floorName, prefix, running, idle, repairable, damage, startSerial }) {
  const units = [];
  let serial = startSerial;

  const addUnits = (status, qty) => {
    for (let i = 0; i < qty; i++) {
      units.push({
        serialNumber: `${prefix}-${padSerial(serial)}`,
        floorName,
        status,
      });
      serial++;
    }
  };

  addUnits("Running", running);
  addUnits("Idle", idle);
  addUnits("Repairable", repairable);
  addUnits("Damage", damage);

  return { units, nextSerial: serial };
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const factory = (await rl.question("Factory name দাও: ")).trim() || "K-2";
    const machineName = (await rl.question("Machine name দাও: ")).trim() || "SINGLE NDL (PLAIN M/C)";

    const customPrefix = (await rl.question("Serial prefix দাও (না দিলে auto হবে): ")).trim();
    const prefix = customPrefix || makeAutoPrefix(machineName);

    const machineData = {
      factory,
      machineName,
      units: [],
    };

    let serialCounter = 1;

    while (true) {
      const floorName = (await rl.question('\nFloor name দাও (শেষ হলে "done" লিখো): ')).trim();

      if (!floorName) {
        console.log("Floor empty দেয়া যাবে না।");
        continue;
      }

      if (floorName.toLowerCase() === "done") {
        break;
      }

      const running = toNumber(await rl.question(`${floorName} - Running qty: `));
      const idle = toNumber(await rl.question(`${floorName} - Idle qty: `));
      const repairable = toNumber(await rl.question(`${floorName} - Repairable qty: `));
      const damage = toNumber(await rl.question(`${floorName} - Damage qty: `));

      const { units, nextSerial } = createUnits({
        floorName,
        prefix,
        running,
        idle,
        repairable,
        damage,
        startSerial: serialCounter,
      });

      machineData.units.push(...units);
      serialCounter = nextSerial;

      console.log(`${floorName} floor add হয়েছে। মোট unit: ${machineData.units.length}`);
    }

    const finalData = [machineData];

    fs.writeFileSync("generated-machine-data.json", JSON.stringify(finalData, null, 2), "utf-8");

    console.log("\nGenerated JSON:\n");
    console.log(JSON.stringify(finalData, null, 2));
    console.log('\nFile saved as: "generated-machine-data.json"');
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

main();