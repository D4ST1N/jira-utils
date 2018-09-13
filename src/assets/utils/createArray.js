export default function createArray(size, mapper = () => 1) {
  return [...Array(size)].map(mapper);
}
