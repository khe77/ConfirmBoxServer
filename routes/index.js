var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'test1234',
  database : 'confirmbox'
});
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ConfirmBox' });
});

router.post('/login', function(req, res) {
	var en = req.body.en;
	var pw = req.body.pw;
	connection.query(
		'select en,name,pw from users where en=? and pw=?',
		[ en,pw ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results[0]));	
				} else {
					res.send(JSON.stringify({}));
				}				
			}
		}
	);
});

router.get('/list', function(req, res) {
	var en = req.query.en;
	connection.query(
		'select en,task_id,cfm_seq,cfm_text,cfm_yn,cfm_opinion from confirm where en=?',
		[ en ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results));	
				} else {
					res.send(JSON.stringify({}));
				}				
			}
		}
	);
});

router.put('/confirm', function(req, res) {
	var en = req.body.en;
	var task_id = req.body.task_id;
	var cfm_seq = req.body.cfm_seq;
	var cfm_yn = req.body.cfm_yn;
	var cfm_opinion = req.body.cfm_opinion;
	connection.query(
		'update confirm set cfm_yn=?,cfm_opinion=? where en=? and task_id=? and cfm_seq=?',
		[ en, task_id, cfm_seq, cfm_yn, cfm_opinion ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}
	);
});

router.put('/reject', function(req, res) {
	var en = req.body.en;
	var task_id = req.body.task_id;
	var cfm_seq = req.body.cfm_seq;
	var cfm_yn = req.body.cfm_yn;
	var cfm_opinion = req.body.cfm_opinion;
	connection.query(
		'update confirm set cfm_yn=?,cfm_opinion=? where en=? and task_id=? and cfm_seq=?',
		[ en, task_id, cfm_seq, cfm_yn, cfm_opinion ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}
	);
});

router.get('/view', function(req, res) {
	var en = req.query.en;
	var task_id = req.query.task_id;
	var cfm_seq = req.query.cfm_seq;
	connection.query(
		'select en,task_id,cfm_seq,cfm_text,cfm_yn,cfm_opinion from confirm where en=? and task_id=? and cfm_seq=?',
		[ en, task_id, cfm_seq ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results));	
				} else {
					res.send(JSON.stringify({}));
				}				
			}
		}
	);
});

router.get('/pushset', function(req, res) {
	var en = req.query.en;
	connection.query(
		'select a.en, a.task_id, a.push_yn, b.task_name from pushsets a right outer join task b on a.task_id = b.task_id where a.en = ?',
		[ en ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results[0]));	
				} else {
					res.send(JSON.stringify({}));
				}				
			}
		}
	);
});

router.post('/pushset', function(req, res) {
	var en = req.body.en;
	var pushsets = req.body.pushsets;
		pushsets = JSON.parse(pushsets);
	for (var i = 0; i < pushsets.length; i++) {
		var pushset = pushsets[i]
		pushset.id
		pushset.yn
	}	
	res.send(JSON.stringify({en:en,pushsets:pushsets}));
});

router.put('/pushset', function(req, res) {
	var en = req.body.en;
	var pushsets = req.body.pushsets;
		pushsets = JSON.parse(pushsets);
	for (var i = 0; i < pushsets.length; i++) {
		var pushset = pushsets[i]
		pushset.id
		pushset.yn
	}	
	res.send(JSON.stringify({en:en,pushsets:pushsets}));
});

/*
router.post('/user/login', function(req, res) {
	var id = req.body.id;
	var password = req.body.password;
	res.send(JSON.stringify({id:id,password:password}));
});

router.post('/user', function(req, res) {
	var id = req.body.id;
	var password = req.body.password;
	res.send(JSON.stringify({id:id,password:password}));
});

router.get('/user', function(req, res) {
	var rowid = req.query.rowid;
	res.send(JSON.stringify({rowid:rowid}));
});

router.put('/user', function(req, res) {
	var rowid = req.body.rowid;
	var id = req.body.id;
	var password = req.body.password;
	res.send(JSON.stringify({rowid:rowid,id:id,password:password}));
});

router.delete('/user', function(req, res) {
	var rowid = req.body.rowid;
	res.send(JSON.stringify({rowid:rowid}));
});

router.get('/user/list', function(req, res) {
	res.send(JSON.stringify([]));
});
*/
module.exports = router;
