module.exports = (amount) => {
  if (typeof amount !== "number" || amount <= 0)
    throw new Error("Invalid Amount ... Try again");

  return amount;
};
