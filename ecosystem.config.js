module.exports = {
    apps: [{
      name: "Be žalos",
      script: "./server.js",
      error_file: "pm2_logs/error.log",    // Make sure these paths exist
      out_file: "pm2_logs/out.log",
      log_file: "pm2_logs/combined.log"
    }]
  }