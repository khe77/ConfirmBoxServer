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
var crypto = require('crypto');
router.post('/login', function(req, res) {
	var en = req.body.en;
	var pw = req.body.pw;
	var hash = crypto.createHash('sha256').
		update(pw).digest('base64');
	console.log('en='+en+',pw='+pw);
	connection.query(
		'select en,name,pw from users where en=? and pw=?',
		[ en,hash ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					console.log(JSON.stringify(results[0]));
					res.send(JSON.stringify(results[0]));	
				} else {
					res.send(JSON.stringify({}));
				}				
			}
		});
});

router.get('/user',function(req,res) {
	connection.query('select * from users', 
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(results));
			}
		});
});

router.get('/user/:en',function(req,res){
	connection.query('select * from users where en=?',
		[ req.params.en ], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results[0]));
				} else {
					res.send(JSON.stringify({}));
				}
				
			}
		});
});

router.post('/user',function(req,res){
	var pw = req.body.pw;
	var hash = crypto.createHash('sha256').
		update(pw).digest('base64');
	connection.query(
		'insert into users(en,name,pw) values(?,?,?)',
		[ req.body.en, req.body.name, hash ], 
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.put('/user/:en',function(req,res){
	var pw = req.body.pw;
	var hash = crypto.createHash('sha256').
		update(pw).digest('base64');
	connection.query(
		'update users set name=?,pw=? where en=?',
		[ req.body.name, hash, req.params.en ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.delete('/user/:en',function(req,res){
	connection.query('delete from users where en=?',
		[ req.params.en ], function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.get('/confirm', function(req, res) {
	connection.query(
'select confirm.en           as en           ' +
'    ,  confirm.task_id      as task_id      ' +
'    ,  confirm.cfm_seq      as cfm_seq      ' +
'    ,  confirm.cfm_en       as cfm_en       ' +
'    ,  users.name           as cfm_name     ' +
'    ,  confirm.cfm_title    as cfm_title    ' +
'    ,  confirm.cfm_text     as cfm_text     ' +
'from   confirm                              ' +
'left join users                             ' +
'on     confirm.cfm_en = users.en            ' +
'where  confirm.en=?                         ' +
'and    confirm.task_id=?                    ' +
'and    confirm.cfm_seq=?                    ',
		[ req.query.en, req.query.task_id, req.query.cfm_seq ],
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
		});
});

router.post('/confirm', function(req, res) {
	var cfm_seq = '';
	connection.query(
		'select ifnull(max(cfm_seq)+1, 1) as cfm_seq from confirm where en=? and task_id=?',
		[ req.body.en, req.body.task_id ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				cfm_seq = results[0].cfm_seq;			
			}
		});
	connection.query(
		'insert into confirm(en,task_id,cfm_seq,cfm_en,cfm_title,cfm_text) values(?,?,?,?,?,?)',
		[ req.body.en, req.body.task_id, cfm_seq, req.body.cfm_en, req.body.cfm_title, req.body.cfm_text ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.delete('/confirm', function(req, res) {
	connection.query(
		'delete from confirm where en=? and task_id=? and cfm_seq=? ',
		[ req.body.en, req.body.task_id, req.body.cfm_seq ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.put('/confirm', function(req, res) {
	connection.query(
		'update confirm set cfm_yn="Y",cfm_opinion=? where en=? and task_id=? and cfm_seq=?',
		[ req.body.en, req.body.task_id, req.body.cfm_seq, req.body.cfm_opinion ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.put('/reject', function(req, res) {
	connection.query(
		'update confirm set cfm_yn="N",cfm_opinion=? where en=? and task_id=? and cfm_seq=?',
		[ req.body.en, req.body.task_id, req.body.cfm_seq, req.body.cfm_opinion ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});

router.get('/confirms', function(req, res) {
	var en = req.query.en;
	connection.query(
'select confirm.en           as en           ' +
'    ,  confirm.task_id      as task_id      ' +
'    ,  confirm.cfm_seq      as cfm_seq      ' +
'    ,  confirm.cfm_en       as cfm_en       ' +
'    ,  users.name           as cfm_name     ' +
'    ,  confirm.cfm_title    as cfm_title    ' +
'    ,  confirm.cfm_text     as cfm_text     ' +
'from   confirm                              ' +
'left join users                             ' +
'on     confirm.cfm_en = users.en            ' +
'where  confirm.en=?                         ' +
'and    confirm.cfm_yn is null               ',
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
		});
});

router.put('/confirms', function(req, res) {
	var confirmData = req.body.confirmData;
	    confirmData = JSON.parse(confirmData);
	var results = [];
	for(var i = 0; i < confirmData.length; i++ ) {
        var data = confirmData[i];
        connection.query(
			'update confirm set cfm_yn="Y",cfm_opinion="결재" where en=? and task_id=? and cfm_seq=?',
			[ data.en, data.task_id, data.cfm_seq ],
			function(err,result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					results[i] = result;
					//res.send(JSON.stringify(result));
				}
			});
    }
    res.send(JSON.stringify(results));
});

router.put('/rejects', function(req, res) {
	var rejectData = req.body.rejectData;
	    rejectData = JSON.parse(rejectData);
	var results = [];
	for(var i = 0; i < rejectData.length; i++ ) {
        var data = rejectData[i];
        connection.query(
			'update confirm set cfm_yn="N",cfm_opinion="반려" where en=? and task_id=? and cfm_seq=?',
			[ data.en, data.task_id, data.cfm_seq ],
			function(err,result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					res.send(JSON.stringify(result));
				}
			});
    }
    res.send(JSON.stringify(results));
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
					res.send(JSON.stringify(results));
				} else {
					res.send(JSON.stringify({}));
				}
			}
		});
});

router.put('/pushset', function(req, res) {
	var en = req.body.en;
	var results = [];
	var pushsetData = req.body.pushsetData;
		pushsetData = JSON.parse(pushsetData);
	for (var i = 0; i < pushsetData.length; i++) {
		var data = pushsetData[i]
		connection.query(
			'select a.en, a.task_id, a.push_yn, b.task_name from pushsets a right outer join task b on a.task_id = b.task_id where a.en = ? and a.task_id = ?',
			[ req.body.en, data.task_id ],
			function(err,results,fields) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					if (results.length > 0) {
						connection.query(
							'update pushsets set push_yn=? where en=? and task_id=?',
							[ data.push_yn, req.body.en, data.task_id ],
							function(err,result) {
								if (err) {
									res.send(JSON.stringify(err));
								} else {
									results[i] = result;
								}
							});
					} else {
						connection.query(
							'insert into pushsets(en,task_id,push_yn) values(?,?,?)',
							[ req.body.en, data.task_id, data.push_yn ],
							function(err,result) {
								if (err) {
									res.send(JSON.stringify(err));
								} else {
									results[i] = result;
								}
							});
					}
				}
			});
	}
	res.send(JSON.stringify(results));
});

module.exports = router;
