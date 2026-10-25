import { app } from './app';

const port = process.env.PORT;

if (!port) {
  console.error('FATAL ERROR: PORT environment variable is not defined.');
  process.exit(1);
}

const parsedPort = parseInt(port, 10);

if (isNaN(parsedPort)) {
  console.error('FATAL ERROR: PORT environment variable must be a valid number.');
  process.exit(1);
}

app.listen(parsedPort, () => {
  console.log(`Server is listening on port ${parsedPort}`);
});