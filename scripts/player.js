class musicPlayer {
	constructor() {
		this.play = this.play.bind(this);
		this.playBtn = document.getElementById('playButton');
		this.playBtn.addEventListener('click', this.play);
		this.controlPanel = document.getElementById('control-panel');

		this.music = document.getElementById('music');
		this.chefMenu = document.getElementById('chefMenu');
	}

	play() {
		let controlPanelObj = this.controlPanel

		if(controlPanelObj.classList.contains("active")) this.music.pause();
		else this.music.play();

		Array.from(controlPanelObj.classList).find(function(element){
					return element !== "active" ? controlPanelObj.classList.add('active') : controlPanelObj.classList.remove('active');
			});
	}
}

const newMusicplayer = new musicPlayer();