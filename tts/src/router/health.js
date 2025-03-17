const health = async (req, res) => {
  return res.json({
    status: "OK",
  });
};

module.exports = {
  health,
};
