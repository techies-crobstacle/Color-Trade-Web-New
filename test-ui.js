function getRings() {
  const r1 = 40, c1 = 2 * Math.PI * r1;
  const r2 = 60, c2 = 2 * Math.PI * r2;
  const r3 = 80, c3 = 2 * Math.PI * r3;
  return {c1, c2, c3};
}
console.log(getRings());
