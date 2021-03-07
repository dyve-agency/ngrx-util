#!/usr/bin/env node

let versions = process.argv.slice(2).map((v) => {
  return v.split(".").map(Number);
});

let ng = versions;
let ngrx = versions;
let exclude = [];

function gte([a1, a2], [b1, b2]) {
  if (a1 < b1) return false;

  return a2 >= b2;
}

for (const vNg of ng) {
  for (const vNgrx of ngrx) {
    if (gte(vNg, vNgrx)) {
      continue;
    }
    exclude.push({
      ng: vNg.join("."),
      ngrx: vNgrx.join("."),
    });
  }
}

console.log(
  JSON.stringify({
    ng: ng.map((v) => v.join(".")),
    ngrx: ngrx.map((v) => v.join(".")),
    exclude,
  }),
);
