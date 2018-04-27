const night_color = "#323232";
const mt_yellow = "#ffe080";
const mt_blue = "#80e0ff";
const mt_pink = "#ff80e0";

const numberOfBoids = 100;
const boidWidth = 3;
const boidHeight = 10;
const perceptionDistance = 100;
const separationDistance = 10;
const maxSpeed = 2;
const maxAcceleration = 0.1;
const boundingBuffer = 50;

var canvasWidth = 0;
var canvasHeight = 0;

//Init
var boidsWrapper = document.getElementById("boidsWrapper");
var boidsCanvas = document.getElementById("boidsCanvas");
var ctx = boidsCanvas.getContext("2d");

boidsCanvas.width = window.innerWidth;
boidsCanvas.height = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                       document.documentElement.clientHeight, document.documentElement.scrollHeight,
                       document.documentElement.offsetHeight );

canvasWidth = boidsCanvas.width;
canvasHeight = boidsCanvas.height;

class Boid {
	//Boids have a position on x and y and a heading, specified by its heading vector.
	//As well, they have a color
	constructor(x, y, hx, hy, color) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
	}

	addForce(vector) {
		if(this.hx > maxSpeed) this.hx = maxSpeed;
		if(this.hx < -maxSpeed) this.hx = -maxSpeed;
		if(this.hy > maxSpeed) this.hy = maxSpeed;
		if(this.hy < -maxSpeed) this.hy = -maxSpeed;

		this.hx += vector.x;
		this.hy += vector.y;
	}
}

var boids = [];

for(var i = 0; i < numberOfBoids; i++){
	var color = mt_yellow;
	if(i >= numberOfBoids / 3 && i < numberOfBoids * 2 / 3) color = mt_pink;
	if(i >= numberOfBoids * 2 / 3) color = mt_blue;  
	boids.push(new Boid(Math.random() * canvasWidth, Math.random() * canvasHeight, randomRange(-1, 1), randomRange(-1, 1), color))
}

//Utilities
function radAngle(opposite, adjacent) {
  	return Math.atan2(opposite, adjacent);
}

function magnitude(vector){
	return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
}

function canSee(boid1, boid2, distance){
	return Math.sqrt(Math.pow(boid2.x - boid1.x, 2) + Math.pow(boid2.y - boid1.y, 2)) < distance;
}

function randomRange(min, max){
	return ((max - min) * Math.random()) - max;
}

//Rules
function cohesion(){
	var cohesionVectors = [];

	for(var i = 0; i < boids.length; i++){
		var neighbours = 0;
		var vector = {x: 0, y: 0};

		for(var j = 0; j < boids.length; j++){
			if(i != j){
				if(boids[i].color == boids[j].color){
					if(canSee(boids[i], boids[j], perceptionDistance)){
						neighbours++;
						vector.x += boids[j].x;
						vector.y += boids[j].y;
					}
				}
			}
		}

		if(neighbours > 0){
			vector.x = (vector.x / neighbours) - boids[i].x;
			vector.y = (vector.y / neighbours) - boids[i].y;
		}

		cohesionVectors.push(vector);
	}

	return cohesionVectors;
}

function separation(){
	var separationVectors = [];

	for(var i = 0; i < boids.length; i++){
		var neighbours = 0;
		var vector = {x: 0, y: 0};

		for(var j = 0; j < boids.length; j++){
			if(i != j){
				if(canSee(boids[i], boids[j], separationDistance)){
					neighbours++;
					vector.x -= boids[j].x - boids[i].x;
					vector.y -= boids[j].y - boids[i].y;
				}
			}
		}

		separationVectors.push(vector);
	}

	return separationVectors;
}

function alignment(){
	var alignmentVectors = [];

	for(var i = 0; i < boids.length; i++){
		var vector = {x: 0, y: 0};

		for(var j = 0; j < boids.length; j++){
			if(i != j){
				if(boids[i].color == boids[j].color){
					if(canSee(boids[i], boids[j], perceptionDistance)){
						vector.x += boids[j].hx;
						vector.y += boids[j].hy;
					}
				}
			}
		}

		alignmentVectors.push(vector);
	}

	return alignmentVectors;
}

function bounds(){
	var boundingVectors = [];

	for(var i = 0; i < boids.length; i++){
		var vector = {x: 0, y: 0};

		if(boids[i].x < 0 + boundingBuffer) vector.x = boundingBuffer - boids[i].x;
		if(boids[i].x > canvasWidth - boundingBuffer) vector.x = (canvasWidth - boundingBuffer) - boids[i].x;
		if(boids[i].y < 0 + boundingBuffer) vector.y = boundingBuffer - boids[i].y;
		if(boids[i].y > canvasHeight - boundingBuffer) vector.y = (canvasHeight - boundingBuffer) - boids[i].y;
	
		boundingVectors.push(vector);
	}

	return boundingVectors;
}

//Animation
function move() {

	var cohesionVectors = cohesion();
	var separationVectors = separation();
	var alignmentVectors = alignment();
	var boundingVectors = bounds();

	for(var i = 0; i < boids.length; i++){
		var movementVector = {x: 0, y: 0};

		movementVector.x += cohesionVectors[i].x + separationVectors[i].x + alignmentVectors[i].x + boundingVectors[i].x;
		movementVector.y += cohesionVectors[i].y + separationVectors[i].y + alignmentVectors[i].y + boundingVectors[i].y;

		var mag = magnitude(movementVector);

		if(mag > 0){
			movementVector.x = (movementVector.x / mag) * maxAcceleration;
			movementVector.y = (movementVector.y / mag) * maxAcceleration;
		}

		boids[i].addForce(movementVector);
	}

	for(var i = 0; i < boids.length; i++){
		boids[i].x += boids[i].hx;
		boids[i].y += boids[i].hy;
	}
}

function draw() {
	ctx.fillStyle = night_color;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	for(var i = 0; i < boids.length; i++){
		//Draw boid
		ctx.fillStyle = boids[i].color;
		var boidAngle = radAngle(boids[i].hx, -boids[i].hy);

		//Rotate canvas
		ctx.translate(boids[i].x, boids[i].y);
		ctx.rotate(boidAngle);

		//Draw it
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(-boidWidth, boidHeight);
		ctx.lineTo(boidWidth, boidHeight);
		ctx.fill();

		//Rotate it back
		ctx.rotate(-boidAngle);
		ctx.translate(-boids[i].x, -boids[i].y);
	}
}

function update() {
	move();
	draw();
}

window.setInterval(update, 10);