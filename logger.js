const log4js = require('log4js');
const config = require('./config');

const {sender, recipient, host, port, username, password} = config.smtpConfig;

log4js.configure({
  appenders: {
    app: {
      type: 'file',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c - %m'
      },
      filename: 'error.log'
    },
    email: {
      type: 'smtp',
      smtp: {
        host: host,
        port: port,
        auth: {
          user: username,
          pass: password
        }
      },
      recipients: recipient,
      subject: 'Errore con vesuvianabot',
      sender: sender,
      attachment: {
        enable: true,
        filename: 'latest.log',
        message: 'guarda i log'
      },
      sendInterval: 1
    }
  },
  categories: {
    default: {
      appenders: ['email', 'app'],
      level: 'error'
    }
  }
});
