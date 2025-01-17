function() {
   this.label = 'xyzr';
   this.guide = ['demonstrating coordinates + radius', 'second part'];
   this.show_xyzr = false;
   this.show_sn   = false;

   this.swipe[1] = ['show\nx,y,z and r', function() { this.show_xyzr = true; }];
   this.swipe[3] = ['show\nS and N'    , function() { this.show_sn   = true; }];

   this.render = function() {
      var X = cos(PI/4), Y = sin(PI/4);

      textHeight(this.mScale(0.1));
      mCurve(arc());

      if (this.show_xyzr) {
         mLine([0, 0], [X, Y]);
         mText('x,y,z', [0, 0], .5, 0);
         mText('r', [X*.45, Y*.45], 1.3, 1.2);
      }



      if (this.show_sn) {
         mArrow([-X, Y], [-X*1.5, Y*1.5]);
         mText('N', [-X*1.62, Y*1.62], .5, .5);
         mText('S', [-X, Y], -.25, -.25);
      }

      // if(isShowingGuide){
      //   textHeight(this.mScale(0.25));
      //   mText(this.guide[guides_index], [0, 0], .5, .5);
      // }
   }
}
