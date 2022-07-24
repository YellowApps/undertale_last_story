//uls code lol
//ЯРИК ЛоШаРа!!!!!!!!!
//ver: 0.0.5 (03.07.2022)

//БЛОК ПЕРЕМЕННЫХ
//переменные wsh
var shell = WScript.CreateObject("WScript.Shell");
var fs = WScript.CreateObject("Scripting.FileSystemObject");
var options = JSON.parse(fs.OpenTextFile("data/options.json", 1).ReadAll());
var items = JSON.parse(fs.OpenTextFile("data/saves/items.json", 1).ReadAll());

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
	a.volume = options.volume;
	a.play();
}

//холст
var canvas = new Gl2Canvas("main-canvas", room.background, 658, 478);
canvas.init();

for(var i in room.objects){
	var obj = room.objects[i];
	var rand = new Date().getTime();
	if(obj.type == "object"){
		var o = new Gl2Object(obj.x, obj.y, obj.width, obj.height, obj.data);
		o.draw(canvas);
		if(obj.onclick) o.onclick(eval("(function(){ if(Gl2Objects.player.isCollided('any', Gl2Objects."+obj.data.name+"))" + obj.onclick + "; })"));
	}else if(obj.type == "entity"){
		var e = new Gl2Entity(obj.x, obj.y, obj.width, obj.height, obj.data);
		e.loadAnimations();
		e.draw(canvas);
		if(obj.onclick) e.onclick(eval("(function(){ if(Gl2Objects.player.isCollided('any', Gl2Objects."+obj.data.name+"))" + obj.onclick + "; })"));
	}
}
//ОСНОВНОЙ БЛОК

//создание и настройка игрока

var player = new Gl2Entity(file.x, file.y, 50, 75, {name: "player", texture: "data/textures/entity/player/player.png", health: file.health, animation: {left: ["data/textures/entity/player/animation/left1.png","data/textures/entity/player/animation/left2.png"], top: ["data/textures/entity/player/animation/top1.png","data/textures/entity/player/animation/top2.png"], right: ["data/textures/entity/player/animation/right1.png","data/textures/entity/player/animation/right2.png"], bottom: ["data/textures/entity/player/animation/bottom1.png","data/textures/entity/player/animation/bottom2.png"]}});
player.loadAnimations();
player.draw(canvas);
player.bind({left:"Left",top:"Up",right:"Right",bottom:"Down"}, 3, 400);

if(room.script){
	var scr = fs.OpenTextFile(room.script, 1);
	eval(scr.ReadAll());
	scr.Close();
}

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
	
	var a = new Audio("data/sounds/save.mp3");
	a.play();
	
	message("Файл сохранен", 1000);
}

function dialog(texts, img, btns, funcs, faft, delay, voice, dbl){
	var i = 0;
	window.text = texts[0][0];
	dlg.style.display = "block";
	dlg.onclick = null;
	window.onekydown = null;
	
	if(!voice) voice = "data/sounds/voice/default.mp3";
	var aud = new Audio(voice);
	aud.loop = true;
	aud.play();
	
	if(img){
		dlgimg.style.display = "inline";
		dlgimg.src = img;
	}else{
		dlgimg.style.display = "none";
	}
	
	function showText(){
		dlgtxt.innerHTML = "";
		aud.play();
		var a = 0;
		window.selbtn = 0;
		window.dtm = setTimeout(function _(){
			dlg.onclick = null;
			window.onkeyup = null;
			dlgbtns.innerHTML = "";
			dlgtxt.innerHTML += window.text[a];
			
			if(dlgtxt.innerHTML.length < window.text.length){
				a++;
				window.dtm = setTimeout(_, delay);
			}else{
				if(btns[i]){
					for(var j in btns[i]){
						var btn = btns[i][j];
						var li = Math.floor(i+1);
						window.texts = texts;
						if(funcs[i] && !dbl){
							dlgbtns.innerHTML += "<button style='margin-left: 30px; margin-right: 30px' onclick='"+funcs[i][j]+"'>"+btn+"</button>";
						}else if(funcs[i] && dbl){
							dlgbtns.innerHTML += "<button style='margin-left: 30px; margin-right: 30px' onclick='window.text = window.texts["+(li)+"]["+j+"]; "+funcs[i][j]+"'>"+btn+"</button>";
						}else{
							dlgbtns.innerHTML += "<button style='margin-left: 30px; margin-right: 30px' onclick='window.text = window.texts["+(li)+"]["+j+"]'>"+btn+"</button>";
						}
					}
				}
				
				if(i >= texts.length){
					aud.pause();
					dlg.onclick = function(){ dlg.style.display = "none"; faft(); };
					window.onkeyup = function(e){if(e.key == "Enter") dlg.onclick(); window.onkeyup = keyDown;}
				}else{
					try{
						if(!btns[i]) window.text = texts[i+1][0];
						aud.pause();
						dlg.onclick = showText;
						if(!btns[i]) window.onkeyup = function(e){if(e.key == "Enter") dlg.onclick(); window.onkeyup = keyDown;}
					}catch(e){
						aud.pause();
						dlg.onclick = function(){ dlg.style.display = "none"; faft(); };
						window.onkeyup = function(e){if(e.key == "Enter") dlg.onclick(); window.onkeyup = keyDown;}
					}
				}
				i++;
				
				a = 0;
				window.selbtn = 0;
			}
		}, delay);
	}
	showText();
}

