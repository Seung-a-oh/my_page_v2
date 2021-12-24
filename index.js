/**
 * 데이터베이스 사용하기
 * 
 * mongoose로 데이터베이스 다루기
 * 모델 객체에 추가한 메소드를 이용해 사용자 조회, 사용자 추가
 *
 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 * (먼저 사용자 추가 후 로그인해야 함)
 *    http://localhost:3000/public/sign_up.html
 *    http://localhost:3000/public/project.html
 *    http://localhost:3000/public/career.html
 *    http://localhost:3000/public/sns.html
 *    http://localhost:3000/public/guest_book.html
 *    http://localhost:3000/public/index.html
 *
 * @date 2016-11-10
 * @author Mike
 */
//  var jsdom = require("jsdom");
//  const { JSDOM } = jsdom;
//  const { window } = new JSDOM();
//  const { document } = (new JSDOM('')).window;
//  global.document = document;


// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
// script.type = 'text/javascript';
// document.getElementsByTagName('head')[0].appendChild(script);

// const path = require('path');
// app.use('/noe_modules', express.static(path.join(__dirname, "/node_modules")));

// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// global.document = new JSDOM(html).window.document;

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var static = require('serve-static');
var multer = require('multer');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
 
// mongoose 모듈 사용
var mongoose = require('mongoose');
// const { Db } = require('mongodb');


// 익스프레스 객체 생성
var app = express();


// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/image', static(path.join(__dirname, 'image')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));


// 방명록 사진 업로드
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, 'uploads')
	},
	filename: function (req, file, callback) {
		var extension = path.extname(file.originalname);
		var basename = path.basename(file.originalname, extension);
		callback(null, basename + Date.now() + extension);
	}
  });
  
  var upload = multer({ 
	storage: storage,
	limits: {
	files: 10,
	fileSize: 1024 * 1024 * 1024
  }
  });

// src="https://code.jquery.com/jquery-3.6.0.js"

//===== 데이터베이스 연결 =====//

// 데이터베이스 객체를 위한 변수 선언
var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;
var US2;

// 데이터베이스 모델 객체를 위한 변수 선언
var UserModel;
var UM2;

//데이터베이스에 연결
function connectDB() {
	// 데이터베이스 연결 정보
	var databaseUrl = 'mongodb://localhost:27017/saoh';
	 
	// 데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;  // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
	mongoose.connect(databaseUrl);
	database = mongoose.connection;
	
	database.on('error', console.error.bind(console, 'mongoose connection error.'));
	database.on('open', function () {
		console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
		
        
		// 스키마 정의
		UserSchema = mongoose.Schema({
		    id: {type: String, required: true, unique: true},
		    password: {type: String, required: true},
		    name: {type: String,required: true, index: 'hashed'},
			nick: {type: String, required: true, unique: true},
		    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
		    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
		});
		
		US2 = mongoose.Schema({
		    author: {type: String, required: true},
		    contents: {type: String, required: true},
		    // createDate: {type: Date, index: {unique: false}, 'default': Date.now},
		    createDate: {type: String},
			photo: {type: String}
		});

		// 스키마에 static으로 findById 메소드 추가
		UserSchema.static('findById', function(id, callback) {
			return this.find({id:id}, callback);
		});
		
		US2.static('findById', function(id, callback) {
			return this.find({id:id}, callback);
		});

        // 스키마에 static으로 findAll 메소드 추가
		UserSchema.static('findAll', function(callback) {
			return this.find({}, callback);
		});
		
		// 스키마에 static으로 findAll 메소드 추가
		US2.static('findAll', function(callback) {
			return this.find({}, callback);
		});

		console.log('UserSchema 정의함.');
		
		// UserModel 모델 정의
		UserModel = mongoose.model("sas", UserSchema);
		UM2 = mongoose.model("sa_guests", US2);
		console.log('UserModel 정의함.');
		
		
	});
	
    // 연결 끊어졌을 때 5초 후 재연결
	database.on('disconnected', function() {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
        setInterval(connectDB, 5000);
    });
}



// 라우터 객체 참조
var router = express.Router();

