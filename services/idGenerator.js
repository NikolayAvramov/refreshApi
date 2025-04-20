export default function idGenerator() {
  const randomId = Math.floor(1000000000 + Math.random() * 9000000000);
  return randomId;
}