function dialog_old(texts, img, btns, faft, delay){
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

menuName.innerHTML = file.name;

setInterval(function(){
	menuStatsLV.innerHTML = file.level;
	menuStatsHP.innerHTML = file.health;
}, 300);

var menuShowed = false;
var menuItemsShowed = false;
var menuStatsShowed = false;
var menuDevModeShowed = false;
var selectedItem = null;

menuItemsBtn.onclick = function(){
	menuItemsShowed = !menuItemsShowed;
	menuItems.style.display = (menuItemsShowed?"block":"none");
	
	menuItemsDiv.innerHTML = "";
	for(var i in items){
		var item = items[i];
		menuItemsDiv.innerHTML += "<button id='menuItemsItem"+i+"' onclick='selectItem("+i+")'>"+item.name+"</button><br>";
	}
}

function setItems(){
	var f = fs.OpenTextFile("data/saves/items.json", 2);
	f.Write(JSON.stringify(items));
	f.Close();
}

function selectItem(num){
	selectedItem = num;
	for(var i in items){
		document.getElementById("menuItemsItem"+i).style.color = "white";
	}
	document.getElementById("menuItemsItem"+num).style.color = "yellow";
}

menuItemsUse.onclick = function(){
	if(!selectedItem && typeof selectedItem != "number") return;
	var item = items[selectedItem];
	
	var useText = "";
	if(item.onuse) eval(item.onuse);
	if(item.heal){
		useText = "Вы съели "+item.name+".\nВы восстановили "+item.heal+" ОЗ!";
		file.health += item.heal;
		items.splice(selectedItem, 1);
	}else if(item.atk){
		useText = "Вы экипировали "+item.name+".\nВаша атака теперь равна "+item.atk+".";
		file.atk = item.atk;
		items.splice(selectedItem, 1);
	}else{
		useText = "Вы использовали "+item.name+".";
		if(item.disposable) items.splice(selectedItem, 1);
	}
	dialog([[useText]], null, {}, {}, function(){}, 70, null, false);
	setItems();
	resetMenu();
}

menuItemsInfo.onclick = function(){
	if(!selectedItem && typeof selectedItem != "number") return;
	var item = items[selectedItem];
	
	var info = "";
	if(item.onlyText){
		info = item.infoText;
	}else if(item.heal){
		info = item.name+": Лечит "+item.heal+" ОЗ."
	}else if(item.atk){
		info = item.name+": Оружие "+item.atk+" АТК."
	}
	if(item.infoText) info += "\n"+item.infoText;
	
	resetMenu();
	dialog([[info]], null, {}, {}, function(){}, 70, null, false);
}

menuItemsDrop.onclick = function(){
	if(!selectedItem && typeof selectedItem != "number") return;
	
	resetMenu();
	items.splice(selectedItem, 1);
	setItems();
}

menuStatsBtn.onclick = function(){
	menuStatsShowed = !menuStatsShowed;
	menuStats.style.display = (menuStatsShowed?"block":"none");
	
	menuStats.innerHTML = file.name+"<br>УР: "+file.level+"<br>ОЗ: "+file.health+"<br>EXP: "+file.exp+"<br>АТК: "+file.atk+"<br>Монеты: "+file.gold
}

menuDevModeBtn.onclick = function(){
	menuDevModeShowed = !menuDevModeShowed;
	menuDevMode.style.display = (menuDevModeShowed?"block":"none");
}

function resetMenu(){
	menuShowed = false;
	menu.style.display = "none";
	menuItems.style.display = "none";
	menuStats.style.display = "none";
	menuDevMode.style.display = "none";
	menuItemsShowed = false;
	menuStatsShowed = false;
	menuDevModeShowed = false;
	selectedItem = null;
}

if(!file.devMode) menuDevModeBtn.style.display = "none";

function keyDown(e){
	if(e.key == "Enter"){
		for(var i in Gl2Objects){
			var obj = Gl2Objects[i];
			if(player.isCollided("any", obj) && obj.onclickFunc){
				obj.onclickFunc();
				break;
			}
		}
	}else if(e.key == "c"){
		menuShowed = !menuShowed;
		menu.style.display = (menuShowed?"block":"none");
		if(!menuShowed){
			menuItems.style.display = "none";
			menuStats.style.display = "none";
			menuDevMode.style.display = "none";
			menuItemsShowed = false;
			menuStatsShowed = false;
			menuDevModeShowed = false;
			selectedItem = null;
		}
	}else if(e.key == "Esc"){
		shell.Run("menu.hta");
		window.close();
	}
}

window.onkeyup = keyDown;