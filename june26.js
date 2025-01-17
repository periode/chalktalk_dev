/*
    For June 26, 2014 talk.
    With more stuff added for July 7 talk.
*/

   registerGlyph("cupSketch()", [

      // TEMPLATE TO MATCH FOR THE FREEHAND SKETCH OF THE COFFEE CUP.

      [ [ -1,1 ], [ -1,-1 ], [ 1,-1 ], [1,1 ] ],    // SIDES AND BOTTOM.
      [ [ 1,1], [-1,1], [1,1] ],                 // TOP.
      makeOval(-1.6,-.6, 1.2, 1.2, 20, PI/2, 3*PI/2),      // OUTER HANDLE.
      makeOval(-1.4,-.4, 0.8, 0.8, 20, PI/2, 3*PI/2),      // INNER HANDLE.
   ]);

   function cupSketch() {
      var node = root.addNode();

      // THE BODY OF THE CUP IS A HOLLOW TAPERED CYLINDER.

      var body = node.addLathe( [
         [ 0.00, 0, -1.00],
         [ 0.90, 0, -1.00],
         [ 1.00, 0, -0.90],
         [ 1.00, 0,  1.00],
         [ 0.90, 0,  1.00],
         [ 0.90, 0, -0.90],
         [ 0.00, 0, -0.90],
      ], 32);

      // THE HANDLE STICKS INTO THE CUP. WE DON'T CARE SINCE THAT PART IS COVERED BY THE COFFEE.

      var handle = node.addTorus(.3, 8, 24);
      handle.getMatrix().translate(-1,0,0).rotateX(PI/2).scale(.5);

      var coffee = node.addCylinder();
      coffee.getMatrix().translate(0,0,.9).rotateX(PI/2).scale(.95,.01,.95);

      node.setMaterial(whiteMaterial);
      coffee.setMaterial(new phongMaterial().setAmbient(.07,0,0));

      var sketch = geometrySketch(node, [0.1,0,0,-PI/2,0.9]);
      sketch.swirlMode = -1;

      sketch.coffee = coffee;

      sketch.mouseDrag = function() { }

      sketch.swipe[0] = ['swirl', function() {
         this.swirlMode = 0;
         this.swirlStartTime = time;
         this.cream = [];
         for (var i = 0 ; i < 100 ; i++) {
            var t = i / 100;
            this.cream.push( [ mix(-1, 1, t) , 0 ] );
         }
      }];

      sketch.update = function(elapsed) {

         if (this.swirlMode == 0) {
            var x0 = (this.xlo + this.xhi) / 2;
            var y0 = (this.ylo + this.yhi) / 2;
            var r  = (this.xhi - this.xlo) / 2;

            var dt = .25 * (time - this.swirlStartTime);
            if (dt > 5)
               dt = 5 + .1 * (dt - 5);

            var fade = 1 - sCurve(max(0, 1 - dt / 5.5));

            var freq = pow(2, dt/1.5);
            var eps = .01;

            for (var i = 0 ; i < this.cream.length ; i++) {
               var cx = this.cream[i][0];
               var cy = this.cream[i][1];

               var n00 = .2 * noise2(freq * cx      , freq * cy       + 180);
               var n10 = .2 * noise2(freq * cx + eps, freq * cy       + 180);
               var n01 = .2 * noise2(freq * cx      , freq * cy + eps + 180);

               var dx = (n01 - n00) / eps;
               var dy = (n00 - n10) / eps;

               cx += elapsed * dx;
               cy += elapsed * dy;

               var rr = cx * cx + cy * cy;
               var f = mix(.995, 1, 1 - rr);
               cx *= f;
               cy *= f;

               this.cream[i][0] = cx;
               this.cream[i][1] = cy;
            }

            function fillIn(a, eps) {
               for (var i = 0 ; i < a.length - 1 ; i++) {

                  var x0 = a[i  ][0];
                  var y0 = a[i  ][1];

                  var x1 = a[i+1][0];
                  var y1 = a[i+1][1];

                  if (len(x1 - x0, y1 - y0) > 0.1) {
                     var midpoint = [ (x0 + x1) / 2, (y0 + y1) / 2 ];

                     var A = a.slice(0, i+1);
                     var B = [ midpoint ];
                     var C = a.slice(i+1, a.length);

                     a = A.concat(B);
                     a = a.concat(C);

                     i++;
                  }
               }
               return a;
            }

            if (dt < 4.5)
               this.cream = fillIn(this.cream, 0.1);

            _g.save();
            _g.lineWidth = (this.xhi - this.xlo) * mix(.0025, .005, fade * fade);
            _g.strokeStyle = 'rgba(255,255,255,' + (1-fade) + ')';
            _g.beginPath();

            var scale = mix(.55, .75, dt/5), xPrev = 0, yPrev = 0;
            for (var i = 0 ; i < this.cream.length ; i++) {
               var x = x0 + r * this.cream[i][0] * scale;
               var y = y0 + r * this.cream[i][1] * scale;
               if (i == 0 /* || len(x-xPrev,y-yPrev) > 20 */)
                  _g.moveTo(x, y);
               else if (i/this.cream.length < dt)
                  _g.lineTo(x, y);
               xPrev = x;
               yPrev = y;
            }

            sketch.coffee.setMaterial(new phongMaterial().setAmbient(mix(.07,.16,fade*fade),0,0));

            _g.stroke();
            _g.restore();
         }
      }
   }

   function Motion() {
      this.labels = "motion".split(' ');
      this.dragValue = 1;
      var d = 0.3;

      this.mouseDrag = function(x, y) {
         var x0 = this.xlo + sketchPadding;
         var x1 = this.xhi - sketchPadding;
         this.dragValue = (x - x0) / (x1 - x0);
      }

      this.render = function(elapsed) {
         motion[this.colorId] = max(0, min(1, isDef(this.in[0]) ? this.inValue[0] : this.dragValue));
         m.save();
            m.scale(this.size / 360);
            mLine([-1,0],[1,0]);
            mCurve([[1-d,d],[1,0],[1-d,-d]]);
            m.translate(2 * motion[this.colorId] - 1, 0, 0);
            mLine([0,d],[0,-d]);
         m.restore();
      }
   }
   Motion.prototype = new Sketch;

   function Noises() {
      this.labels = "noise1D absns1D".split(' ');

      this.freqs = [1];
      this.mode = "none";
      this.mouseX = 0;
      this.mouseY = 0;
      this.t0 = 0;

      this.under = function(sketch) {
         if (sketch instanceof Noises)
            this.freqs = this.freqs.concat(sketch.freqs);
      }

      this.mouseDrag = function(x, y) {
         if (isDef(this.dragX))
            this.t0 -= 2 * (x - this.dragX) / (this.xhi - this.xlo);
         this.dragX = x;
      }

      this.swipe[2] = ['double freq', function() {
         for (var n = 0 ; n < this.freqs.length ; n++)
            this.freqs[n] *= 2;
      }];

      this.swipe[6] = ['half freq', function() {
         for (var n = 0 ; n < this.freqs.length ; n++)
            this.freqs[n] /= 2;
      }];

      this.render = function(elapsed) {
         m.save();
            m.scale(this.size / 350);

            color(140,140,140);
            mLine([-1,0],[1,0]);
            color(this.color);

            var maxFreq = 1;
            for (var n = 0 ; n < this.freqs.length ; n++)
               maxFreq = max(maxFreq, this.freqs[n]);
            var stepSize = 0.03 / maxFreq;

            var c = [];
            for (var t = -1 ; t < 1 + stepSize ; t += stepSize) {
               if (t > 1)
                  t = 1;
               var signal = 0;
               for (var n = 0 ; n < this.freqs.length ; n++) {
                  var freq = this.freqs[n];
                  var f = noise2((this.t0 + t) * freq, 200 * freq) / freq;
                  signal += this.selection == 1 ? abs(f) : f;
               }
               c.push([t, signal]);
            }
            mCurve(c);

         m.restore();
      }
   }
   Noises.prototype = new Sketch;

