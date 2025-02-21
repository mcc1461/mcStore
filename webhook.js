
const http = require("http");
const { exec } = require("child_process");

const server = http.createServer((req, res) => {
    if (req.method === "POST") {
        exec("/var/www/mcStore/deploy.sh", (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
        });
    }
    res.end();
});

server.listen(9000, () => console.log("Webhook server running on port 9000"));

