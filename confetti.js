const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;

var animationRunning = false;

function startAnimation() {
    if (!animationRunning) {
        animationRunning = true;
        console.log("Starting animation");
        requestAnimationFrame(loop);
    }
}

function stopAnimation() {
    animationRunning = false;
}

// canvas settings
var viewWidth = window.innerWidth,
    viewHeight = window.innerHeight,
    drawingCanvas = document.getElementById("confetti_canvas"),
    drawCtx,
    timeStep = (1/60);

Point = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};


Particle = function(p0, p1, p2, p3, duration) {
  this.p0 = p0;
  this.p1 = p1;
  this.p2 = p2;
  this.p3 = p3;

  this.time = 0;
  this.duration = duration + Math.random() * 2; // Adjust the random factor as needed
  this.color =  '#' + Math.floor((Math.random() * 0xffffff)).toString(16);

  this.w = 8;
  this.h = 6;

  this.complete = false;
};

Particle.prototype = {
    update:function() {
        this.time = Math.min(this.duration, this.time + timeStep);

        var f = Ease.outCubic(this.time, 0, 1, this.duration);
        var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

        var dx = p.x - this.x;
        var dy = p.y - this.y;

        this.r =  Math.atan2(dy, dx) + HALF_PI;
        this.sy = Math.sin(Math.PI * f * 10);
        this.x = p.x;
        this.y = p.y;

        this.complete = this.time === this.duration;
    },
    render:function() {
        drawCtx.save();
        drawCtx.translate(this.x, this.y);
        drawCtx.rotate(this.r);
        drawCtx.scale(1, this.sy);

        drawCtx.fillStyle = this.color;
        drawCtx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

        drawCtx.restore();
    }
};

// pun intended
Exploader = function(x, y) {
    this.x = x;
    this.y = y;

    this.startRadius = 24;

    this.time = 0;
    this.duration = 0.4;
    this.progress = 0;

    this.complete = false;
};

Exploader.prototype = {
    reset:function() {
        this.time = 0;
        this.progress = 0;
        this.complete = false;
    },
    update:function() {
        this.time = Math.min(this.duration, this.time + timeStep);
        this.progress = Ease.inBack(this.time, 0, 1, this.duration);

        this.complete = this.time === this.duration;
    },
    render:function() {
        drawCtx.fillStyle = 'transparent';
        drawCtx.beginPath();
        drawCtx.arc(this.x, this.y, this.startRadius * (1 - this.progress), 0, TWO_PI);
        drawCtx.fill();
    }
};

var particles = [],
    exploader,
    phase = 0;

function initDrawingCanvas() {
    drawingCanvas.width = viewWidth;
    drawingCanvas.height = viewHeight;
    drawCtx = drawingCanvas.getContext('2d');

    createExploader();
    createParticles();
}

function createExploader() {
    exploader = new Exploader(viewWidth * 0.5, viewHeight * 0.5);
}

var confettiDuration = 4; // Adjust this value to change the duration of confetti animations
var numberOfConfetti = 600; // Adjust this value to change the number of confetti particles

function createParticles() {
    for (var i = 0; i < numberOfConfetti; i++) {
        var p0 = new Point(viewWidth * 0.5, viewHeight * 0.2);
        var p1 = new Point(Math.random() * viewWidth, Math.random() * viewHeight);
        var p2 = new Point(Math.random() * viewWidth, Math.random() * viewHeight);
        var p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

        particles.push(new Particle(p0, p1, p2, p3, confettiDuration));
    }
}

function update() {

    switch (phase) {
        case 0:
            exploader.update();
            break;
        case 1:
            particles.forEach(function(p) {
                p.update();
            });
            break;
    }
}

function render() {
    drawCtx.clearRect(0, 0, viewWidth, viewHeight);

    switch (phase) {
        case 0:
            exploader.render();
            break;
        case 1:
            particles.forEach(function(p) {
                p.render();
            });
        break;
    }
}

window.onload = function() {
  initDrawingCanvas();
};

function loop() {
  update();
  render();

  if (phase === 0 && exploader.complete) {
      phase = 1;
  }
  else if (phase === 1 && checkParticlesComplete()) {
      // reset
      phase = 0;
      exploader.reset();
      particles.length = 0;
      createParticles();
      stopAnimation(); // Stop the animation after completion
  }

  if (animationRunning) {
      requestAnimationFrame(loop);
  }
}

function checkParticlesComplete() {
    for (var i = 0; i < particles.length; i++) {
        if (particles[i].complete === false) return false;
    }
    return true;
}
  
var Ease = {
    inCubic:function (t, b, c, d) {
        t /= d;
        return c*t*t*t + b;
    },
    outCubic:function(t, b, c, d) {
        t /= d;
        t--;
        return c*(t*t*t + 1) + b;
    },
    inOutCubic:function(t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t*t + b;
        t -= 2;
        return c/2*(t*t*t + 2) + b;
    },
    inBack: function (t, b, c, d, s) {
        s = s || 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    }
};

function cubeBezier(p0, c0, c1, p1, t) {
    var p = new Point();
    var nt = (1 - t);

    p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
    p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

    return p;
}