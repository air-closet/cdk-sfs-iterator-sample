exports.handler = async (event: any) => {
  const input = event.param;

  return fizzBuzz(input);
};

function fizzBuzz(input: number) {
  let isFizz = input % 3 === 0;
  let isBuzz = input % 5 === 0;

  if (isFizz && isBuzz) {
    return 'fizzBuzz';
  } else if (isFizz) {
    return 'fizz';
  } else if (isBuzz) {
    return 'buzz';
  } else {
    return input + '';
  }
}