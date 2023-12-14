// window.scrollBy({
// 	top: 50,
// 	left: 0,
// 	behavior: 'smooth'
// });

const preview = true;

const canvasScale = 0.97;

const LMB = 0;
const MMB = 1;
const RMB = 2;

const contextMenuBuffer = 10;

const night_color = "#323232";
const asteroid_color = "#808080";
const mt_yellow = "#ffe080";
const mt_blue = "#80e0ff";
const mt_pink = "#ff80e0";
const mt_green = "#80ff80";

const idealFlock = 3;
const numberOfAsteroids = 10;

const boidWidth = 5;
const boidHeight = 15;
const bulletSize = 2;
const asteroidSize = 10;

const firingDistance = 200;
const perceptionDistance = 100;
const separationDistance = 20;

const bulletSpeed = 5;
const rateOfFire = 50;
const playerRateOfFire = 10;
const shotAccuracy = 0.05;
const maxSpeed = 2;
const maxAcceleration = 0.1;
const boundingBuffer = 50;

const drag = 0.99;
const playerAcceleration = 0.1;
const rotationSpeed = 0.05;
const playerAsteroidDistance = 50;

var canvasWidth = 0;
var canvasHeight = 0;

//Resize the canvas
var boidsWrapper = document.getElementById("boidsWrapper");
var boidsCanvas = document.getElementById("boidsCanvas");
var ctx = boidsCanvas.getContext("2d");

boidsCanvas.width = document.documentElement.clientWidth;// * canvasScale;//window.innerWidth * canvasScale;
boidsCanvas.height = document.documentElement.clientHeight;//window.innerHeight * canvasScale;//document.documentElement.scrollHeight;//Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                       // document.documentElement.clientHeight, document.documentElement.scrollHeight,
                       // document.documentElement.offsetHeight );

canvasWidth = boidsCanvas.width;
canvasHeight = boidsCanvas.height;

var canvasOffset = {left: boidsCanvas.getBoundingClientRect().left, top: boidsCanvas.getBoundingClientRect().top};


var numberOfBoids = (preview) ? Math.round(canvasWidth / 100, 0) : 100;

//Player
const playerMagnitude = 5;
var player = null;

//User inputs
var mouseDown = false;
var mousePosition = {x: 0, y: 0};
var movement = {f: false, b: false, r: false, l: false};
var fire = false;

//Asteroid controls
var selectedAsteroid = null;

//Context menu controls
var showContextMenu = false;
var cursorInsideContextMenu = false;
var cursorContextMenuOffset = {x: 0, y: 0};

//Buttons
var warButton = null;
var resetButton = null;

//State
var atWar = false;

//What do we got
class Boid {
	//Boids have a position on x and y and a heading, specified by its heading vector.
	//As well, they have a color
	constructor(x, y, hx, hy, color, teamNumber) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
		this.teamNumber = teamNumber;
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

//Player is like a boid (and gets used like a boid) but movement is different
class Player {
	//The h was supposed to be for heading but the player needs a separate heading :/
	constructor(x, y, hx, hy, angle, color, teamNumber) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.angle = angle;
		this.color = color;
		this.teamNumber = teamNumber;
		this.active = true;
		this.shootCountdown = playerRateOfFire;
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
		this.hx = 0;
		this.hy = 0;
	}
}


class Bullet {
	//Bullets are pretty cool
	constructor(x, y, hx, hy, color, teamNumber) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
		this.teamNumber = teamNumber;
		this.active = true;
	}

	activate(x, y, hx, hy, color, teamNumber) {
		this.x = x;
		this.y = y;
		this.hx = hx;
		this.hy = hy;
		this.color = color;
		this.teamNumber = teamNumber;
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
	constructor(x, y, width, height, color, text, textColor, onClick){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.text = text;
		this.textColor = textColor;
		this.onClick = onClick;
		this.active = true;
	}

	click(){
		this.onClick();
	}

	activate(){
		this.active = true;
	}

	deactive(){
		this.active = false;
	}
}

//And where do we got 'em
var boids = [];
var bullets = [];
var asteroids = [];

