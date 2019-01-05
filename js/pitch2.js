function popupInfo() {
  var popup = document.getElementById("text");
  var infoButton = document.getElementById("info-button");
  var info = document.getElementById("info");
  info.classList.toggle("ease");
  info.classList.toggle("normal");
  if (popup.style.display=="none"){
    popup.style.display="block";
    infoButton.innerHTML ="-";
  }
  else {
    popup.style.display="none";
    infoButton.innerHTML ="+";
  }
}

window.onload = function () {
    document.getElementById("info").addEventListener("click", popupInfo());


    "use strict";
    // var paths = document.getElementsByTagName('path');
    // var visualizer = document.getElementById('visualizer');
    // var mask = visualizer.getElementById('mask');
    // var h = document.getElementsByTagName('h1')[0];
    // var path;
    // var report = 0;

    var soundAllowed = function (stream) {
        //Audio stops listening in FF without // window.persistAudioStream = stream;
        //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
        //https://support.mozilla.org/en-US/questions/984179
        var detectorElem,
          canvasElem,
          waveCanvas,
          pitchElem,
          noteElem,
          detuneElem,
          detuneAmount,
          flatElem,
          sharpElem,
          noticeElem,
          displayElem,
          markerElem;

        detectorElem = document.getElementById( "detector" );
        canvasElem = document.getElementById( "output" );
        pitchElem = document.getElementById( "pitch" );
        noteElem = document.getElementById( "note" );
        detuneElem = document.getElementById( "detune" );
        detuneAmount = document.getElementById( "detune_amt" );
        flatElem = document.getElementById( "flat" );
        sharpElem = document.getElementById( "sharp" );
        noticeElem= document.getElementById( "notice");
        displayElem = document.getElementById( "display-slider");
        markerElem = document.getElementById( "marker");

        window.persistAudioStream = stream;
        var audioContext = new AudioContext();
        var audioStream = audioContext.createMediaStreamSource( stream );
        var analyser = audioContext.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);

        var rafID = null;
        var tracks = null;
        var buflen = 1024;
        var buf = new Float32Array( buflen );

        var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

        function noteFromPitch( frequency ) {
        	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        	return Math.round( noteNum ) + 69;
        }

        function frequencyFromNoteNumber( note ) {
        	return 440 * Math.pow(2,(note-69)/12);
        }

        function centsOffFromPitch( frequency, note ) {
        	return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
        }

        var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
        var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

        function autoCorrelate( buf, sampleRate ) {
        	var SIZE = buf.length;
        	var MAX_SAMPLES = Math.floor(SIZE/2);
        	var best_offset = -1;
        	var best_correlation = 0;
        	var rms = 0;
        	var foundGoodCorrelation = false;
        	var correlations = new Array(MAX_SAMPLES);

        	for (var i=0;i<SIZE;i++) {
        		var val = buf[i];
        		rms += val*val;
        	}
        	rms = Math.sqrt(rms/SIZE);
        	if (rms<0.01) // not enough signal
        		return -1;

        	var lastCorrelation=1;
        	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
        		var correlation = 0;

        		for (var i=0; i<MAX_SAMPLES; i++) {
        			correlation += Math.abs((buf[i])-(buf[i+offset]));
        		}
        		correlation = 1 - (correlation/MAX_SAMPLES);
        		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
        		if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
        			foundGoodCorrelation = true;
        			if (correlation > best_correlation) {
        				best_correlation = correlation;
        				best_offset = offset;
        			}
        		} else if (foundGoodCorrelation) {
        			// we know best_offset >=1,
        			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
        			// we can't drop into this clause until the following pass (else if).
        			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
        			return sampleRate/(best_offset+(8*shift));
        		}
        		lastCorrelation = correlation;
        	}
        	if (best_correlation > 0.01) {
        		return sampleRate/best_offset;
        	}
        	return -1;
        //	var best_frequency = sampleRate/best_offset;
        }

        function updatePitch( time ) {
        	var cycles = new Array;
        	analyser.getFloatTimeDomainData( buf );
        	var ac = autoCorrelate( buf, audioContext.sampleRate );
        	// TODO: Paint confidence meter on canvasElem here.

         	if (ac == -1) {
            //used to set to blank, but was too visually distracting
         	} else {
        	 	//detectorElem.className = "confident";
            displayElem.style.display="block";
            markerElem.style.display="block";
            noticeElem.style.display = "none";
        	 	var pitch = ac;
        	 	pitchElem.innerText = Math.round( pitch ) + " Hz" ;
        	 	var note =  noteFromPitch( pitch );
        		noteElem.innerHTML = noteStrings[note%12];
        		var detune = centsOffFromPitch( pitch, note );
            displayElem.value = 51 + centsOffFromPitch( pitch, note );
        		if (detune == 0 ) {
        			detuneElem.className = "";
        			detuneAmount.innerHTML = "--";
        		} else {
        			if (detune < 0){
        				detuneElem.className = "flat";
                flatElem.style.display = "block";
                sharpElem.style.display = "none";
              }
        			else{
        				detuneElem.className = "sharp";
                sharpElem.style.display = "block";
                flatElem.style.display = "none";
              }
        			detuneAmount.innerHTML = Math.abs( detune );
        		}
        	}

        	if (!window.requestAnimationFrame)
        		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        	rafID = window.requestAnimationFrame( updatePitch );
        }
        updatePitch();
    }

    var soundNotAllowed = function (error) {
        h.innerHTML = "You must allow your microphone.";
        console.log(error);
    }

    /*window.navigator = window.navigator || {};
    /*navigator.getUserMedia =  navigator.getUserMedia       ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia    ||
                              null;*/
    navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);

};
