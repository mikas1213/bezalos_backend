module.exports = {
    apps: [{
      name: "bezalos.lt",
      script: "./server.js",
      error_file: "./logs_pm2/error.log",
      out_file: "./logs_pm2/out.log",
      log_file: "./logs_pm2/combined.log"
    }]
  }