/*
   Things to work on:
           DONE Coffee cup:
                profile view morphs into
                3/4 view morphs into
                top view.
                Pour line of cream.
                Swirling cream folds over.
                Swirls more then folds over a second time.
                Mention Feigenbaum,onset of turbulence and powers of two.
        Marble principle
                show stripes (show code for this)
                add phase shift (show code for this)
                use turbulence instead of fractal sum.
        Add gesture to set to a particular page (with its attendant sketch definitions).
        Flame -> corona
        Clouds
        Smoke
        Principle of endless cycle for noise.
        List of movies.
        nVideo, etc., -> WebGL
        Animated creature:  Add noise to movement.
        Trees waving in the wind.
                - build as a fractal.
                - add noise to each node (show code).
        Slice through a 3D block.
        To make a marble vase:
                - draw a contour.
                - draw a circle.
                - drag circle to contour to create 3D shape.
                - add texture (show code).
*/
/*
var marbleFragmentShader = ["\
   void main(void) {\n\
      float x = vPosition.x;\
      float y = vPosition.y;\
      float t = selectedIndex == 3. ? .7 * noise(vec3(x,y,0.)) :\n\
                selectedIndex == 4. ? .5 * fractal(vec3(x,y,5.)) :\n\
                selectedIndex == 5. ? .4 * (turbulence(vec3(x*1.5,y*1.5,10.))+1.8)\n\
                                    : .0 ;\n\
      float s = .5 + .5*cos(7.*x+6.*t);\n\
      if (selectedIndex == 2.) \n\
         s = .5 + noise(vec3(3.*x,3.*y,10.));\n\
      else if (selectedIndex > 0.)\n\
         s = pow(s, .1);\n\
      vec3 color = vec3(s,s*s,s*s*s);\n\
      gl_FragColor = vec4(color,alpha);\n\
   }\n\
"].join("\n");

registerGlyph("marble()",[
   [ [-1,1],[1,1],[1,-1],[-1,-1],[-1,1] ],    // SQUARE OUTLINE CW FROM TOP LEFT.
   [ [-1/3,1], [-1/3,-1] ],
   [ [ 1/3,1], [ 1/3,-1] ],
]);

function marble() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, marbleFragmentShader);
   sketch.code = [
      ["stripe", ".5 + .5 * sin(x)        "],
      ["pinstripe", "pstripe(x) = pow(sin(x), 0.1)"],
      ["noise", ".5 + .5 * noise(x,y,z))"],
      ["add noise", "pstripe(x + noise(x,y,z))"],
      ["add fractal", "pstripe(x + fractal(x,y,z))"],
      ["add turbulence", "pstripe(x + turbulence(x,y,z))"],
   ];
}
*/

