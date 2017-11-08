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
	var device_token = req.body.device_token;
	var hash = crypto.createHash('sha256').
		update(pw).digest('base64');
	console.log('en='+en+',pw='+pw);
	connection.query(
		'select en,name,device_token from users where en=? and pw=?',
		[ en,hash ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					console.log('device_token='+device_token);
					connection.query(
						'update users set device_token=? where en=?',
						[ device_token,en ],
						function(err,result) {
							if (err) {
								res.send(JSON.stringify({}));
							} else {
								res.send(JSON.stringify(results[0]));
							}
						});	
				} else {
					res.send(JSON.stringify({}));
				}				
			}
		});
});

router.get('/user',function(req,res) {
	connection.query('select en,name from users', 
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(results));
			}
		});
});

router.get('/user/:en',function(req,res){
	connection.query('select en,name from users where en=?',
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

var FCM = require('fcm-node');
var serverKey = 'AAAA4sJGHTo:APA91bHQAxhETAlFme2D5sMtJmU_Qp2OdON-BSs3QrsnJH0jLS27Sm7pJLp76PWcQ-VcHBFsgxubPexakiVmUk9tA9xpz6CVsHMcwByGcci5MDgdLw0CzNvnnFbWVqa4kAZD7xJeP0st'; //put your server key here
var fcm = new FCM(serverKey);
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
				connection.query(
					'insert into confirm(en,task_id,cfm_seq,cfm_en,cfm_title,cfm_text) values(?,?,?,?,?,?)',
					[ req.body.en, req.body.task_id, cfm_seq, req.body.cfm_en, req.body.cfm_title, req.body.cfm_text ],
					function(err,result) {
						if (err) {
							res.send(JSON.stringify(err));
						} else {
							var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
						        to: 'ckZ7_7REEZk:APA91bF8ZByGcyHPcbH3Uk1bFMtlGGcd-eXAA4z7rY_zGRVJbufd2NIeclWirytgvno1i6mNz3Q_T9-G3qV9CgEzfEjbhRhZf0JTOafMM72MBRLIOzU40DyMVZt0ZeOOJjMXU7q4Gzlh', 
						        collapse_key: 'shinhan_collapse_key',
						        notification: {
						            title: '결재요청', 
						            body: req.body.cfm_title
						        },				        
						        data: {  //you can send only notification or only data(or include both)
						            data1: 'value1',
						            data2: 'value2'
						        }
						    };
						    fcm.send(message, function(err, response){
						        if (err) {
						            res.send(JSON.stringify({result:false,err:err}));
						        } else {
						        	res.send(JSON.stringify({result:true,response:response}));
						        }
						    });
							/*
							connection.query(
								'select device_token from users where en=?',
								[ req.body.en ], 
								function(err, results, fields) {
									if (err) {
										res.send(JSON.stringify({result:false,err:err}));
									} else {
										if (results.length > 0) {
											var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
										        to: results[0].device_token, 
										        collapse_key: 'shinhan_collapse_key',
										        notification: {
										            title: 'PUSH NOTI TEST', 
										            body: 'this is a body of your push notification' 
										        },				        
										        data: {  //you can send only notification or only data(or include both)
										            data1: 'value1',
										            data2: 'value2'
										        }
										    };
										    fcm.send(message, function(err, response){
										        if (err) {
										            res.send(JSON.stringify({result:false,err:err}));
										        } else {
										        	res.send(JSON.stringify({result:true,response:response}));
										        }
										    });
										} else {
											res.send(JSON.stringify({result:false,err:'do not exist device token'}));
										}
									}
								});
							*/
							//res.send(JSON.stringify(result));
						}
					});			
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
		[ req.body.cfm_opinion, req.body.en, req.body.task_id, req.body.cfm_seq ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify({result:true}));
			}
		});
});

router.put('/reject', function(req, res) {
	connection.query(
		'update confirm set cfm_yn="N",cfm_opinion=? where en=? and task_id=? and cfm_seq=?',
		[ req.body.cfm_opinion, req.body.en, req.body.task_id, req.body.cfm_seq ],
		function(err,result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify({result:true}));
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
	for(var i = 0; i < confirmData.length; i++ ) {
        var data = confirmData[i];
        connection.query(
			'update confirm set cfm_yn="Y",cfm_opinion="결재" where en=? and task_id=? and cfm_seq=?',
			[ data.en, data.task_id, data.cfm_seq ],
			function(err,result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					console.log('result='+JSON.stringify(result));
				}
			});
	    
    }
    res.send(JSON.stringify({result:true}));
});

router.put('/rejects', function(req, res) {
	var rejectData = req.body.rejectData;
	    rejectData = JSON.parse(rejectData);
	for(var i = 0; i < rejectData.length; i++ ) {
        var data = rejectData[i];
        connection.query(
			'update confirm set cfm_yn="N",cfm_opinion="반려" where en=? and task_id=? and cfm_seq=?',
			[ data.en, data.task_id, data.cfm_seq ],
			function(err,result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					console.log('result='+JSON.stringify(result));
				}
			});
    }
    res.send(JSON.stringify({result:true}));
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

var async = require('async');
router.put('/pushset', function(req, res) {
	var en = req.body.en;
	var pushsetData = req.body.pushsetData;
		pushsetData = JSON.parse(pushsetData);

	async.each(pushsetData, processQuery, function(err) {
		if(err) {
			res.send(JSON.stringify(err));
		} else {
			res.send(JSON.stringify({result:true}));
		}
	});	
});

function processQuery(data, doneCallback) {
	connection.query(
		'select en, task_id, push_yn from pushsets where en = ? and task_id = ?',
		[ data.en, data.task_id ],
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					connection.query(
						'update pushsets set push_yn=? where en=? and task_id=?',
						[ data.push_yn, data.en, data.task_id ],
						function(err,result) {
							if (err) {
								console.log(JSON.stringify(err));
								doneCallback(err);
							} else {
								console.log('result='+JSON.stringify(result));
								doneCallback(null);
							}
						});
				} else {
					connection.query(
						'insert into pushsets(en,task_id,push_yn) values(?,?,?)',
						[ data.en, data.task_id, data.push_yn ],
						function(err,result) {
							if (err) {
								console.log(JSON.stringify(err));
								doneCallback(err);
							} else {
								console.log('result='+JSON.stringify(result));
								doneCallback(null);
							}
						});
				}
			}
		});
	
}

module.exports = router;
//key=AAAA4sJGHTo:APA91bHQAxhETAlFme2D5sMtJmU_Qp2OdON-BSs3QrsnJH0jLS27Sm7pJLp76PWcQ-VcHBFsgxubPexakiVmUk9tA9xpz6CVsHMcwByGcci5MDgdLw0CzNvnnFbWVqa4kAZD7xJeP0st
//ckZ7_7REEZk:APA91bF8ZByGcyHPcbH3Uk1bFMtlGGcd-eXAA4z7rY_zGRVJbufd2NIeclWirytgvno1i6mNz3Q_T9-G3qV9CgEzfEjbhRhZf0JTOafMM72MBRLIOzU40DyMVZt0ZeOOJjMXU7q4Gzlh