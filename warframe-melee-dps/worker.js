importScripts('Warframe_Melee_DPS.js');

let Module; // Placeholder for the initialized WebAssembly module

// Initialize the WebAssembly module
Warframe_Melee_DPS().then((initializedModule) => {
    Module = initializedModule;

    // Notify the main thread that the module is ready
    self.postMessage({ status: "ready" });
});

self.onmessage = function (event) {
    const { weapon, attack, enemies, iterations, timeMax, tickrate, quantization, conditionals } = event.data;

    if (!Module) {
        self.postMessage({ error: "Module not initialized yet." });
        return;
    }

    if (!weapon) {
        self.postMessage({ error: "Select a weapon" });
        return;
    } else if (enemies.length === 0) {
        self.postMessage({ error: "Select an enemy to fight against" });
        return;
    }

    try {
        // Simulate the computation
        console.log(Module);
        const result = Module.stats(weapon, attack, enemies[0], iterations, timeMax, tickrate, quantization, conditionals);
        const data = CppToColumnar(result);

        // Parse data for charting
        for (const key in data) {
            data[key] = data[key].map(datum => Number(datum));
        }

        const time = data.time;
        delete data.time;

        self.postMessage({ data, time });
    } catch (err) {
        self.postMessage({ error: err.message });
    }
};

function CppToColumnar(dataraw) {
    // Convert to JS array
    const data = new Array(dataraw.size()).fill(0).map((_, id) => dataraw.get(id));

    // Transpose into a dictionary with arrays on each key
    const header_cols = ["time", "damage", "slash", "heat", "electricity", "toxin", "gas"];
    const ret = {};
    for (let i = header_cols.length - 1; 0 <= i; i--) {
        ret[header_cols[i]] = data.map(row => row[i]);
    }
    return ret;
}
