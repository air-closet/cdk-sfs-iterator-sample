exports.handler = async () => {
  const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

  return {
    fixedVal: 'This parameter is always used as same variable in all iterator.',
    arr,
  };
};