/*
var coronaFragmentShader = ["\
   void main(void) {\n\
      float x = vPosition.x;\
      float y = vPosition.y;\
      float a = .7;\n\
      float b = .72;\n\
      float s = 0.;\n\
      float r0 = sqrt(x*x + y*y);\n\
      if (r0 > a && r0 <= 1.) {\n\
         float r = r0;\n\
         if (selectedIndex == 2.)\n\
            r = min(1., r + 0.2 * turbulence(vec3(x,y,0.)));\n\
         else if (selectedIndex == 3.) {\n\
            float ti = uTime*.3;\n\
            float t = mod(ti, 1.);\n\
            float u0 = turbulence(vec3(x*(2.-t)/2., y*(2.-t)/2., .1* t    +2.));\n\
            float u1 = turbulence(vec3(x*(2.-t)   , y*(2.-t)   , .1*(t-1.)+2.));\n\
            r = min(1., r - .1 + 0.3 * mix(u0, u1, t));\n\
         }\n\
         s = (1. - r) / (1. - b);\n\
      }\n\
      if (r0 < b)\n\
         s *= (r0 - a) / (b - a);\n\
      vec3 color = vec3(s);\n\
      if (selectedIndex >= 1.) {\n\
         float ss = s * s;\n\
         color = s*vec3(1.,ss,ss*ss);\n\
      }\n\
      gl_FragColor = vec4(color,alpha*s);\n\
   }\
"].join("\n");

registerGlyph("corona()",[
   makeOval(-.5, -.5, 1, 1, 32,PI/2,5*PI/2),              // INNER LOOP CCW FROM TOP.
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTER LOOP CCW FROM TOP.
]);

function corona() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, coronaFragmentShader);
   sketch.code = [
      ["radial", "r = radius(x,y)"],
      ["color grad", "grad(r)"],
      ["turbulence", "grad(r + turbulence(P))"],
      ["animate", "grad(r + turbulence(P(uTime)))"],
   ];
   sketch.selectedIndex = 3;
}
*/

