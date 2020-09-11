let bird, pipes = [], score = 0;
// Sound
let classifierSound;
let labelSound = 'listening...';
let soundModel = 'https://teachablemachine.withgoogle.com/models/FL-69Ec_H/';

// Video
let classifierVideo;
let video;
let labelVideo;


function preload() {
  classifierVideo = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/h2oiwGWg7/model.json");
  classifierSound = ml5.soundClassifier(soundModel + 'model.json');
}

function classifySound() {
  classifierSound.classify(gotResultsSound);
}

function classifyVideo() {
  classifierVideo.classify(video, gotResultsVideo);
}


function setup() {
  createCanvas(400, 600);
  bird = new Bird();
  pipes.push(new Pipe());
  frameRate(10);
  // Sound
  classifySound();
  mic = new p5.AudioIn();
  mic.start();
  // Video
  video = createCapture(VIDEO);
  classifyVideo();
}

function draw() {
  background(0);

  for (var i = pipes.length - 1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();

    if (pipes[i].hits(bird)) {
      console.log('hit');
      gameOver();
    }

    if (pipes[i].offScreen()) {
      pipes.splice(i, 1);
    }
  }

  bird.show();
  bird.update();

  if (frameCount % 100 == 0) {
    pipes.push(new Pipe());
  }

  if(frameCount % 100 == 0 && frameCount > 100) {
    score += 1;
  }

  text(`Score: ${score}`, 20, 20)
}

function keyPressed() {
  if (key == ' ') {
    bird.up();
  }
  if (keyCode == UP_ARROW) {
    restartGame();
    console.log('restart')
  }
}


function restartGame() {
  bird = new Bird();
  pipes = [];
  score = 0;
  loop();
}

function gameOver() {
  stroke(0);
  textAlign(CENTER);
  text('Game Over', width/2, height/2);
  noLoop();
}


class Bird {
  constructor() {
    this.y = height / 2;
    this.x = 64;

    this.gravity = .9;
    this.lift = -25;
    this.velocity = 0;
  }

  show() {
    fill(255);
    ellipse(this.x, this.y, 32);
  }

  up() {
    this.velocity += this.lift;
  }

  update() {
    this.velocity += this.gravity;
    this.velocity *= 0.9;
    this.y += this.velocity;

    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
}

class Pipe {
  constructor() {
    this.top = random(height / 2);
    this.bottom = random(height / 2);
    this.x = width;
    this.w = 20;
    this.speed = 2;
    this.highlight = false;
  }

hits(bird) {
  if (bird.y < this.top || bird.y > height - this.bottom) {
    if (bird.x > this.x && bird.x < this.x + this.w) {
      this.highlight = true;
      return true;
    }
  }
  this.highlight = false;
  return false;
}

  show(){
    fill(255);

    if (this.highlight) {
      fill(255, 0, 0);
    }

    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
  }

  update() {
    this.x -= this.speed;
  }


  offScreen() {
    return this.x < -this.w;
  }
}

function gotResultsSound(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  labelSound = results[0].label;

  classifySound();

  if (labelSound == 'Up') {
    bird.up();
  }
}

function gotResultsVideo(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  labelVideo = results[0].label;

  classifyVideo();

  if (labelVideo == 'Up') {
    bird.up();
  }
}
