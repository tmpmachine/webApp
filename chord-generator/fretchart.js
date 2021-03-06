/*
0.0211 - 5 Nov - change dataset for chord name
0.021 - remove garbage code
0.02 - 1 january 20 - added more palette settings for guitar
0.01 - 31 december 19 - merging basschart & guichart
*/

(function () {
  
  function FretChart(instrument = 'guitar') {
    
    let canvas, ctx;
    this.capo = 0;
    this.scale = 1;
    this.fretLength = 4;
    this.isLandscape = false;
    this.stringNumber = (instrument == 'guitar') ? 6 : 4;
    
    if (instrument == 'guitar') {
      this.palette = {
        fretboard: '#231818',
        fretMarker: '#c4c2c2',
        finger: '#ffffff',
        open: '#000000',
        nut: '#baae8f',
        special1: '#1e90ff',
        special2: '#ee82ee',
        fretNum: '#000000',
        fret: '#9f9d9d',
        fretShadow: '#564b4b',
        string: '#be907a',
        stringShadow: '#232020',
        string12: '#c0c0c0',
        string12Shadow: '#000',
        name: '#000000',
        circle: '#b73b3b',
        circleText: '#ffffff'
      };
    } else {
      this.palette = {
        fretboard: 'burlywood',
        fretMarker: '#333',
        finger: '#ffffff',
        open: '#ffffff',
        nut: '#2d2a28',
        special1: '#1e90ff',
        special2: '#ee82ee',
        fretNum: '#ffffff',
        fret: '#aaa',
        fretShadow: '#907f76',
        string: '#eee',
        stringShadow: '#777',
        name: '#000000',
        circle: '#7c2727',
        circleText: '#ffffff'
      };
    }
    
    // 
    // ***
    // 
    
    function drawNut(startFret) {
      if (startFret === 1) {
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'black';
        ctx.fillStyle = this.palette.nut;
        ctx.fillRect(this.x - this.fretMargin, this.y - 3 * this.scale, (this.stringNumber - 1) * this.stringPadding + 2 * this.fretMargin, 3 * this.scale);
        ctx.shadowBlur = 0;
      }
    }
    
    function drawCapo(startFret) {
      if (this.capo > 0 && this.capo === startFret) {
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'black';
        ctx.fillStyle = '#222222';
        ctx.fillRect(this.x - this.fretMargin * 2, this.y - 3 * this.scale, (this.stringNumber - 1) * this.stringPadding + 2 * this.fretMargin * 2, 3 * this.scale);
        ctx.shadowBlur = 0;
      }
    }
    
    function drawString() {
      ctx.beginPath();
      ctx.lineWidth = (instrument == 'guitar') ? 2 * this.scale : 2.5 * this.scale;
      for (let i = 0; i < this.stringNumber; i++) {
        if (instrument == 'guitar' && i >= 4) {
          ctx.stroke();
          ctx.beginPath();
        }
        ctx.strokeStyle = (instrument == 'guitar' && i >= 4) ? this.palette.string12Shadow : this.palette.stringShadow;
        ctx.moveTo(this.x + i * this.stringPadding, this.y);
        ctx.lineTo(this.x + i * this.stringPadding, this.y + this.fretLength * this.fretPadding);
      }
      ctx.stroke();
      
      ctx.lineWidth = (instrument == 'guitar') ? 1 * this.scale : 1.5 * this.scale;
      for (let i = 0; i < this.stringNumber; i++) {
        if (instrument == 'guitar' && i >= 4) {
          ctx.stroke();
          ctx.beginPath();
        }
        ctx.strokeStyle = (instrument == 'guitar' && i >= 4) ? this.palette.string12 : this.palette.string;
        ctx.moveTo(this.x + i * this.stringPadding, this.y);
        ctx.lineTo(this.x + i * this.stringPadding, this.y + this.fretLength * this.fretPadding);
      }
      ctx.stroke();
    }
    
    function drawFret() {
      ctx.beginPath();
      ctx.strokeStyle = this.palette.fretShadow;
      ctx.lineWidth = 2*this.scale;
      for (let i = 0; i <= this.fretLength; i++) {
        ctx.moveTo(this.x - this.fretMargin, this.y + i * this.fretPadding);
        ctx.lineTo(this.x + (this.stringNumber - 1) * this.stringPadding + this.fretMargin, this.y + i * this.fretPadding);
      }
      ctx.stroke();

      ctx.strokeStyle = this.palette.fret;
      ctx.lineWidth = 1 * this.scale;
      for (let i = 0; i <= this.fretLength; i++) {
        ctx.moveTo(this.x - this.fretMargin, this.y + i * this.fretPadding);
        ctx.lineTo(this.x + (this.stringNumber - 1) * this.stringPadding + this.fretMargin, this.y + i * this.fretPadding);
      }
      ctx.stroke();
    }

    function fretOf(fret) {
      switch (fret) {
        case 'a': fret = 10; break;
        case 'b': fret = 11; break;
        case 'c': fret = 12; break;
      }
      return fret;
    }

    function getStartFret(chord) {
      let fret = [];
      for (let c of chord) {
        c = fretOf(c);
        if (!(c == 'x' || c == '0'))
          fret.push(parseInt(c));
      }
      if (fret.length === 0) return 1;
      
      let min = Math.min(...fret);
      let max = Math.max(...fret);
      
      if (max <= this.fretLength)
        return 1;
      
      if (min == max)
        return (min < 4) ? 1 : min - 1;
      
      if (min > 2)
        return (max - min <= 2) ? min - 1 : min;
      else if (max - min >= 3)
        return min;
      
      return 1;
    }
    
    function drawFretMarker(x, y, markerSize) {
      ctx.fillStyle = this.palette.fretMarker;
      ctx.beginPath();
      ctx.arc(x, y, markerSize, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    function drawFretNumber(fret) {
      ctx.font = 8 * this.scale + "px monospace";
      let markerSize = 2 * this.scale;
      for (let i = fret, j = 0; i < fret + this.fretLength; i++, j++) {
        let y = this.y + j * this.fretPadding + this.fretPadding / 2;
        if ([3,5,7,9].includes(i))
          drawFretMarker(this.x + (this.stringNumber - 1) * this.stringPadding / 2, y, markerSize);
        else if (i == 12) {
          drawFretMarker(this.x + (this.stringNumber - 3) * this.stringPadding / 2, y, markerSize);
          drawFretMarker(this.x + (this.stringNumber + 1) * this.stringPadding / 2, y, markerSize);
        }
        
        if (fret > 1 || this.fretLength > 4) {
          ctx.fillStyle = this.palette.fretNum;
          x = this.x + (this.stringNumber - 1) * this.stringPadding + this.stringPadding / 1.5;
          y = this.y + j * this.fretPadding + this.fretPadding / 1.6;
          ctx.fillText(i, x, y);
        }
      }
    }
    
    function drawCircle(chord, finger, f, c, fret) {
      
      ctx.beginPath();
      chord = chord.split(',');
      if (chord.length === 1)
        chord = chord[0].split('');
      while (chord.length < 6)
        chord.push('x');
  
      finger = finger.split('');
      chord.map(function(c,i){
        if ((c == '0' || c == 'x') && finger[i] != '0')
          finger.splice(i,0,' ');
      });
      
      if (finger.length > 6)
        finger.splice(6,finger.length-6);
      
      let match = f.match(/1/g);
      let match2 = f.match(/3/g);
      let barMode = false;
      let whatBar = 1;
      
      let from, to, jumps;
      if (match !== null && match.length > 1) {
        barMode = true;
        from = -1;
        to = -1;
        for (let i = 0; i < finger.length; i++)
          if (finger[i] == '1') { from=i;break; }
        for (let i = finger.length; i > 0; i--)
          if (finger[i] == '1') { to=i;break; }
        jumps = to - from;
      } else if (match2 !== null && match2.length > 1) {
        whatBar = 3;
        barMode = true;
        from = -1;
        to = -1;
        for (let i = 0; i < finger.length; i++)
          if (finger[i] == '3') { from=i;break; }
        for (let i = finger.length; i > 0; i--)
          if (finger[i] == '3') { to=i;break; }
        jumps = to - from;
      }
      
      for (let i = 0, c, fonce = false; c = chord[i], i < chord.length; i++) {
        
        if (instrument == 'guitar')
          f = finger[i];
        
        if (instrument == 'guitar' && (c == ' ' || c == 'x' || c == '0')) {
          ctx.font = 10 * this.scale + 'px monospace';
          ctx.fillStyle = this.palette.open;
          if (c == '0') c = 'o';
          ctx.fillText(c, this.x + i * this.stringPadding - 3 * this.scale, this.y - 5 * this.scale - this.fretPadding / 10);
        } else {
          
          c = fretOf(c);
          
          if (c >= fret) {
            
            let fretY = this.y + (c - (fret - 1)) * this.fretPadding - this.fretPadding / 2;
            
            if (barMode && f == whatBar && fonce === false) {
              
              fonce = true;

              let x = this.x + from * this.stringPadding;
              ctx.beginPath();
              ctx.strokeStyle = this.palette.circle;
              ctx.shadowBlur = 2;
              ctx.shadowColor = 'black';
              ctx.lineWidth = this.stringPadding / 2.2 * 2;
              ctx.lineCap = 'round';
              ctx.moveTo(x, fretY);
              ctx.lineTo(x + jumps * this.stringPadding, fretY);
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.lineWidth = 1;
  
              let midX = this.stringPadding * (from + 1) + ((this.stringPadding * (to + 1) - this.stringPadding * from)) / 2 - this.stringPadding / 2.5;
              ctx.font = 10 * this.scale + 'px monospace';
              ctx.fillStyle = this.palette.circleText;
              ctx.fillText(f, midX, fretY + this.stringPadding / 5.2);
            } else {
              
              if (f == whatBar && fonce) continue;
                 
              let circleSize =  instrument == 'guitar' ? this.stringPadding / 2.2 : this.stringPadding / 2.7;
              ctx.shadowBlur = 2;
              ctx.shadowColor = 'black';
              ctx.beginPath();
              ctx.arc(this.x + i * this.stringPadding, fretY, circleSize, 0, 2 * Math.PI);
              ctx.fillStyle = this.palette.circle;
              ctx.fill();
              ctx.shadowBlur = 0;
               
              if (f !== undefined) {
                let fontSize = (instrument == 'guitar') ? 10 : (f.length > 1) ?  7 : 8;
                ctx.font = fontSize * this.scale + 'px monospace';
                let textWidth = ctx.measureText(f).width / 2;
                let textHeight = (f.length > 1) ? textWidth / 2 : textWidth;
                let x = this.x + i * this.stringPadding - textWidth;
                let y = fretY + textHeight;
                
                ctx.fillStyle = this.palette.circleText;
                ctx.fillText(f, x, y);
              }
            }
          }
        }
      }
    }
    
    function generateCanvas({fret, finger, name}) {
      
      initializeChartStyle();
      
      this.padding = 20 * this.scale;
      this.stringPadding = 15 * this.scale;
      this.fretPadding = 23 * this.scale;
      this.fretMargin = 4 * this.scale;
      this.x = this.padding;
      this.y = this.padding + this.padding / 5;
      
      canvas = document.createElement('canvas');
      canvas.width = (this.stringNumber + 2) * this.stringPadding;
      canvas.height = this.fretLength * this.fretPadding + 55 * this.scale;
      canvas.dataset.fret = fret;
      canvas.dataset.finger = finger;
      canvas.dataset.name = name;
      ctx = canvas.getContext("2d");
    }
    
    function drawStringName() {
      if (instrument == 'guitar') return;
      for (let i = 0; i < this.stringNumber; i++) {
        ctx.font = 10 * this.scale+'px monospace';
        ctx.fillStyle = this.palette.open;
        let openString = 'EADGBE';
        ctx.fillText(openString[i], this.x + i * this.stringPadding - 3 * this.scale, this.y - 5 * this.scale - this.fretPadding / 10);
      }
    }
    
    function drawFretboard() {
      ctx.fillStyle = this.palette.fretboard;
      ctx.fillRect(this.x - this.fretMargin, this.y, (this.stringPadding * (this.stringNumber - 1)) + 2 * this.fretMargin, this.fretPadding * this.fretLength);
    }
    
    function drawChordName(name) {
      if (instrument != 'guitar') return;
      ctx.beginPath();
      if (name.indexOf('*') > 0) {
        ctx.fillStyle = this.palette.special1;
        ctx.fillRect(this.x+6*this.stringPadding-5,this.y+4*this.fretPadding+5,5,5);
        if (name.indexOf('**') > 0) {
          ctx.fillStyle = this.palette.special2;
          ctx.fillRect(7*this.stringPadding-5,this.y+4*this.fretPadding+10,5,5);
        }
        name = name.replace(/\*+/,'');
      }
      ctx.fillStyle = this.palette.name;
      ctx.font = this.fontSize*this.scale+"px "+this.fontFamily;
      let txtWidth = ctx.measureText(name).width;
      
      ctx.fillText(name, this.x+((this.stringNumber - 1)*this.stringPadding-txtWidth)/2, this.y+(this.fretLength+1)*this.fretPadding+(this.top+Math.max(0,this.fontHeight-(this.y+5))));
    }
    
    function initializeChartStyle() {
      
      let fontEl = document.getElementById('guichart');
      if (!fontEl) {
        
        fontEl = document.createElement('div');
        fontEl.style.height = '100px';
        fontEl.style.opacity = '0';
        fontEl.style.position = 'absolute';
        fontEl.style.top = '0';
        fontEl.style.left = '0';
        fontEl.style.zIndex = '-8177';
        fontEl.style.overflow = 'hidden';
        fontEl.setAttribute('id', 'guichart');
        document.body.appendChild(fontEl)
      }
      
      fontEl.innerHTML = '';
      
      let fontText = document.createElement('div');
      fontText.textContent = 'Guichart';
      fontEl.appendChild(fontText);
      this.fontFamily = window.getComputedStyle(fontText).fontFamily;
      this.fontSize = window.getComputedStyle(fontText).fontSize.replace('px', '');
      this.fontWeight = window.getComputedStyle(fontText).fontWeight;
      this.fontHeight = fontText.offsetHeight;
      this.top = window.getComputedStyle(fontText).top.replace('px', '');
      this.top = (this.top == 'auto') ? 0 : Number(this.top);
    }
    
    drawStringName = drawStringName.bind(this);
    drawFretboard = drawFretboard.bind(this);
    initializeChartStyle = initializeChartStyle.bind(this);
    drawChordName = drawChordName.bind(this);
    drawNut = drawNut.bind(this);
    drawCapo = drawCapo.bind(this);
    drawFret = drawFret.bind(this);
    drawFretMarker = drawFretMarker.bind(this);
    drawFretNumber = drawFretNumber.bind(this);
    drawString = drawString.bind(this);
    generateCanvas = generateCanvas.bind(this);
    drawCircle = drawCircle.bind(this);
    getStartFret = getStartFret.bind(this);
    
    // 
    // ***
    // 
    
    this.setPalette = function(palette) {
      for (let type in palette)
        this.palette[type] = palette[type];
    };
    
    this.getPalette = function() {
      return JSON.parse(JSON.stringify(this.palette));
    };
    
    this.formula = function({fret='xxxxxx', finger='      ', name = ' '}={}) {
      if (this.fretLength < 4)
        this.fretLength = 4;
      
      generateCanvas({fret, finger, name});
      
      let startFret = getStartFret(fret);
      if (!this.isOverlap) {
        drawStringName();
        drawFretboard();
        drawFret();
        drawNut(startFret);
        drawCapo(startFret);
        drawString();
        drawFretNumber(startFret);
        drawChordName(name);
      }
      
      drawCircle(fret, finger, finger, fret, startFret);
      
      return canvas;
    };
  }
  
  if (window.FretChart === undefined)
    window.FretChart = FretChart;
  else
    console.error('fretchart.js', 'Failed to initialize. Duplicate variable exists.');
})();
