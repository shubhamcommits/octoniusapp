const http = require("http");
const app = require("./app")
const chalk = require("chalk");

const port = process.env.PORT || '3000';
const server = http.createServer(app);

server.listen(port, (req, res) => {
    console.log(chalk.greenBright.bold('-----------------------------------------------------'));
    console.log(`${chalk.yellow("Octonius Application")}`);
    console.log(chalk.blue(`Url: ${process.env.host}`));
    console.log(chalk.blue(`Database: ${process.env.dbURL}`));
    console.log(chalk.greenBright.bold('------------------------------------------------------'));
});