//Init
for(var i = 0; i < numberOfBoids; i++){
	var color = mt_blue;
	var teamNumber = 0;
	// if(i >= numberOfBoids / 3 && i < numberOfBoids * 2 / 3) color = mt_pink;
	// if(i >= numberOfBoids * 2 / 3) color = mt_blue;  
	if(preview){
		if(i > numberOfBoids / 3 && i < 2 * numberOfBoids / 3){
			color = mt_pink;
			teamNumber = 1;
		}
		else if(i > numberOfBoids / 3){
			color = mt_yellow;
			teamNumber = 2;
		}

	}
	else{
		if(i > numberOfBoids / 2){
			color = mt_pink;
			teamNumber = 1;
		}
	}

	boids.push(new Boid(Math.random() * canvasWidth, Math.random() * canvasHeight, randomRange(-1, 1), randomRange(-1, 1), color, teamNumber))
}

for(var i = 0; i < numberOfAsteroids; i++){
	var size = asteroidSize + Math.round(randomRange(-1, 1) * asteroidSize, 0) / 2;
	asteroids.push(new Asteroid(Math.random() * canvasWidth, Math.random() * canvasHeight, size));
}

player = new Player(canvasWidth / 2, canvasHeight / 2, 0, 0, 0, mt_yellow, preview ? 2 : 0);
boids.push(player);

//Create buttons
warButton = new Button(0, 0, canvasWidth / 10, canvasHeight / 40, mt_pink, "War", night_color, toggleWar);
resetButton = new Button(0, 0, canvasWidth / 10, canvasHeight / 40, mt_blue, "Reset", night_color, reset);


function reset(){
	console.log("Reset");
	canvasWidth = 0;
	canvasHeight = 0;

	//Resize the canvas
	boidsWrapper = document.getElementById("boidsWrapper");
	boidsCanvas = document.getElementById("boidsCanvas");
	ctx = boidsCanvas.getContext("2d");

	//boidsCanvas.width = window.innerWidth * canvasScale;
	//boidsCanvas.height = window.innerHeight * canvasScale;//document.documentElement.scrollHeight;//Math.max( document.body.scrollHeight, document.body.offsetHeight, 
	                       // document.documentElement.clientHeight, document.documentElement.scrollHeight,
	                       // document.documentElement.offsetHeight );

	canvasWidth = boidsCanvas.width;
	canvasHeight = boidsCanvas.height;

	canvasOffset = {left: boidsCanvas.getBoundingClientRect().left, top: boidsCanvas.getBoundingClientRect().top};

	//User inputs
	mouseDown = false;
	mousePosition = {x: 0, y: 0};

	//Asteroid controls
	selectedAsteroid = null;

	//Context menu controls
	showContextMenu = false;
	cursorInsideContextMenu = false;
	cursorContextMenuOffset = {x: 0, y: 0};

	//Buttons
	warButton = null;

	//State
	atWar = false;

	boids = [];
	bullets = [];
	asteroids = [];

	for(var i = 0; i < numberOfBoids; i++){
		var color = mt_blue;
		var teamNumber = 0;
		// if(i >= numberOfBoids / 3 && i < numberOfBoids * 2 / 3) color = mt_pink;
		// if(i >= numberOfBoids * 2 / 3) color = mt_blue;  
		if(i > numberOfBoids / 2){
			color = mt_pink;
			teamNumber = 1;
		}
		boids.push(new Boid(Math.random() * canvasWidth, Math.random() * canvasHeight, randomRange(-1, 1), randomRange(-1, 1), color, teamNumber))
	}

	for(var i = 0; i < numberOfAsteroids; i++){
		var size = asteroidSize + Math.round(randomRange(-1, 1) * asteroidSize, 0) / 2;
		console.log("Making asteroid of size " + size);
		asteroids.push(new Asteroid(Math.random() * canvasWidth, Math.random() * canvasHeight, size));
	}

	player = new Player(canvasWidth / 2, canvasHeight / 2, 0, 0, 0, mt_yellow, 0);
	boids.push(player);

	warButton = new Button(0, 0, canvasWidth / 10, canvasHeight / 40, mt_pink, "War", night_color, toggleWar);
	resetButton = new Button(0, 0, canvasWidth / 10, canvasHeight / 40, mt_blue, "Reset", night_color, reset);
}

//Utilities
function radAngle(opposite, adjacent) {
  	return Math.atan2(opposite, adjacent);
}

