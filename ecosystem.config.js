module.exports = {
    apps: [{
      name: "Be žalos",
      script: "./server.js",
      error_file: "logs_pm2/error.log",    // Make sure these paths exist
      out_file: "logs_pm2/out.log",
      log_file: "logs_pm2/combined.log"
    }]
  }