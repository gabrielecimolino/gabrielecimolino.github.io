window.scrollBy({
	top: 50,
	left: 0,
	behavior: 'smooth'
});

const night_color = "#323232";
const asteroid_color = "#808080";
const mt_yellow = "#ffe080";
const mt_blue = "#80e0ff";
const mt_pink = "#ff80e0";
const mt_green = "#80ff80";

const numberOfBoids = 100;
const numberOfAsteroids = 10;

const boidWidth = 3;
const boidHeight = 10;
const bulletSize = 2;
const asteroidSize = 10;

const firingDistance = 200;
const perceptionDistance = 100;
const separationDistance = 20;

const bulletSpeed = 5;
const rateOfFire = 200;
const shotAccuracy = 0.1;
const maxSpeed = 2;
const maxAcceleration = 0.1;
const boundingBuffer = 50;

var canvasWidth = 0;
var canvasHeight = 0;

//Resize the canvas
var boidsWrapper = document.getElementById("boidsWrapper");
var boidsCanvas = document.getElementById("boidsCanvas");
var ctx = boidsCanvas.getContext("2d");

boidsCanvas.width = window.innerWidth;
boidsCanvas.height = window.innerHeight;//document.documentElement.scrollHeight;//Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                       // document.documentElement.clientHeight, document.documentElement.scrollHeight,
                       // document.documentElement.offsetHeight );

canvasWidth = boidsCanvas.width;
canvasHeight = boidsCanvas.height;

var canvasOffset = {left: boidsCanvas.getBoundingClientRect().left, top: boidsCanvas.getBoundingClientRect().top};

//User inputs
var mouseDown = false;
var mousePosition = {x: 0, y: 0};

//Asteroid controls
var selectedAsteroid = null;

//Buttons
var warButton = null;

//State
var atWar = false;

//What do we got
class Boid {
	//Boids have a position on x and y and a heading, specified by its heading vector.
	//As well, they have a color
	constructor(x, y, hx, hy, color) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
		this.active = true;
		this.shootCountdown = 0;
	}

	addForce(vector) {
		if(this.hx > maxSpeed) this.hx = maxSpeed;
		if(this.hx < -maxSpeed) this.hx = -maxSpeed;
		if(this.hy > maxSpeed) this.hy = maxSpeed;
		if(this.hy < -maxSpeed) this.hy = -maxSpeed;

		this.hx += vector.x;
		this.hy += vector.y;
	}

	activate() {
		this.active = true;
	}

	deactivate() {
		this.active = false;
	}
}

class Bullet {
	//Bullets are pretty cool
	constructor(x, y, hx, hy, color) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
		this.active = true;
	}

	activate(x, y, hx, hy, color) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
		this.active = true;
	}

	deactivate() {
		this.active = false;
	}
}

class Asteroid {
	//Asteroids are bigger than me 
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
	}
}

class Button {
	constructor(x, y, width, height, color, onClick){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.onClick = onClick;
	}

	click(){
		this.onClick();
	}
}

//And where do we got 'em
var boids = [];
var bullets = [];
var asteroids = [];

//Init
for(var i = 0; i < numberOfBoids; i++){
	var color = mt_yellow;
	if(i >= numberOfBoids / 3 && i < numberOfBoids * 2 / 3) color = mt_pink;
	if(i >= numberOfBoids * 2 / 3) color = mt_blue;  
	boids.push(new Boid(Math.random() * canvasWidth, Math.random() * canvasHeight, randomRange(-1, 1), randomRange(-1, 1), color))
}

for(var i = 0; i < numberOfAsteroids; i++){
	var size = asteroidSize + Math.round(randomRange(-1, 1) * asteroidSize, 0) / 2;
	console.log("Making asteroid of size " + size);
	asteroids.push(new Asteroid(Math.random() * canvasWidth, Math.random() * canvasHeight, size));
}

//Create buttons
warButton = new Button(canvasWidth / 10, canvasHeight / 10, canvasWidth / 10, canvasHeight / 10, mt_pink, toggleWar);

//Utilities
function radAngle(opposite, adjacent) {
  	return Math.atan2(opposite, adjacent);
}

