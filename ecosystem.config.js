module.exports = {
    apps: [{
        name: "bezalos.lt",
        script: "./server.js",
        log_file: "./logs/combined.log",
        out_file: "./logs/out.log",
        error_file: "./logs/error.log",
        merge_logs: true,
        time: true,
        autorestart: true,
        // watch: true,
        time: true,
        // ignore_watch: ["logs"],
        instances: "max",
        exec_mode: "cluster"
    }]
  }