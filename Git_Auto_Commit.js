const { exec } = require('child_process');

// For todays date;
Date.prototype.today = function () {
  return (
    this.getFullYear() +
    '-' +
    (this.getMonth() + 1 < 10 ? '0' : '') +
    (this.getMonth() + 1) +
    '-' +
    (this.getDate() < 10 ? '0' : '') +
    this.getDate()
  );
};

// For the time now
Date.prototype.timeNow = function () {
  return (
    (this.getHours() < 10 ? '0' : '') +
    this.getHours() +
    ':' +
    (this.getMinutes() < 10 ? '0' : '') +
    this.getMinutes()
  );
};
var newDate = new Date();

const datetime = `${newDate.today()} ${newDate.timeNow()}`;

function add() {
  exec(`git add .`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    commit();
    console.log(`stdout: ${stdout}`);
  });
}

function commit() {
  exec(`git commit -m "${datetime}" `, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    if (stdout) {
      push();
      console.log(`stdout: ${stdout}`);
    }
  });
}

function push() {
  exec(`git push -u origin main`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

add();
