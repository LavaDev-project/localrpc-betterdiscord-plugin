/**
 * @name LocalRPC
 * @author BedrockDev
 * @version 1.0.0
 * @invite AuZZjucnz4
 * @description Custom Local Rich Presence for Discord (BetterDiscord)
 */

module.exports = class CustomRPC {
    constructor() {
        this.settings = {
            enabled: false,
            applicationId: "",
            name: "Custom Status",
            details: "Hello from BetterDiscord",
            state: "",
            largeImage: "",
            largeText: "",
            smallImage: "",
            smallText: "",
            showTime: true
        };

        this.interval = null;
    }

    /* ===== META ===== */
    getName() { return "LocalRPC"; }
    getAuthor() { return "BedrockDev"; }
    getVersion() { return "1.0.0"; }
    getDescription() { return "Custom Rich Presence for BetterDiscord"; }

    /* ===== LIFECYCLE ===== */
    start() {
        this.loadSettings();
        if (this.settings.enabled) this.startRPC();
        BdApi.UI.showToast("CustomRPC loaded", { type: "success" });
    }

    stop() {
        this.stopRPC();
    }

    /* ===== SETTINGS ===== */
    loadSettings() {
        this.settings = {
            ...this.settings,
            ...(BdApi.Data.load("CustomRPC", "settings") || {})
        };
    }

    saveSettings() {
        BdApi.Data.save("CustomRPC", "settings", this.settings);
    }

    /* ===== RPC ===== */
    startRPC() {
        if (this.interval) return;

        this.startTime = Math.floor(Date.now() / 1000);

        this.interval = setInterval(() => {
            this.sendPresence();
        }, 15000);

        this.sendPresence();
    }

    stopRPC() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        const dispatcher = BdApi.Webpack.getModule(m => m.dispatch && m.subscribe);
        dispatcher?.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: null
        });
    }

    sendPresence() {
        const dispatcher = BdApi.Webpack.getModule(m => m.dispatch && m.subscribe);
        if (!dispatcher) return;

        dispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: {
                application_id: this.settings.applicationId || "0",
                name: this.settings.name,
                details: this.settings.details,
                state: this.settings.state,
                assets: {
                    large_image: this.settings.largeImage || undefined,
                    large_text: this.settings.largeText || undefined,
                    small_image: this.settings.smallImage || undefined,
                    small_text: this.settings.smallText || undefined
                },
                timestamps: this.settings.showTime ? { start: this.startTime } : undefined,
                type: 0
            }
        });
    }

    /* ===== UI ===== */
    getSettingsPanel() {
        const panel = document.createElement("div");
        panel.style.padding = "15px";

        const createInput = (label, key) => {
            const wrap = document.createElement("div");
            wrap.style.marginBottom = "10px";

            const l = document.createElement("label");
            l.textContent = label;
            l.style.display = "block";

            const input = document.createElement("input");
            input.value = this.settings[key];
            input.style.width = "100%";
            input.oninput = e => {
                this.settings[key] = e.target.value;
                this.saveSettings();
                if (this.settings.enabled) this.sendPresence();
            };

            wrap.appendChild(l);
            wrap.appendChild(input);
            return wrap;
        };

        const toggle = document.createElement("button");
        toggle.textContent = this.settings.enabled ? "Disable RPC" : "Enable RPC";
        toggle.style.marginBottom = "15px";
        toggle.onclick = () => {
            this.settings.enabled = !this.settings.enabled;
            this.saveSettings();
            toggle.textContent = this.settings.enabled ? "Disable RPC" : "Enable RPC";
            this.settings.enabled ? this.startRPC() : this.stopRPC();
        };

        panel.appendChild(toggle);

        panel.appendChild(createInput("Application ID", "applicationId"));
        panel.appendChild(createInput("Name", "name"));
        panel.appendChild(createInput("Details", "details"));
        panel.appendChild(createInput("State", "state"));
        panel.appendChild(createInput("Large Image Key", "largeImage"));
        panel.appendChild(createInput("Large Image Text", "largeText"));
        panel.appendChild(createInput("Small Image Key", "smallImage"));
        panel.appendChild(createInput("Small Image Text", "smallText"));

        return panel;
    }
};