var flameFragmentShader = ["\
void main(void) {\n\
   vec3 p = vPosition;\n\
   float nx = .5 * noise(.1*p);\n\
   float ny = .5 * noise(.1*p + vec3(100., 0., 0.));\n\
   float s = .25*p.z+turbulence(vec3(p.x+nx,p.y+ny,p.z+.3*uTime));\n\
   float ss = s * s;\n\
   vec3 color = mix(vec3(.35,0.,0.),\n\
                    s * vec3(1.,ss,ss*ss), min(1.,2.*vNormal.z));\n\
   gl_FragColor = vec4(color, alpha);\n\
}\
"].join("\n");


var slicedFragmentShader = ["\
   uniform float frequency;\n\
   uniform float spinAngle;\n\
   void main(void) {\n\
      float x = vPosition.x;\n\
      float y = vPosition.y;\n\
      float rr = x*x + y*y;\n\
      float z = rr >= 1. ? 0. : sqrt(1. - rr);\n\
      float dzdx = -1.3;\n\
      float zp = dzdx * (x - mx * 1.3 - .2);\n\
      if (zp < -z)\n\
         rr = 1.;\n\
      vec3 color = vec3(0.);\n\
      if (rr < 1.) {\n\
         vec3 nn = vec3(x, y, z);\n\
         if (zp < z) {\n\
            z = zp;\n\
            nn = normalize(vec3(-dzdx,0.,1.));\n\
         }\n\
         float s = rr >= 1. ? 0. : .3 + max(0., dot(vec3(.3), nn));\n\
         float X =  x * cos(spinAngle) + z * sin(spinAngle);\n\
         float Y =  y;\n\
         float Z = -x * sin(spinAngle) + z * cos(spinAngle);\n\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\n\
         float t = selectedIndex == 3. ? 0.7 * noise(vec3(X,Y,Z)) :\n\
                   selectedIndex == 5. ? 0.5 * fractal(vec3(X,Y,Z)) :\n\
                   selectedIndex == 6. ? 0.8 * (turbulence(vec3(X,Y,Z+20.))+1.8) :\n\
                                    0.0 ;\n\
         float c = .5 + .5*cos(7.*X+6.*t);\n\
         if (selectedIndex == 1.)\n\
            c = .2 + .8 * c;\n\
         else if (selectedIndex == 0.) {\n\
	    float f = 3. * frequency;\n\
            c = .5 + .4 * noise(vec3(f*X,f*Y,f*Z));\n\
         }\n\
         else if (selectedIndex == 4.)\n\
            c = .5 + .4 * fractal(vec3(3.*X,3.*Y,3.*Z));\n\
         else\n\
            c = pow(c, .1);\n\
         color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\n\
         if (nn.x > 0.) {\n\
            float h = .2 * pow(dot(vec3(.67,.67,.48), nn), 20.);\n\
            color += vec3(h*.4, h*.7, h);\n\
         }\n\
         else {\n\
            float h = .2 * pow(dot(vec3(.707,.707,0.), nn), 7.);\n\
            color += vec3(h, h*.8, h*.6);\n\
         }\n\
      }\n\
      gl_FragColor = vec4(color,alpha*(rr<1.?1.:0.));\n\
   }\
"].join("\n");

registerGlyph("sliced()",[
   makeOval(-1, -1, 2, 2, 32,  PI*0.5, PI*2.5),
   makeOval( 0,  0, 1, 1, 32,  PI*0.5, PI*2.0),
]);

