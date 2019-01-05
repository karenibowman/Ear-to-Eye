window.onload = function () {
    "use strict";

    var notice = document.getElementById('notice');
    var circles = document.getElementsByTagName('circle');
    var circleStore=[1.0];
    var visualizer = document.getElementById('visualizer');
    // var h = document.getElementsByTagName('h1')[0];
    var circle;
    // var report = 0;

    var soundAllowed = function (stream) {
        //Audio stops listening in FF without // window.persistAudioStream = stream;
        //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
        //https://support.mozilla.org/en-US/questions/984179
        window.persistAudioStream = stream;
        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        visualizer.setAttribute('viewBox', '0 0 200 200');

				//Through the frequencyArray has a length longer than 255, there seems to be no
        //significant data after this point. Not worth visualizing.
        for (var i = 0 ; i < 255; i++) {
            // path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // path.setAttribute('stroke-dasharray', '4,1');
            // mask.appendChild(path);
        }
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
          	var adjustedLength;
            var averageLength = 0;
            for (var i = 0 ; i < 200; i++) {
              	adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                averageLength = averageLength + adjustedLength;
                //paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + adjustedLength);
            }
            averageLength = averageLength/200;
            if (averageLength > 30){
              notice.style.display = "none";
              console.log("hi");
              circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              circle.setAttribute('r', '1');
              circle.setAttribute('fill', 'rgba(242,206,133,.01)');
              circle.setAttribute('class', 'ripple');
              if(averageLength > 35){
                circle.setAttribute('fill', 'rgba(242,131,121)');
              }
              if(averageLength > 36){
                circle.setAttribute('fill', 'rgba(204,92,120)');
              }
              if(averageLength > 38){
                circle.setAttribute('fill', 'rgba(70,70,128)');
              }
              if(averageLength > 43){
                circle.setAttribute('fill', '#362340');
              }
              visualizer.appendChild(circle);
              circleStore.push(1.0);

            }

            for (var i=0; i<circles.length; i++){
              var current=circles[i].getAttribute('r');
              circleStore[i]=circleStore[i]+.99;
              circles[i].setAttribute('r', Math.floor(circleStore[i]));
              if (current > 500){
                visualizer.removeChild(circles[i]);
                circleStore.shift();
              }
            }

        }
        doDraw();
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
