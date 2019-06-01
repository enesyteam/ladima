var path = require('path');

exports.sale = function (req, res) {
	res.sendFile(path.join(__dirname, 'index2.html'));
};

exports.index = function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
  // console.log(res);
};