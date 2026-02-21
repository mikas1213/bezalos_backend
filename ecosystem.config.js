module.exports = {
    apps: [{
        name: "bezalos.lt",
        script: "./dist/server.js",
        log_file: "./logs/combined.log",
        out_file: "./logs/out.log",
        error_file: "./logs/error.log",
        merge_logs: true,
        time: true,
        autorestart: true,
        watch: false,
        time: true,
        // ignore_watch: ["logs"],
        instances: "max",
        exec_mode: "cluster",
        kill_timeout: 5000,       // Duoti 5s procesui užbaigti darbą prieš SIGKILL
        wait_ready: true,         // Laukti, kol procesas nusiųs 'ready' signalą
        listen_timeout: 10000,    // Laukti 10s, kol procesas pradės klausytis
        max_memory_restart: "1G"
    }]
  }