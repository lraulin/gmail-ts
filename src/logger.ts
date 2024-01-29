export function log(obj: object): void {
  for (const [key, value] of Object.entries(obj)) {
    console.log("| *************** |");
    console.log(`${key}: ${value}`);
    console.log("| *************** |");
  }
}