function vectorRadAngle(vector) {
	return radAngle(vector.x, vector.y);
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

function collision(boid, bullet){
	var difVector = {x: bullet.x - boid.x, y: bullet.y - boid.y};
	var distance = magnitude(difVector);

	//console.log("Checking collision: " + distance < boidHeight);

	return distance < boidHeight;
}

function clicked(button){
	console.log("Checking clicked");
	console.log("Mouse position is (" + mousePosition.x + ", " + mousePosition.y + ")");
	return (mousePosition.x < button.x + button.width && mousePosition.x > button.x && mousePosition.y < button.y + button.height && mousePosition.y > button.y);
}

//Rules
function cohesion(){
	var cohesionVectors = [];

	for(var i = 0; i < boids.length; i++){
		var vector = {x: 0, y: 0};

		if(boids[i].active){
			var neighbours = 0;

			for(var j = 0; j < boids.length; j++){
				if(i != j && boids[j].active){
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
		}

		cohesionVectors.push(vector);
	}

	return cohesionVectors;
}

function separation(){
	var separationVectors = [];

	for(var i = 0; i < boids.length; i++){
		var vector = {x: 0, y: 0};

		if(boids[i].active){
			var neighbours = 0;

			for(var j = 0; j < boids.length; j++){
				if(i != j && boids[j].active){
					if(canSee(boids[i], boids[j], separationDistance)){
						neighbours++;
						vector.x -= boids[j].x - boids[i].x;
						vector.y -= boids[j].y - boids[i].y;
					}
				}
			}

			for(var j = 0; j < asteroids.length; j++){
				var difVector = {x: asteroids[j].x - boids[i].x, y: asteroids[j].y - boids[i].y};
				var distance = magnitude(difVector);

				if(distance < perceptionDistance){
					var depth = perceptionDistance - distance;

					vector.x -= (difVector.x / distance) * depth * (1 + Math.log10(neighbours + 1));
					vector.y -= (difVector.y / distance) * depth * (1 + Math.log10(neighbours + 1));
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
		var neighbours = 0;
		var vector = {x: 0, y: 0};
		
		if(boids[i].active){

			for(var j = 0; j < boids.length; j++){
				if(i != j && boids[j].active){
					if(boids[i].color == boids[j].color){
						if(canSee(boids[i], boids[j], perceptionDistance)){
							neighbours++;
							vector.x += boids[j].hx;
							vector.y += boids[j].hy;
						}
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

		if(boids[i].active){

			if(boids[i].x < 0 + boundingBuffer) vector.x = boundingBuffer - boids[i].x;
			if(boids[i].x > canvasWidth - boundingBuffer) vector.x = (canvasWidth - boundingBuffer) - boids[i].x;
			if(boids[i].y < 0 + boundingBuffer) vector.y = boundingBuffer - boids[i].y;
			if(boids[i].y > canvasHeight - boundingBuffer) vector.y = (canvasHeight - boundingBuffer) - boids[i].y;
		}

		boundingVectors.push(vector);
	}

	return boundingVectors;
}

function detectCollisions() {
	for(var i = 0; i < boids.length; i++){
		if(boids[i].active){

			for(var j = 0; j < bullets.length; j++){
				if(bullets[j].active){
					if(boids[i].color != bullets[j].color){
						if(collision(boids[i], bullets[j])){

							boids[i].deactivate();
							bullets[j].deactivate();
							j = boids.length;
						}
					}
				}
			}
		}
	}
}

//Animation
function move() {

	var cohesionVectors = cohesion();
	var separationVectors = separation();
	var alignmentVectors = alignment();
	var boundingVectors = bounds();

	for(var i = 0; i < boids.length; i++){
		if(boids[i].active){
			var movementVector = {x: 0, y: 0};

			movementVector.x += cohesionVectors[i].x + separationVectors[i].x + alignmentVectors[i].x + boundingVectors[i].x;
			movementVector.y += cohesionVectors[i].y + separationVectors[i].y + alignmentVectors[i].y + boundingVectors[i].y;

			var mag = magnitude(movementVector);

			if(mag > 0){
				movementVector.x = (movementVector.x / mag) * maxAcceleration;
				movementVector.y = (movementVector.y / mag) * maxAcceleration;
			}

			boids[i].addForce(movementVector);
			boids[i].x += boids[i].hx;
			boids[i].y += boids[i].hy;
		}
	}

	for(var i = 0; i < bullets.length; i++){
		if(bullets[i].active){
			bullets[i].x += bullets[i].hx;
			bullets[i].y += bullets[i].hy;

			//Check if bullet is still on screen
			if(bullets[i].x < 0 || bullets[i].x > canvasWidth || bullets[i].y < 0 || bullets[i].y > canvasHeight){
				bullets[i].deactivate();
			}
		}
	}
}

function shoot() {
	for(var i = 0; i < boids.length; i++){
		if(boids[i].shootCountdown <= 0 && boids[i].active){

			for(var j = 0; j < boids.length; j++){
				if(j != i && boids[i].color != boids[j].color){
					var difVector = {x: boids[j].x - boids[i].x, y: boids[j].y - boids[i].y};
					
					if(magnitude(difVector) < firingDistance){
						var heading = {x: boids[i].hx, y: boids[i].hy};
						var difAngle = vectorRadAngle(difVector);
						var headingAngle = vectorRadAngle(heading);

						if(Math.abs(difAngle - headingAngle) < shotAccuracy){
							var mag = magnitude(heading);
							var velocity = {x: (heading.x / mag) * bulletSpeed, y: (heading.y / mag) * bulletSpeed};
							
							var createdBullet = false;
							for(var b = 0; b < bullets.length; b++){
								if(!bullets[b].active){
									bullets[b].activate(boids[i].x + velocity.x, boids[i].y + velocity.y, velocity.x, velocity.y, boids[i].color);
									createdBullet = true;
									b = bullets.length;
								}
							}

							if(!createdBullet){ 
								bullets.push(new Bullet(boids[i].x + velocity.x, boids[i].y + velocity.y, velocity.x, velocity.y, boids[i].color));
								console.log("We got " + bullets.length + " bullets");
							}

							boids[i].shootCountdown = rateOfFire;
							j = boids.length;
						}
					}
				}
			}
		}
		
		boids[i].shootCountdown--;
	}
}

function draw() {
	ctx.fillStyle = night_color;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	for(var i = 0; i < boids.length; i++){
		if(boids[i].active){
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

	for(var i = 0; i < bullets.length; i++){
		if(bullets[i].active){
			//Draw bullet
			ctx.fillStyle = bullets[i].color;
			ctx.fillRect(bullets[i].x, bullets[i].y, bulletSize, bulletSize);
		}
	}	

	for(var i = 0; i < asteroids.length; i++){
		var asteroid = asteroids[i];

		//Draw asteroid
		ctx.fillStyle = asteroid_color;
		ctx.strokeStyle = mt_green;
		ctx.beginPath();
		ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
	}

	//Draw buttons
	ctx.fillStyle = warButton.color;
	ctx.fillRect(warButton.x, warButton.y, warButton.width, warButton.height);
}

function toggleWar(){
	atWar = !atWar;

	warButton.color = atWar ? mt_green : mt_pink;
}

function moveAsteroid(){
	if(selectedAsteroid != null){	
		asteroids[selectedAsteroid].x = mousePosition.x;
		asteroids[selectedAsteroid].y = mousePosition.y;
	}
}

function selectAsteroid(){
	for(var i = 0; i < asteroids.length; i++){
		var difVector = {x: asteroids[i].x - mousePosition.x, y: asteroids[i].y - mousePosition.y};
		var distance = magnitude(difVector);

		if(distance < asteroids[i].size) selectedAsteroid = i;
	}
}

function deselectAsteroid(){
	selectedAsteroid = null;
}

function checkButtons(){
	if(clicked(warButton)) warButton.click();
}

function update() {
	if(atWar) warUpdate();
	else peaceUpdate();
}

function peaceUpdate(){
	move();
	draw();
}

function warUpdate() {
	detectCollisions();
	move();
	shoot();
	draw();
}

//Web people use lambdas in the weirdest way
function handleMouseMove(event){
	mousePosition.x = event.pageX - canvasOffset.left;
	mousePosition.y = event.pageY - canvasOffset.top;
	//console.log("Mouse at (" + mousePosition.x + ", " + mousePosition.y + ")");

	if(mouseDown) moveAsteroid();
}

function handleMouseClick(event){
	console.log("Click");
	mousePosition.x = event.pageX - canvasOffset.left;
	mousePosition.y = event.pageY - canvasOffset.top;
	mouseDown = true;

	selectAsteroid();
	checkButtons();
}

function handleMouseRelease(event){
	console.log("Release");
	mousePosition.x = event.pageX - canvasOffset.left;
	mousePosition.y = event.pageY - canvasOffset.top;
	mouseDown = false;

	deselectAsteroid();
}

window.setInterval(update, 10);
boidsCanvas.addEventListener("mousedown", handleMouseClick, false);
boidsCanvas.addEventListener("mouseup", handleMouseRelease, false);
boidsCanvas.addEventListener("mousemove", handleMouseMove, false);