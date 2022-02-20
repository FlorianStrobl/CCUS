console.log(
  JSON.parse(
    `{"[${typeof {}} ${(typeof new Date()).replace('o', 'O')}]": ${
      parseInt(
        (100).toString(12 * [...Object.keys({ a: 1, b: 1, c: 1 })].length),
        parseInt('1' + 2) * 3
      ) - 99
    }}`
  )
);
