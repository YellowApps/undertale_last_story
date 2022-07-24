//GameLib v2 by YellowApps (http://yellowapps.22web.org/)

var Gl2Objects = {};

function Gl2Canvas(name, bg, width, height, rc){
  this.bgColor = bg; this.width = width; this.height = height;

  this.init = function(){
    if(rc){
		this.ctx = rc.getContext("2d");
		this.elem = rc;
	}else{
		document.body.innerHTML += "<canvas id='" + name + "' width=" + width + " height=" + height + ">ERR_OLD_BROWSER</canvas>";
		this.ctx = document.getElementById(name).getContext("2d");
		this.elem = document.getElementById(name);
	}
    var pfs = this.ctx.fillStyle;
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = pfs;
  }
}

function Gl2Object(x, y, w, h, d){
  this.x = x; this.y = y; this.width = w; this.height = h;
  for(var i in d) this[i] = d[i];
  this.img = new Image();
  this.img.src = this.texture;
  this.img.onload = function(){
    window["Gl2IsObject" + x + y + w + h + "Loaded"] = true;
  }

  this.draw = function(cnv){
    this.canvas = cnv;
    if(!window["Gl2IsObject" + x + y + w + h + "Loaded"]){
      setTimeout(function(){Gl2Objects[d.name].draw(Gl2Objects[d.name].canvas);}, 30);
      return;
    }
    cnv.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
  
  this.onclick = function(func){
	  this.onclickFunc = func;
	  this.clicked = true;
	  var name = d.name;
	  
	  var div = document.createElement("div");
	  div.id = "d"+name;
	  div.innerHTML = "&nbsp;";
	  div.style.position = "absolute";
	  div.style.cursor = "pointer";
	  div.style.left = this.x+"px";
	  div.style.top = this.y+"px";
	  div.style.width = this.width+"px";
	  div.style.height = this.height+"px";
	  div.style.overflow = "hidden";
	  div.style.fontSize = "9999999px";
	  div.onclick = func;
	  
	  document.body.appendChild(div);
  }
  
  this.delclick = function(){
	  if(!this.clicked) return;
	  this.clicked = false;
	  
	  document.getElementById("d"+d.name).onclick = null;
  }
  
  this.moveclick = function(x, y){
	  if(!this.clicked) return;
	  
	  var div = document.getElementById("d"+d.name);
	  div.style.left = x+"px";
	  div.style.top = y+"px";
  }
  
  Gl2Objects[this.name] = this;
}


function Gl2Entity(x, y, w, h, d){
  var ent = new Gl2Object(x, y, w, h, d);

  ent.loadAnimations = function(){
    for(var i in this.animation){
      for(var j in this.animation[i]){
        var img = new Image();
        img.src = this.animation[i][j];
        this.animation[i][j] = img;
      }
    }
  }

  ent.isCollided = function(r, o){
    if(r == "left"){
      return (((this.x <= o.x + o.width) && (this.x > o.x)) && ((this.y + this.height >= o.y) && (this.y <= o.y + o.height)));
    }
	if(r == "right"){
      return (((this.x + this.width >= o.x) && (this.x < o.x + o.width)) && ((this.y + this.height >= o.y) && (this.y <= o.y + o.height)));
    }
	if(r == "top"){
      return (((this.y <= o.y + o.height) && (this.y > o.y)) && ((this.x + this.width > o.x) && (this.x < o.x + o.width)));
    }
	if(r == "bottom"){
      return (((this.y + this.height >= o.y) && (this.y < o.y)) && ((this.x + this.width > o.x) && (this.x < o.x + o.width)));
    }
	if(r == "any"){
		return (this.isCollided("left", o) || this.isCollided("right", o) || this.isCollided("top", o) || this.isCollided("bottom", o));
	}
  }
  
  ent.move = function(dir, pixels, delay, steps, faft, fifc){
    var collided = false, collobj = null;
    for(var i in Gl2Objects){
      if(Gl2Objects[i].name == this.name) continue;
      collided = this.isCollided(dir, Gl2Objects[i]);
      if(collided){
		  if(fifc) collobj = Gl2Objects[i];
		  break;
	  }
    }
    if(collided){
		if(fifc) fifc(this, collobj);
		return;
	}

    //if(this.binded) window.onkeypress = null;
	
    function binder(o){}

    if(dir == "left"){
		this.moveclick(this.x-pixels, this.y);
      this.canvas.ctx.fillStyle = this.canvas.bgColor;
      this.canvas.ctx.fillRect(this.x, this.y, this.width, this.height);
      if(this.x > 0) this.x -= pixels;
      this.canvas.ctx.drawImage(this.animation.left[0], this.x, this.y, this.width, this.height);
      var currObj = this;
      setTimeout(function(){ currObj.canvas.ctx.drawImage(currObj.animation.left[1], currObj.x, currObj.y, currObj.width, currObj.height);binder(currObj); if(steps > 1) currObj.move(dir, pixels, delay, steps-1, faft, fifc); if(steps == 1 && faft) faft();}, delay);
    }else if(dir == "right"){
		this.moveclick(this.x+pixels, this.y);
      this.canvas.ctx.fillStyle = this.canvas.bgColor;
      this.canvas.ctx.fillRect(this.x, this.y, this.width, this.height);
      if(this.x + this.width < this.canvas.width) this.x += pixels;
      this.canvas.ctx.drawImage(this.animation.right[0], this.x, this.y, this.width, this.height);
      var currObj = this;
      setTimeout(function(){ currObj.canvas.ctx.drawImage(currObj.animation.right[1], currObj.x, currObj.y, currObj.width, currObj.height);binder(currObj); if(steps > 1) currObj.move(dir, pixels, delay, steps-1, faft, fifc); if(steps == 1 && faft) faft();}, delay);
    }else if(dir == "top"){
		this.moveclick(this.x, this.y-pixels);
      this.canvas.ctx.fillStyle = this.canvas.bgColor;
      this.canvas.ctx.fillRect(this.x, this.y, this.width, this.height);
      if(this.y > 0) this.y -= pixels;
      this.canvas.ctx.drawImage(this.animation.top[0], this.x, this.y, this.width, this.height);
      var currObj = this;
      setTimeout(function(){ currObj.canvas.ctx.drawImage(currObj.animation.top[1], currObj.x, currObj.y, currObj.width, currObj.height);binder(currObj); if(steps > 1) currObj.move(dir, pixels, delay, steps-1, faft, fifc); if(steps == 1 && faft) faft();}, delay);
    }else if(dir == "bottom") {
		this.moveclick(this.x, this.y+pixels);
      this.canvas.ctx.fillStyle = this.canvas.bgColor;
      this.canvas.ctx.fillRect(this.x, this.y, this.width, this.height);
      if(this.y + this.height < this.canvas.height) this.y += pixels;
      this.canvas.ctx.drawImage(this.animation.bottom[0], this.x, this.y, this.width, this.height);
      var currObj = this;
      setTimeout(function(){ currObj.canvas.ctx.drawImage(currObj.animation.bottom[1], currObj.x, currObj.y, currObj.width, currObj.height);binder(currObj); if(steps > 1) currObj.move(dir, pixels, delay, steps-1, faft, fifc); if(steps == 1 && faft) faft();}, delay);
    }
  }

  ent.bind = function(keys, pixels, delay){
    this.binded = true; this.bindKeys = keys; this.bindPixels = pixels; this.bindDelay = delay;
    var currObj = this;
    window.onkeydown = function(e){
      if(e.key == keys.left) currObj.move("left", pixels, delay);
      if(e.key == keys.right) currObj.move("right", pixels, delay);
      if(e.key == keys.top) currObj.move("top", pixels, delay);
      if(e.key == keys.bottom) currObj.move("bottom", pixels, delay);
    }
  }
	
	ent.unbind = function(){
		window.onkeypress = null;
	}
	
  ent.kill = function(){
    delete Gl2Objects[this.name];

    this.canvas.ctx.fillStyle = this.canvas.bgColor;
    this.canvas.ctx.fillRect(this.x, this.y, this.width, this.height);

    if(this.onkill) this.onkill();
    if(this.binded) window.onkeypress = null;
  }

  ent.damage = function(n, dl){
    this.health -= n;
    this.canvas.ctx.fillStyle = "red";
    this.canvas.ctx.font = "16px Arial";
    this.canvas.ctx.fillText(n, this.x + 4, this.y - 2);

    var curr = this, tl = n.toString().length;
    setTimeout(function(){ curr.canvas.ctx.fillStyle = curr.canvas.bgColor; curr.canvas.ctx.fillRect(curr.x, curr.y - 16, tl * 16, 16); }, dl);

    if(this.health < 0 && !this.undying) this.kill();
  }

  ent.heal = function(n, dl){
    this.health += n;
    this.canvas.ctx.fillStyle = "green";
    this.canvas.ctx.font = "16px Arial";
    this.canvas.ctx.fillText(n, this.x + 4, this.y - 2);

    var curr = this, tl = n.toString().length;
    setTimeout(function(){ curr.canvas.ctx.fillStyle = curr.canvas.bgColor; curr.canvas.ctx.fillRect(curr.x, curr.y - 16, tl * 16, 16); }, dl);
  }

  return ent;
}
