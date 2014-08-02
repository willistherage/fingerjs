
var stage;
var camera;

$(function() {
	
	AnimationFrame.init();

	this.stage = new ModelStage($('.stage')[0]);
	this.camera = new CameraSocket(this.stage);
});