// 방명록을 읽어오는 함수
router.route('/process/guestlist').post(function(req, res) {
	console.log("/process/guestlist 호출됨.");
  		
		if (database) {
			// 1. 모든 사용자 검색
			UM2.findAll(function(err, results) {
				// 에러 발생 시, 클라이언트로 에러 전송
				if (err) {
					console.error('사용자 리스트 조회 중 에러 발생: ' + err.stack);
					
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
					res.write('<p>' + err.stack + '</p>');
					res.end();
					
					return;
				}
				  
				if (results) {  // 결과 객체 있으면 리스트 전송
					console.log('point 1')
					console.dir(results);
					console.log(results.length)
					console.log(results[0]._doc.photo)
	 
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>방명록</h2>');
					res.write('<div><ul>');
					
					for (var i = 0; i < results.length; i++) {
						res.write('<div><p>작성자 : ' + results[i]._doc.author + '</p></div>');
						res.write('<div><p>내용 : ' + results[i]._doc.contents + '</p></div>');
						res.write('<div><p>작성일시 : ' + results[i]._doc.createDate + '</p></div>');
						if (results[i]._doc.photo != '') {
							res.write('<div><img src="../uploads/' + results[i]._doc.photo + '"  width="200px"></div>');			
						}
						res.write('<hr>');			
					}	
				
					res.write('</ul></div>');
					res.end();
				} else {  // 결과 객체가 없으면 실패 응답 전송
					console.log('point 2')
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>사용자 리스트 조회  실패</h2>');
					res.end();
				}
			});
		} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>데이터베이스 연결 실패</h2>');
			res.end();
		}

  });



//===== 라우팅 함수 등록 =====//
// 방명록 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/process/guest').post(upload.array('photo', 1), function(req, res) {
	console.log("/process/guest 호출됨.");
	
	// 요청 파라미터 확인
	var paramAuthor = req.body.author || req.query.author;
	// var paramCreateDate = req.body.createDate || req.query.createDate;
	var paramContents = req.body.contents || req.query.contents;
	
	console.log("요청 파라미터 : " + paramAuthor + ", " + paramContents);
	var files = req.files;
	console.dir('#===== 업로드된 첫번째 파일 정보 =====#')
	console.dir(req.files[0]);
	console.dir('#=====#')
  
		// 현재의 파일 정보를 저장할 변수 선언
		  var originalname = '',
			paramPhoto = '',
			  mimetype = '',
			  size = 0;
		  
		  if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
			  console.log("배열에 들어있는 파일 갯수 : %d", files.length);
			  
			  for (var index = 0; index < files.length; index++) {
				  originalname = files[index].originalname;
				  paramPhoto = files[index].filename;
				  mimetype = files[index].mimetype;
				  size = files[index].size;
			  }
  
			  console.log('현재 파일 정보 : ' + originalname + ', ' + paramPhoto + ', ' + mimetype + ', ' + size);
  
	  } else {
			console.log('업로드된 파일이 배열에 들어가 있지 않습니다.');
	  }
	
  
	// 데이터베이스 객체가 초기화된 경우, insertMemo 함수 호출하여 메모 추가
	if (database) {
		insertMemo(paramAuthor, paramContents, paramPhoto, function (err, result) {
		  if (err) {
			throw err;
		  }
  
		  // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
		  if (result.insertedCount > 0) {
			console.log("===== result의 내용 시작 =====");
			console.dir(result);
			console.log("===== result의 내용 끝 =====");
  
			res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });

			res.write('<h1>방명록이 작성되었습니다..</h1>');
			res.write('<div><p>작성자 : ' + paramAuthor + '</p></div>');
			res.write('<div><p>내용 : ' + paramContents + '</p></div>');
			if (paramPhoto != '') {
				res.write('<div><img src="../uploads/' + paramPhoto + '"  width="300px"></div>');			
			}
			res.write("<br><br><a href='/public/guest_book.html'>다시 작성하기</a>");

			res.end();
 
		  } else {
			// 결과 객체가 없으면 실패 응답 전송
			res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
			res.write("<h2>메모 추가  실패</h2>");
			res.end();
		  }
		});
	} else {
	  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
	  res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
	  res.write("<h2>데이터베이스 연결 실패</h2>");
	  res.end();
	}
  });



// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/process/login').post(function(req, res) {
	console.log('/process/login 호출됨.');

	// 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
	
    // 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (database) {
		authUser(database, paramId, paramPassword, function(err, docs) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('로그인 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
            // 조회된 레코드가 있으면 성공 응답 전송
			if (docs) {
				console.dir(docs);

                // 조회 결과에서 사용자 이름 확인
				var username = docs[0].name;
				
				// window.onload = function() {
				// 	var link = 'index.html';
 
				// 	location.href=link;
				// 	location.replace(link);
				// 	window.open(link);

				// 	var user = document.getElementById('t');
					
				// 	user.innerHTML = username;
				// }

				// $(document).ready(function(){
				// 	$('.t').text('<p>changed</p>')
				// })

				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인 성공</h1>');
				
				var a = username;
				// res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
				res.write('<div><p>' + username + '님 환영합니다!</p></div>');
				res.write("<br><br><a href='/public/index_login.html'>메인 화면으로 돌아가기</a>");
				res.end();
			
			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인  실패</h1>');
				res.write('<div><p>아이디 혹은 패스워드가 일치하지 않습니다.</p></div>');
				res.write("<br><br><a href='/public/index.html'>메인화면으로 돌아가기</a>");
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}
	
});


// 사용자 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/process/adduser').post(function(req, res) {
	console.log('/process/adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    var paramNick = req.body.nick || req.query.nick;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName+ ', ' + paramNick);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (database) {
		addUser(database, paramId, paramPassword, paramName, paramNick, function(err, addedUser) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>중복된 아이디입니다. 다른 아이디를 사용해주세요.</p>');
				res.write("<br><br><a href='/public/adduser.html'>이전 화면으로 돌아가기</a>");
				res.end();
                
                return;
            }
			
            // 결과 객체 있으면 성공 응답 전송
			if (addedUser) {
				console.dir(addedUser);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>회원 가입이 완료되었습니다.</h2>');
				res.write("<br><br><a href='/public/index.html'>메인화면으로 돌아가기</a>");
				res.end();
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});

// 사용자 수정 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스의 사용자 정보 수정 
// app.post('/process/updateuser', function(req, res) { 
	router.route('/process/updateuser').post(function(req, res) { 
		console.log('/process/updateuser 호출됨.'); 

		var paramId = req.body.id || req.query.id; 
		var paramPassword = req.body.password || req.query.password; 
		var paramNewPassword = req.body.newpassword || req.query.newpassword; 

		console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword+ ', ' + paramNewPassword); 
	   
		// 데이터베이스 객체가 초기화된 경우, updateUser 함수 호출하여 사용자 추가 
		if (database) { 
			updateUser(database, paramId, paramPassword,paramNewPassword, function(err, result) { 
				if (err) {throw err;} 
				if (result && result.modifiedCount > 0) { 
					console.dir(result); 
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'}); 
					res.write('<h2>비밀번호가 변경되었습니다.</h2>'); 
					res.write('<a href="/public/private.html">이전 페이지로 돌아가기</a>'); 
					// res.write('<a href="/public/index.html">메인 화면으로 돌아가기</a>'); 
					res.end(); 
				} 
				else { 
					// alert('비밀번호가 일치하지 않습니다.')
				} 
			}); 
		} 
		else { 
			// 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송 
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'}); 
			res.write('데이터베이스 연결 실패'); 
			res.end(); 
		} 
	}); 

