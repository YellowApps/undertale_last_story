//start room

setInterval(function(){
	if(!Gl2Objects.xtemmie && Gl2Objects.player.y < 10) goToRoom("ruins/1");
}, 200);