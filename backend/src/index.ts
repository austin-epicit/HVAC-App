import http from "http";
import "dotenv/config";

const server = http.createServer((req, res) => {
	res.writeHead(200, { "content-type": "application/json" });
	res.end(JSON.stringify({ hello: "world" }));
});

let port: string | undefined = process.env["SERVER_PORT"];
if (!port) {
	console.warn("No port configured. Defaulting...");
	port = "3000";
}

server.listen(port, () => console.log(`Listening on port ${port}`));