function sliced() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, slicedFragmentShader);
   sketch.code = [
      ["noise", ".5 + .5 * noise(x,y,z))"],
      ["stripe", ".5 + .5 * sin(x)      "],
      ["pinstripe", "pstripe(x) = pow(.5 + .5 * sin(x), 0.1)"],
      ["add noise", "pstripe(x + noise(x,y,z))"],
      ["fractal", "fractal(x,y,z))     "],
      ["add fractal", "pstripe(x + fractal(x,y,z))"],
      ["add turbulence", "pstripe(x + turbulence(x,y,z))"],
   ];
   sketch.mouseDrag = function(x, y) {}
   sketch.spinRate = 0;
   sketch.spinAngle = 0;
/*
   sketch.onClick = function() {
      this.spinRate = -1 - this.spinRate;
   }
*/

   sketch.swipe[2] = ['less spin', function() { this.spinRate = -.5 - this.spinRate; }];
   sketch.swipe[6] = ['more spin', function() { this.spinRate = 0; }];

   sketch.update = function(elapsed) {
      this.setUniform('spinAngle', this.spinAngle += elapsed * this.spinRate);
      this.setUniform('frequency', this.in.length > 0 ? this.inValue[0] : 1);
   }
}

/*
function SplineTest() {
   this.labels = "spline".split(' ');
   this.shape = makeSpline([
      [ .3,1.1],
      [ .3, .9],
      [ .3, .5],
      [ .7,-.1],
      [ .7,-.7],
      [ .3,-1 ],
      [-.3,-1 ],
      [-.7,-.7],
      [-.7,-.1],
      [-.3, .5],
      [-.3, .9],
      [-.3,1.1],
   ]);
   this.render = function(elapsed) {
      m.save();
         mCurve(this.shape);
      m.restore();
   }
}
SplineTest.prototype = new Sketch;
*/

var isCandle = false, candleX, candleY;

