function() {
   this.labels = 'matrix Bezier Hermite'.split(' ');
   this.inLabel = ['', '\u2715'];
   function rounded(x) { return floor(x * 100) / 100; }
   var c = "cos";
   var s = "sin";
   var nc = "-cos";
   var ns = "-sin";
   this.row = -1;
   this.col = -1;
   this.identityMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
   this.xyztLabel = [
      'x\u2080 y\u2080 z\u2080 t\u2080'.split(' '),
      'x\u2081 y\u2081 z\u2081 t\u2081'.split(' '),
      'x\u2082 y\u2082 z\u2082 t\u2082'.split(' '),
      'x\u2083 y\u2083 z\u2083 t\u2083'.split(' '),
   ];
   this.p = newVec3();
   this.vals = [
       [ 1 , 0 , 0 , 0,   0 , 1 , 0 , 0,    0 , 0 , 1 , 0,    0 , 0 , 0 , 1 ],
       [ 1 , 0 , 0 , 0,   0 , 1 , 0 , 0,    0 , 0 , 1 , 0,   'A','B','C', 1 ],
       [ 1 , 0 , 0 , 0,   0 ,'A','B', 0,    0 ,'C','A', 0,    0 , 0 , 0 , 1 ],
       ['A', 0 ,'C', 0,   0 , 1 , 0 , 0,   'B', 0 ,'A', 0,    0 , 0 , 0 , 1 ],
       ['A','B', 0 , 0,  'C','A', 0 , 0,    0 , 0 , 1 , 0,    0 , 0 , 0 , 1 ],
       ['A', 0 , 0 , 0,   0 ,'B', 0 , 0,    0 , 0 ,'C', 0,    0 , 0 , 0 , 1 ],
       [ 1 , 0 , 0 ,'A',  0 , 1 , 0 ,'B',   0 , 0 , 1 ,'C',   0 , 0 , 0 , 1 ],
    ];
   this.mode = 0;
   this.is_xyzt = false;
   this.onClick = function() { this.mode = (this.mode + 1) % this.vals.length; }
   this.cmdMode = 0;
   this.onCmdClick = function() { this.cmdMode = (this.cmdMode + 1) % 2; }
   this.onCmdSwipe = function(dx,dy) {
      var dir = pieMenuIndex(dx, dy, 8);
      switch (dir) {
      case 2:
      case 6:
         this.is_xyzt = ! this.is_xyzt;
         break;
      }
   }
   this.onPress = function(p) { this.p.copy(p); }

   this.swipe[0] = ['select\nrow'   , function() { this.row = max(0, min(3, floor((1 - this.p.y) / 2 * 4))); }];
   this.swipe[2] = ['select\ncolumn', function() { this.col = max(0, min(3, floor((1 + this.p.x) / 2 * 4))); }];
   this.swipe[4] = ['no\nrow'       , function() { this.row = -1; }];
   this.swipe[6] = ['no\ncolumn'    , function() { this.col = -1; }];

   function sketchMatrix() {
      mCurve([[1,1],[1,-1],[-1,-1]]);
      lineWidth(1);
      mLine([ .5,1],[ .5,-1]);
      mLine([-1,-.5],[1,-.5]);
   }

   this.render = function(elapsed) {

      this.afterSketch(function() {
         var x, y;

         if (this.cmdMode == 1) {
            color(fadedColor(0.15, this.colorId));
            mFillRect([-1,-.5], [.5,1]);
            color(defaultPenColor);
         }

         if (this.row >= 0) {
            color(fadedColor(.33, this.colorId));
            y = 1 - 2 * (this.row / 4);
            mFillCurve([ [-1,y], [1,y], [1,y-.5], [-1,y-.5], [-1,y] ]);
            color(defaultPenColor);
         }

         if (this.col >= 0) {
            color(fadedColor(.33, this.colorId));
            x = 2 * (this.col / 4) - 1;
            mFillCurve([ [x,-1], [x,1], [x+.5,1], [x+.5,-1], [x,-1] ]);
            color(defaultPenColor);
         }

      });

      var type = this.labels[this.selection];

      switch (type) {
      case 'matrix':
         sketchMatrix();
         break;
      case 'Bezier':
         this.duringSketch(function() {
            mLine([-1, 1],[-1,-1]);
            mCurve( [[-1,1],[-.5,1]].concat(makeOval(-1,0,1,1,16,PI/2,-PI/2))
                                    .concat([[-.5,0],[-1,0]]) );
            mCurve( [[-1,0],[-.25,0]].concat(makeOval(-.75,-1,1,1,16,PI/2,-PI/2))
                                     .concat([[-.25,-1],[-1,-1]]) );
         });
         this.afterSketch(function() {
            sketchMatrix();
         });
         break;
      case 'Hermite':
         this.duringSketch(function() {
            mLine([-1, 1],[-1,-1]);
            mLine([-1, 0],[ 1, 0]);
            mLine([ 1, 1],[ 1,-1]);
         });
         this.afterSketch(function() {
            sketchMatrix();
         });
         break;
      }

      this.afterSketch(function() {
         var i, x, y, z, sub, val, vals, value, col, row, out;

         mLine([-1, .5],[1,  .5]);
         mLine([-1,  0],[1,   0]);
         mLine([-.5, 1],[-.5,-1]);
         mLine([  0, 1],[  0,-1]);
         lineWidth(2);
         mCurve([[-1,-1],[-1,1],[1,1]]);

         out = [];

         switch (type) {

         case 'Bezier':
            out = [ -1,3,-3,1 , 3,-6,3,0 , -3,3,0,0 , 1,0,0,0 ];
            break;

         case 'Hermite':
            out = [ 2,-3,0,1 , -2,3,0,0 , 1,-2,1,0 , 1,-1,0,0 ];
            break;

         case 'matrix':
            if (isMatrixArray(this.inValue[0])) {
               for (var i = 0 ; i < 16 ; i++)
                  out.push(roundedString(this.inValues[i]));
            }
            else {
               sub = ["x","y","z"];
               switch (this.mode) {
               case 1: sub = ["tx","ty","tz"]; break;
               case 2:
               case 3:
               case 4: sub = ["cos","sin","-sin"]; break;
               case 5: sub = ["sx","sy","sz"]; break;
               case 6: sub = ["px","py","pz"]; break;
               }

               if (isDef(this.inValue[0])) {
		  if (this.inValue[0] instanceof Array) {
                     x = rounded(this.inValue[0][0], 0);
                     y = rounded(this.inValue[0][1], x);
                     z = rounded(this.inValue[0][2], y);
                  }
		  else {
		     value = parseFloat(this.inValue[0]);
                     if (isNumeric(value))
                        x = y = z = rounded(value, 0);
                  }

                  switch (this.mode) {
                  case 1:
                  case 5:
                  case 6:
                     sub[0] = x;
                     sub[1] = y;
                     sub[2] = z;
                     break;
                  case 2:
                  case 3:
                  case 4:
                     sub[0] = rounded(cos(x));
                     sub[1] = rounded(sin(y));
                     sub[2] = -sub[1];
                     break;
                  }
               }
            }

            vals = this.vals[this.mode];

            for (col = 0 ; col < 4 ; col++)
            for (row = 0 ; row < 4 ; row++) {
               val = "" + vals[row + 4 * col];
               if (val == "A") val = sub[0];
               if (val == "B") val = sub[1];
               if (val == "C") val = sub[2];
               out.push(val);
            }

            break;
         }

         for (col = 0 ; col < 4 ; col++)
         for (row = 0 ; row < 4 ; row++) {
            x = (col - 1.5) / 2;
            y = (1.5 - row) / 2;
            val = this.is_xyzt ? this.xyztLabel[row][col] : out[row + 4 * col];
            textHeight(max(this.xhi - this.xlo, this.yhi - this.ylo) / 9 / pow(("" + val).length, 0.4));
            mText(val, [x, y], .5, .5);
         }

         for (i = 0 ; i < 16 ; i++) {
            value = parseFloat(out[i]);
            this.matrixValues[i] = isNumeric(value) ? value : out[i];
         }
      });
   }

   this.output = function() {
      var type = this.labels[this.selection];
      var outValue = type != 'matrix' || this.inValues.length > 0 ? this.matrixValues : this.identityMatrix;
      var i = this.labels[this.selection] == 'matrix' ? 1 : 0;
      if (isDef(this.inValue[i]))
         outValue = mult(outValue, this.inValue[i]);
      return outValue;
   }

   this.matrixValues = newArray(16);
}

