//undertail code)
//ver: 0.0.1 (30.05.2022)

//БЛОК ПЕРЕМЕННЫХ
//переменные wsh
var shell = WScript.CreateObject("WScript.Shell");
var fs = WScript.CreateObject("Scripting.FileSystemObject");

//холст
var canvas = new Gl2Canvas("main-canvas", "black", 658, 478);
canvas.init();

//БЛОК SAVE-ФАЙЛОВ
//файл не найден
if(!fs.FileExists("data/saves/file1.save")){
	fs.CopyFile("data/saves/file0.save", "data/saves/file1.save", true);
}
//парсинг файла
var file = JSON.parse(fs.OpenTextFile("data/saves/file1.save", 1).ReadAll());

if(fs.FileExists("data/saves/file9.save")){
	var tf = fs.OpenTextFile("data/saves/file9.save")
	window.tmpsave = JSON.parse(tf.ReadAll());
	tf.Close();
	for(var i in tmpsave){
		if(i == "isRoom") continue;
		file[i] = tmpsave[i];
	}
	
	setTimeout(function(){ fs.DeleteFile("data/saves/file9.save", true); }, 300);
}

var room = JSON.parse(fs.OpenTextFile("data/rooms/" + file.room + ".room", 1).ReadAll());

if(window.tmpsave && window.tmpsave.isRoom){
	file.x = room.spawn[0];
	file.y = room.spawn[1];
}

if(room.music){
	var a = new Audio(room.music);
	a.loop = true;
	a.play();
}

for(var i in room.objects){
	var obj = room.objects[i];
	var rand = new Date().getTime();
	if(obj.type == "object"){
		var o = new Gl2Object(obj.x, obj.y, obj.width, obj.height, obj.data);
		o.draw(canvas);
		o.onclick(eval("(function(){" + obj.onclick + "})"));
	}else if(obj.type == "entity"){
		var e = new Gl2Entity(obj.x, obj.y, obj.width, obj.height, obj.data);
		e.loadAnimations();
		e.draw(canvas);
		e.onclick(eval("(function(){" + obj.onclick + "})"));
	}
}
//ОСНОВНОЙ БЛОК

//создание и настройка игрока

var player = new Gl2Entity(file.x, file.y, 75, 75, {name: "player", texture: "data/textures/entity/player/player.png", health: file.health, animation: {left: ["data/textures/entity/player/animation/left1.png","data/textures/entity/player/animation/left2.png"], top: ["data/textures/entity/player/animation/top1.png","data/textures/entity/player/animation/top2.png"], right: ["data/textures/entity/player/animation/right1.png","data/textures/entity/player/animation/right2.png"], bottom: ["data/textures/entity/player/animation/bottom1.png","data/textures/entity/player/animation/bottom2.png"]}});
player.loadAnimations();
player.draw(canvas);
player.bind({left:"a",top:"w",right:"d",bottom:"s"}, 3, 400);

//БЛОК ФУНКЦИЙ
function message(text, dur){
	msgd.style.display = "block";
	msgd.innerHTML = text;
	setTimeout(function(){
		msgd.style.display = "none";
	}, dur);
}

function save(){
	file.x = player.x; file.y = player.y;
	
	var f = fs.OpenTextFile("data/saves/file1.save", 2);
	f.Write(JSON.stringify(file));
	f.Close();
	
	message("Файл сохранен", 1000);
}

function dialog(texts, img, btns, faft, delay){
	var i = 0;
	window.text = texts[0][0];
	dlg.style.display = "block";
	
	dlgimg.src = img;
	
	function showText(){
		dlgtxt.innerHTML = "";
		
		var a = 0;
		window.selbtn = 0;
		setTimeout(function _(){
			dlgbtns.innerHTML = "";
			dlgtxt.innerHTML += window.text[a];
			
			if(dlgtxt.innerHTML.length < window.text.length){
				a++;
				setTimeout(_, delay);
			}else{
				if(btns[i]){
					for(var j in btns[i]){
						var btn = btns[i][j];
						window.texts = texts;
						dlgbtns.innerHTML += "<button style='margin-left: 30px; margin-right: 30px' onclick='window.text = window.texts["+(i+1)+"]["+j+"]'>"+btn+"</button>";
					}
				}

				i++;

				if(i >= texts.length){
					dlg.onclick = function(){ dlg.style.display = "none"; faft(); };
				}else{
					if(!btns[i]) window.text = texts[i][0];
					dlg.onclick = showText;
				}
				
				a = 0;
				window.selbtn = 0;
			}
		}, delay);
	}
	showText();
}

function goToRoom(name){
	file.room = name;
	file.isRoom = true;
	var f = fs.CreateTextFile("data/saves/file9.save", true);
	f.Write(JSON.stringify(file));
	f.Close();
	
	location.reload();
}

function battle(name){
	var f = fs.CreateTextFile("data/saves/file9.save", true);
	f.Write(JSON.stringify(file));
	f.Close();

	setTimeout(function(){
		shell.Run('cmd /c "battle.hta '+name+'"', 0);
		window.close();
	}, 400);
}