function MothAndCandle() {
   this.labels = "moth candle".split(' ');
   this.is3D = true;
   this.isAnimating = false;
   this.mm = new M4();
   this.up = (new M4()).identity().rotateX(PI/2);
   this.moveMothX = 0;
   this.moveMothY = 0;
   this.transitionToCandle = 0;

   this.code = [ ["", ""] ];

   this.swipe[2] = ['animate', function() {
      this.isAnimating = true;
   }];

   this.swipe[6] = ['gather moths', function() {
      for (var i = 0 ; i < sketchPage.sketches.length ; i++) {
         var s = sketchPage.sketches[i];
         if ((s instanceof MothAndCandle) && s.labels[s.selection] == "moth")
            s.isAnimating = true;
      }
   }];

   this.render = function(elapsed) {
      if (this.startTime === undefined)
         this.startTime = time;
      var transition = sCurve(max(0, min(1, 2 * (time - this.startTime) - 1.5)));

      function sharpen(t) { return (t < 0 ? -1 : 1) * pow(abs(t), 4.0); }

      m.save();
      switch (this.labels[this.selection]) {

      case "moth":
         this.code[0][1] = "When I see a light,\n   I go to it.";

         if (this.isAnimating) {

            if (this.animationThrottle === undefined)
               this.animationThrottle = 0;
            this.animationThrottle = min(1, this.animationThrottle + elapsed / 0.5);
            var animationSpeed = sCurve(this.animationThrottle);

            // ALWAYS MOVE FORWARD.

            this.mm.translate(0, 15 * elapsed * animationSpeed, 0);

            // IF THERE IS A CANDLE, HOVER AROUND THE CANDLE.

            if (isCandle) {
               this.mm._m()[12] *= 1 - elapsed/2;
               this.mm._m()[13] *= 1 - elapsed/2;
               this.mm._m()[14] *= 1 - elapsed/2;

               this.transitionToCandle = min(1, this.transitionToCandle + elapsed / 2.0);
               var t = sCurve(this.transitionToCandle);

               var x = (this.xlo + this.xhi) / 2;
               var y = (this.ylo + this.yhi) / 2;

               this.moveMothX += elapsed * max(-10, min(10, candleX - x)) * min(1, 200 / this.size);
               this.moveMothY -= elapsed * max(-10, min(10, candleY - y)) * min(1, 200 / this.size);
            }

            m.translate(this.moveMothX, this.moveMothY, 0);

            // CONTINUALLY CHANGE DIRECTION.

            var turnRate = 25 * elapsed * animationSpeed;
            this.mm.rotateX(turnRate * sharpen(2 * noise2(8 * (time - this.startTime), 200.5 + 10 * this.id)));
            this.mm.rotateZ(turnRate * sharpen(2 * noise2(8 * (time - this.startTime), 300.5 + 10 * this.id)));

            // TRY TO STAY ORIENTED UPRIGHT.

            if (animationSpeed == 1)
               this.mm.aimZ(this.up);
         }

         // DRAW TORSO

         lineWidth(mix(2, 0.5, transition));

         m.scale(this.size / 250);
         m.translate(0,-.1,0);
         m._xf(this.mm._m());
         m.save();
            // ALWAYS TURN TORSO TO FACE VIEW.
            m.rotateY(atan2(m._m()[2], m._m()[0]));
            mCurve(createCurvedLine([-0.01,-0.6],[ 0.01,-0.6], 45.0));
         m.restore();

         // DRAW LEFT WING

         var flap = sin(6 * TAU * time);
         lineWidth(2);

         m.save();
            m.translate(-0.06,0,0);
            if (this.isAnimating)
               m.rotateY(flap);
            mCurve(createCurvedLine([-0.03, 0.1],[-0.34,-0.2],-0.8).
            concat(createCurvedLine([-0.34,-0.2],[-0.00,-0.4],-0.5)));
         m.restore();

         // DRAW RIGHT WING

         m.save();
            m.translate(0.06,0,0);
            if (this.isAnimating)
               m.rotateY(-flap);
            mCurve(createCurvedLine([ 0.03, 0.1],[ 0.34,-0.2], 0.8).
            concat(createCurvedLine([ 0.34,-0.2],[ 0.00,-0.4], 0.5)));
         m.restore();

         // DRAW LEFT AND RIGHT ANTENNAE

         lineWidth(mix(2, 0.5, transition));

         mCurve(createCurvedLine([-0.03, 0.28],[-0.2, 0.8], -0.1));
         mCurve(createCurvedLine([ 0.03, 0.28],[ 0.2, 0.8],  0.1));

         break;

      case "candle":
         this.code[0][1] = "I am a light.";

         // MOTHS GO TO THE FLAME WHEN THE CANDLE APPEARS.

         if (this.glyphTransition >= 0.5 && isNumeric(this.xlo)) {
            candleX = (this.xlo + this.xhi) / 2;
            candleY = this.ylo;
            isCandle = true;
         }

         // THEY WANDER OFF WHEN THE CANDLE DISAPPEARS.

         if (this.fadeAway > 0 && this.fadeAway < 1)
            isCandle = false;

         m.scale(this.size / 350);

         // CANDLE

         mCurve([[-.2,-1.1],[-.2,.3]]
                .concat(createCurvedLine([-.2,.3],[.2,.2],-.1))
                .concat([[.2,.2],[.2,-1.1]]));

         // WICK

         mCurve(createCurvedLine([ .01, .21],[ .01, .4], .05));

         // FLAME

	 var dx = this.isAnimating ? 0.5 * noise(5 * time) : 0;

         mCurve(createCurvedLine([ 0.00+dx*.4 ,0.90],[-0.10+dx*.1 ,0.60], 0.08).
         concat(createCurvedLine([-0.10+dx*.1 ,0.60],[ 0.00 ,0.30],-0.31)));

         mCurve(createCurvedLine([ 0.00+dx*.4 ,0.90],[ 0.195+dx*.1,0.63], 0.03).
         concat(createCurvedLine([ 0.195+dx*.1,0.63],[ 0.00 ,0.30], 0.30)));

         break;
      }
      m.restore();
   }
}
MothAndCandle.prototype = new Sketch;