function vectorRadAngle(vector) {
	return radAngle(vector.x, vector.y);
}

function radAngleToVector(angle){
	return {x: Math.cos(angle), y: Math.sin(angle)};
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

function happiness(neighbours){
	return - Math.pow(neighbours / idealFlock, 2) + 2;
}

//Rules
function cohesion(){
	var cohesionVectors = [];

	for(var i = 0; i < boids.length; i++){
		var vector = {x: 0, y: 0};

		if(boids[i].active && boids[i] instanceof Boid){
			var neighbours = 0;

			for(var j = 0; j < boids.length; j++){
				if(i != j && boids[j].active){
					if(boids[i].teamNumber == boids[j].teamNumber){
						if(canSee(boids[i], boids[j], perceptionDistance)){
							neighbours++;
							vector.x += boids[j].x;//(boids[j] instanceof Player) ? playerMagnitude * boids[j].x : boids[j].x;
							vector.y += boids[j].y;//(boids[j] instanceof Player) ? playerMagnitude * boids[j].y : boids[j].y;
						}
					}
				}
			}

			if(neighbours > 0){
				vector.x = ((vector.x / neighbours) - boids[i].x) * happiness(neighbours);
				vector.y = ((vector.y / neighbours) - boids[i].y) * happiness(neighbours);
			}
		}

		cohesionVectors.push(vector);
	}

	return cohesionVectors;
}

function playerSeparation(){
	if(!preview){
		//The player only cares about hitting asteroids
		var separationVector = {x: 0, y: 0};

		for(var i = 0; i < asteroids.length; i++){
			var difVector = {x: asteroids[i].x - player.x, y: asteroids[i].y - player.y};
			var distance = magnitude(difVector);

			if(distance <= asteroids[i].size * 2){
				var depth = asteroids[i].size * 2 - distance;

				separationVector.x += (difVector.x / distance) * depth;
				separationVector.y += (difVector.y / distance) * depth;
			}
		}

		var mag = magnitude(separationVector);

		if(mag > 0){
			player.hx -= separationVector.x / mag;
			player.hy -= separationVector.y / mag;
		}
	}
}

function separation(){
	var separationVectors = [];

	for(var i = 0; i < boids.length; i++){
		var vector = {x: 0, y: 0};

		if(boids[i].active && boids[i] instanceof Boid){
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
		
		if(boids[i].active && boids[i] instanceof Boid){

			for(var j = 0; j < boids.length; j++){
				if(i != j && boids[j].active){
					if(boids[i].teamNumber == boids[j].teamNumber){
						if(canSee(boids[i], boids[j], perceptionDistance)){
							neighbours++;
							vector.x += boids[j].hx;//(boids[j] instanceof Player) ? playerMagnitude * boids[j].hx : boids[j].hx;
							vector.y += boids[j].hy;//(boids[j] instanceof Player) ? playerMagnitude * boids[j].hy : boids[j].hy;
						}
					}
				}
			}
		}

		alignmentVectors.push(vector);
	}

	return alignmentVectors;
}

function chase(){
	var chaseVectors = [];

	for(var i = 0; i < boids.length; i++){
		if(boids[i].active && boids[i] instanceof Boid){
			var vector = {x: 0, y: 0};
			var enemyCentroid = {x: 0, y: 0};
			var enemyAvgVelocity = {x: 0, y: 0};
			var enemies = 0;

			for(var j = 0; j < boids.length; j++){

				if(boids[i].teamNumber != boids[j].teamNumber){
					var difVector = {x: boids[j].x - boids[i].x, y: boids[j].y - boids[i].y};
					var distance = magnitude(difVector);

					if(distance < perceptionDistance){
						enemies++;
						enemyCentroid.x += boids[j].x;
						enemyCentroid.y += boids[j].y;
						enemyAvgVelocity.x += boids[j].hx;
						enemyAvgVelocity.y += boids[j].hy;
					}
				}
			}

			if(enemies > 0){
				enemyCentroid.x = enemyCentroid.x / enemies;
				enemyCentroid.y += enemyCentroid.y / enemies;
				enemyAvgVelocity.x += enemyAvgVelocity.x / enemies;
				enemyAvgVelocity.y += enemyAvgVelocity.y / enemies;
			}

			vector.x = (enemyCentroid.x + enemyAvgVelocity.x) - boids[i].x;
			vector.y = (enemyCentroid.y + enemyAvgVelocity.y) - boids[i].y;

			//vector = {x: 0, y: 0};
			var mag = magnitude(vector);
			vector.x = (vector.x / mag) * enemies;
			vector.y = (vector.y / mag) * enemies;
		}

		chaseVectors.push(vector);
	}

	return chaseVectors;
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
					if(boids[i].teamNumber != bullets[j].teamNumber){
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

	for(var i = 0; i < asteroids.length; i++){
		for(var j = 0; j < bullets.length; j++){
			var difVector = {x: asteroids[i].x - bullets[j].x, y: asteroids[i].y - bullets[j].y}
			var distance = magnitude(difVector);

			if(distance < asteroids[i].size) bullets[j].deactivate();
		}
	}
}

//Animation
function movePlayer(){
	if(player.active){
		playerSeparation();

		if(movement.l){
			player.angle -= rotationSpeed;
		}
		if(movement.r){
			player.angle += rotationSpeed;
		}
		if(movement.f){
			//player.addForce({x: 0, y: -1});
			var heading = radAngleToVector(player.angle - Math.PI / 2);
			heading.x = heading.x * playerAcceleration;
			heading.y = heading.y * playerAcceleration;
			player.addForce(heading);
		}
		if(movement.b){
			var heading = radAngleToVector(player.angle - Math.PI / 2);
			heading.x = -heading.x * playerAcceleration;
			heading.y = -heading.y * playerAcceleration;
			player.addForce(heading);
		}

		player.x += player.hx;
		player.y += player.hy;

		if(player.x < 0) player.x = 0;
		if(player.x > canvasWidth * 0.99) player.x = canvasWidth * 0.99;
		if(player.y < 0) player.y = 0;
		if(player.y > canvasHeight) player.y = canvasHeight;

		//Drag
		player.hx = player.hx * drag;
		player.hy = player.hy * drag;

		if(fire && player.shootCountdown < 0){
			var heading =  radAngleToVector(player.angle - Math.PI / 2);
			heading.x = heading.x * bulletSpeed;
			heading.y = heading.y * bulletSpeed;
			fireBullet(player, heading);
			player.shootCountdown = playerRateOfFire;
		}

		player.shootCountdown--;
	}
}

function move() {

	var cohesionVectors = cohesion();
	var separationVectors = separation();
	var alignmentVectors = alignment();
	var chaseVectors = chase();
	var boundingVectors = bounds();

	for(var i = 0; i < boids.length; i++){
		if(boids[i].active && boids[i] instanceof Boid){
			var movementVector = {x: 0, y: 0};

			movementVector.x += cohesionVectors[i].x + separationVectors[i].x + alignmentVectors[i].x + chaseVectors[i].x + boundingVectors[i].x;
			movementVector.y += cohesionVectors[i].y + separationVectors[i].y + alignmentVectors[i].y + chaseVectors[i].y + boundingVectors[i].y;

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

	movePlayer();
}

function fireBullet(boid, velocity){
	var createdBullet = false;

	for(var b = 0; b < bullets.length; b++){
		if(!bullets[b].active){
			bullets[b].activate(boid.x + velocity.x, boid.y + velocity.y, velocity.x, velocity.y, boid.color, boid.teamNumber);
			createdBullet = true;
			b = bullets.length;
		}
	}

	if(!createdBullet){ 
		bullets.push(new Bullet(boid.x + velocity.x, boid.y + velocity.y, velocity.x, velocity.y, boid.color, boid.teamNumber));
		console.log("We got " + bullets.length + " bullets");
	}
}

function shoot() {
	for(var i = 0; i < boids.length; i++){
		if(boids[i].shootCountdown <= 0 && boids[i].active){

			for(var j = 0; j < boids.length; j++){
				if(j != i && boids[i].teamNumber != boids[j].teamNumber && boids[j].active){
					//console.log("Boid 1 color: " + boids[i].color + "\nBoid 2 color: " + boids[j].color);
					var difVector = {x: boids[j].x - boids[i].x, y: boids[j].y - boids[i].y};
					
					if(magnitude(difVector) < firingDistance){
						var heading = {x: boids[i].hx, y: boids[i].hy};
						var difAngle = vectorRadAngle(difVector) - vectorRadAngle(heading);

						if(0 < difAngle && difAngle < shotAccuracy){
							var mag = magnitude(heading);
							var velocity = {x: (heading.x / mag) * bulletSpeed, y: (heading.y / mag) * bulletSpeed};
							
							fireBullet(boids[i], velocity);

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

function drawBoid(boid){
	//Draw boid
	ctx.fillStyle = boid.color;
	ctx.strokeStyle = boid.color;
	var boidAngle = radAngle(boid.hx, -boid.hy);

	if('angle' in boid){
		boidAngle = boid.angle;
	}

	//Rotate canvas
	ctx.translate(boid.x, boid.y);
	ctx.rotate(boidAngle);

	//Draw it
	ctx.beginPath();
	ctx.moveTo(0, -boidHeight / 2);
	ctx.lineTo(-boidWidth, boidHeight / 2);
	ctx.lineTo(boidWidth, boidHeight / 2);
	ctx.fill();

	//Rotate it back
	ctx.rotate(-boidAngle);
	ctx.translate(-boid.x, -boid.y);
}

function draw() {
	ctx.fillStyle = night_color;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	for(var i = 0; i < boids.length; i++){
		if(boids[i].active){
			drawBoid(boids[i]);
		}
	}

	//Draw player
	if(player.active) drawBoid(player);

	for(var i = 0; i < bullets.length; i++){
		if(bullets[i].active){
			//Draw bullet
			ctx.fillStyle = bullets[i].color;
			ctx.fillRect(bullets[i].x, bullets[i].y, bulletSize, bulletSize);
		}
	}	

	//Draw asteroids
	if(!preview){
		for(var i = 0; i < asteroids.length; i++){
			var asteroid = asteroids[i];

			ctx.fillStyle = asteroid_color;
			ctx.strokeStyle = mt_green;
			ctx.beginPath();
			ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.stroke();
		}
	}

	//Draw buttons
	if(showContextMenu){
		//Just so bad
		//Stop this now
		if(warButton.active){
			ctx.fillStyle = warButton.color;
			ctx.fillRect(warButton.x, warButton.y, warButton.width, warButton.height);

			//Write text
			ctx.fillStyle = warButton.textColor;
			ctx.textAlign = "center";
			ctx.font = warButton.height + "px Restaurant";
			ctx.fillText(warButton.text, warButton.x + warButton.width / 2, warButton.y + (7 * warButton.height / 8));
		}
		if(resetButton.active){
			ctx.fillStyle = resetButton.color;
			ctx.fillRect(resetButton.x, resetButton.y, resetButton.width, resetButton.height);

			//Write text
			ctx.fillStyle = resetButton.textColor;
			ctx.textAlign = "center";
			ctx.font = resetButton.height + "px Restaurant";
			ctx.fillText(resetButton.text, resetButton.x + resetButton.width / 2, resetButton.y + (7 * resetButton.height / 8));
		}
	}

	if(!preview){
		//Draw border
		ctx.strokeStyle = mt_green;
		ctx.rect(0, 0, canvasWidth, canvasHeight);
		ctx.stroke();
	}
}

function toggleWar(){
	atWar = !atWar;

	if(atWar){
		for(var i = 0; i < boids.length; i++){
			if(boids[i].color == mt_yellow && !(boids[i] instanceof Player)) boids[i].color = mt_blue;
			
			if(boids[i].teamNumber == 0){
				boids[i].x = Math.random() * canvasWidth / 3;
				boids[i].y = Math.random() * canvasHeight;
			}
			else{
				boids[i].x = Math.random() * canvasWidth / 3 + (2 * canvasWidth / 3);
				boids[i].y = Math.random() * canvasHeight;
			}
		}
	}

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
	if(clicked(resetButton)) resetButton.click();
}

function update() {
	resizeCanvas();
	if(atWar) warUpdate();
	else peaceUpdate();
}

function resizeCanvas(){
	boidsCanvas.width = document.documentElement.clientWidth;
	boidsCanvas.height = document.documentElement.clientHeight;

	canvasWidth = boidsCanvas.width;
	canvasHeight = boidsCanvas.height;

	var canvasOffset = {left: boidsCanvas.getBoundingClientRect().left, top: boidsCanvas.getBoundingClientRect().top};
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

function activateContextMenu(){
	moveContextMenuToCursor();

	showContextMenu = true;
}

function deactivateContextMenu(){
	showContextMenu = 0;
	cursorInsideContextMenu = false;
	cursorContextMenuOffset.x = 0;
	cursorContextMenuOffset.y = 0;
}

function toggleContextMenu(){
	if(showContextMenu) deactivateContextMenu();
	else activateContextMenu();
}

function getContextMenuInfo(){
	return {x: warButton.x, 
			y: warButton.y,
			width: Math.max(warButton.width, resetButton.width),
			height: warButton.height + resetButton.height};
}

function cursorOverContextMenu(){
	var info = getContextMenuInfo();

	return (mousePosition.x > info.x - contextMenuBuffer && mousePosition.x < info.x + info.width + contextMenuBuffer && mousePosition.y > info.y - contextMenuBuffer && mousePosition.y < info.y + info.height + contextMenuBuffer);
}

function moveContextMenuToCursor(){
	warButton.x = mousePosition.x + cursorContextMenuOffset.x;
	warButton.y = mousePosition.y + cursorContextMenuOffset.y;
	resetButton.x = warButton.x;
	resetButton.y = warButton.y + warButton.height;
}

//Web people use lambdas in the weirdest way
function handleMouseMove(event){
	mousePosition.x = event.pageX - canvasOffset.left;
	mousePosition.y = event.pageY - canvasOffset.top;
	//console.log("Mouse at (" + mousePosition.x + ", " + mousePosition.y + ")");

	if(mouseDown) moveAsteroid();

	cursorInsideContextMenu = cursorOverContextMenu();

	if(cursorInsideContextMenu){
		var info = getContextMenuInfo();
		cursorContextMenuOffset.x = info.x - mousePosition.x;
		cursorContextMenuOffset.y = info.y - mousePosition.y;
	}

	if(!cursorInsideContextMenu && showContextMenu) moveContextMenuToCursor();
}

function handleMouseClick(event){
	console.log("Click");
	if(event.button == LMB){
		mousePosition.x = event.pageX - canvasOffset.left;
		mousePosition.y = event.pageY - canvasOffset.top;
		mouseDown = true;

		selectAsteroid();
		checkButtons();

		deactivateContextMenu();
	}
	else if(event.button == RMB || event.button == MMB){
		toggleContextMenu();
	}
}

function handleContextMenu(event)
{
	console.log("context");
	toggleContextMenu();
}

function handleMouseRelease(event){
	console.log("Release");
	if(event.button == LMB){
		mousePosition.x = event.pageX - canvasOffset.left;
		mousePosition.y = event.pageY - canvasOffset.top;
		mouseDown = false;

		deselectAsteroid();
	}
}

function handleKeyDown(event){
	switch(event.keyCode){
		case 35:
			toggleWar();
			break;
		case 37: //A
			event.preventDefault();
			movement.l = true;
			break;
		case 39: //D
			event.preventDefault();
			movement.r = true;
			break;
		case 40: //S
			event.preventDefault();
			movement.b = true;
			break;
		case 38: //W
			event.preventDefault();
			movement.f = true;
			break;
		case 46:
			reset();
			break;
		case 90:
			fire = true;
			break;
		case 32:
			event.preventDefault();
			break;
	}
}

function handleKeyUp(event){
	switch(event.keyCode){
		case 37: //A
			movement.l = false;
			break;
		case 39: //D
			movement.r = false;
			break;
		case 40: //S
			movement.b = false;
			break;
		case 38: //W
			movement.f = false;
			break;
		case 90:
			fire = false;
			break; 
	}
}

function contextMenu(event){
	event.preventDefault();
}

window.setInterval(update, 10);
boidsCanvas.addEventListener("mousedown", handleMouseClick, false);
boidsCanvas.addEventListener("mouseup", handleMouseRelease, false);
boidsCanvas.addEventListener("mousemove", handleMouseMove, false);

document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);

document.addEventListener('contextmenu', contextMenu);
//boidsCanvas.addEventListener("contextmenu", handleContextMenu, true);