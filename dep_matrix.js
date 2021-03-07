#!/usr/bin/env node

let ng = process.argv[2].split(",").map((v) => {
  return v.split(".").map(Number);
});

let ngrx = process.argv[3].split(",").map((v) => {
  return v.split(".").map(Number);
});
let include = [];

function gte([a1, a2], [b1, b2]) {
  if (a1 < b1) return false;

  return a2 >= b2;
}

for (const vNg of ng) {
  for (const vNgrx of ngrx) {
    if (gte(vNg, vNgrx)) {
      include.push({
        ng: vNg.join("."),
        ngrx: vNgrx.join("."),
      });
    }
  }
}

console.log(
  JSON.stringify({
    include,
  }),
);