router.route('/process/deleteuser').post(function(req, res) { 
    console.log('/process/deleteuser 호출됨.'); 
    var paramId = req.body.id || req.query.id; 
    var paramPassword = req.body.password || req.query.password; 

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword); 
   
    // 데이터베이스 객체가 초기화된 경우, deleteuser 함수 호출하여 사용자 추가 
    if (database) { 
		deleteUser(database, paramId, paramPassword, function(err, deletedUser) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 삭제 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 삭제 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
            // 결과 객체 있으면 성공 응답 전송
			if (!deletedUser) {
				console.dir(deletedUser);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 삭제 실패</h2>');
				res.end();
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 삭제 성공</h2>');
				res.write('<p>안녕히가십쇼.</p>');
				res.write('<a href="/public/private.html">이전 페이지로 돌아가기</a>'); 
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
    } 
});

//사용자 리스트 함수
router.route('/process/listuser').post(function(req, res) {
	console.log('/process/listuser 호출됨.');

    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database) {
		// 1. 모든 사용자 검색
		UserModel.findAll(function(err, results) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 리스트 조회 중 에러 발생: ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			  
			if (results) {  // 결과 객체 있으면 리스트 전송
				console.dir(results);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>함께하는 멤버들이에요!</h2>');
				res.write('<div><ul>');
				
				for (var i = 0; i < results.length; i++) {
					var curId = results[i]._doc.id;
					var curName = results[i]._doc.name;
					var curNick = results[i]._doc.nick;
					res.write('    <li>' + i + ' : ' + curId + ', ' + curName + ', ' + curNick+ '</li>');
				}	
			
				res.write('</ul></div>');
				res.end();
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});


// 라우터 객체 등록
app.use('/', router);



var insertMemo = function(author, contents, photo, callback) {
	console.log('insertMemo 호출됨 : ' + author + ', ' + contents + ', ' + photo);
	
	let today = new Date();   

	let year = today.getFullYear(); // 년도
	let month = today.getMonth() + 1;  // 월
	let date = today.getDate();  // 날짜
	let hours = today.getHours(); // 시
	let minutes = today.getMinutes();  // 분
	let seconds = today.getSeconds();  // 초

	var now = year + '/' + month + '/' + date + " " + hours + ':' + minutes + ':' + seconds;

	var users = database.collection('sa_guests');

	// id, password, username을 이용해 사용자 추가
	users.insertMany([{author:author, contents:contents, createDate:now, photo:photo}], function(err, result) {
		if (err) {  // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
		// 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
		if (result.insertedCount > 0) {
			console.log("사용자 메모가 추가됨 : " + result.insertedCount);
			callback(null, result)
			// console.log("여기는 result입니다"+result+"출력 끗!");
		} else {
			console.log("추가된 메모가 없음.");
		}
				
	});

  };


// 사용자를 인증하는 함수 : 아이디로 먼저 찾고 비밀번호를 그 다음에 비교하도록 함
var authUser = function(database, id, password, callback) {
	console.log('authUser 호출됨 : ' + id + ', ' + password);
	
    // 1. 아이디를 이용해 검색
	UserModel.findById(id, function(err, results) {
		if (err) {
			callback(err, null);
			return;
		}
		
		console.log('아이디 [%s]로 사용자 검색결과', id);
		console.dir(results);
		
		if (results.length > 0) {
			console.log('아이디와 일치하는 사용자 찾음.');
			
			// 2. 패스워드 확인
			if (results[0]._doc.password === password) {
				console.log('비밀번호 일치함');
				callback(null, results);
			} else {
				console.log('비밀번호 일치하지 않음');
				callback(null, null);
			}
			
		} else {
	    	console.log("아이디와 일치하는 사용자를 찾지 못함.");
	    	callback(null, null);
	    }
		
	});
	
}


//사용자를 추가하는 함수
var addUser = function(database, id, password, name, nick, callback) {
	console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name +','+nick);
	
	// UserModel 인스턴스 생성
	var user = new UserModel({"id":id, "password":password, "name":name,"nick":nick});

	// save()로 저장 : 저장 성공 시 addedUser 객체가 파라미터로 전달됨
	user.save(function(err, addedUser) {
		if (err) {
			callback(err, null);
			return;
		}
		
	    console.log("사용자 데이터 추가함.");
	    callback(null, addedUser);
	     
	});
};


//사용자를 업데이트 하는 함수
var updateUser = function(database, id, password, newpassword, callback) {
	console.log('updateUser 호출됨 : ' + id + ', ' + password+ ', ' + newpassword); 
   
	// users 컬렉션 참조 
   var users = database.collection('sas'); 
   console.log('updateUser : sas 컬렉션 참조'); 
   
	UserModel.where({id:id, password:password}).updateOne({password:newpassword},function(err, updatedUser) {
		if (err) {
			callback(err, null);
			return;
		}
		
		console.log("사용자 데이터 업데이트함.");
		callback(null, updatedUser);
		
	});
} 


var deleteUser = function(database, id, password, callback) {
    console.log('deleteUser 호출됨 : ' + id + ', ' + password); 
   
    // users 컬렉션 참조 
	var users = database.collection('sas'); 
	console.log('deleteUser : sas 컬렉션 참조'); 
   
	users.deleteOne({id:id, password:password}, function(err, result) {
       // 삭제하려면 deleteMany 사용하면 됨
       if (err) { 
           console.log(err); callback(err, null); return; 
       } 
       // 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달 
       if (result.deletedCount > 0) {
           // 삭제 했을 때는 deleted??
           console.log("사용자 레코드 삭제됨 : " + result.deletedCount); 
		  
       } 
       else { 
           console.log("삭제된 레코드가 없음."); 
		   console.log(result);
       } 
       callback(null, result);
   });
}

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database) {
		database.close();
	}
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

  // 데이터베이스 연결을 위한 함수 호출
  connectDB();
   
});

app.get('/',function(req, res){
	fs.readFile('index.html',function(error,data){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(data);
	})
})
