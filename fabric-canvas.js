(function() {
  var mymap = L.map('mapid').setView([51.505, -0.09], 13);

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFnZGFsZW5hc2Fkb3dza2EiLCJhIjoiY2oydnBmOHVyMDA2aDJxbzI5MGdibzQ5cyJ9.3lcZrjRHar6X_vUXhk4Lcw', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
  }).addTo(mymap);

  var canvas = this.__canvas = new fabric.Canvas(
    'c', {
      selection: false
    }, {
      renderOnAddRemove: false
    });

  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.hasRotatingPoint = false;

  function newCircle(obj) {
    return new fabric.Circle({
      top: obj.top,
      left: obj.left,
      fill: '#48cccd',
      stroke: '#48cccd',
      strokeWidth: 8,
      radius: 10,
      originX: 'center',
      originY: 'center',
      scaleY: 0.9,
      hasControls: false,
      hasBorders: false
    });
  };

  function newLine(arr) {
    return new fabric.Line(arr, {
      fill: '#48cccd',
      stroke: '#48cccd',
      strokeWidth: 8,
      selectable: true,
      originX: 'center',
      originY: 'center',
      perPixelTargetFind: true
    });
  };

  function linkNodes(nodeA, nodeB) {
    // link nodeA (circle or line) with nodeB
    nodeA.forwardLink = nodeB;
    nodeB.backLink = nodeA;
  }

  // var circle contains last created circle
  var circle = newCircle({
    'top': 80,
    'left': 80
  });
  canvas.add(circle);

  canvas.on({
    'mouse:down': function(e) {

      var pos = e.e; // clicked position

      if (!e.target) { // clicked on empty space

        // add new line
        var line = newLine([circle.left, circle.top,
          pos.offsetX, pos.offsetY
        ]);

        // link line to last circle and back
        linkNodes(circle, line);

        // add new circle
        circle = newCircle({
          'left': pos.offsetX,
          'top': pos.offsetY
        });
        linkNodes(line, circle);

        canvas.add(circle, line);
        line.sendToBack();
      } else if (e.target.get('type') === 'line') {

        var oldline = e.target;
        var startcircle = oldline.backLink;
        var endcircle = oldline.forwardLink;

        // add new circle and lines
        var newcircle = newCircle({
          'left': pos.offsetX,
          'top': pos.offsetY
        });
        var firstnewline = newLine([oldline.x1, oldline.y1,
          pos.offsetX, pos.offsetY
        ]);
        var secondnewline = newLine([pos.offsetX, pos.offsetY,
          oldline.x2, oldline.y2
        ]);

        // replace links with new nodes
        linkNodes(startcircle, firstnewline);
        linkNodes(firstnewline, newcircle);
        linkNodes(newcircle, secondnewline);
        linkNodes(secondnewline, endcircle);

        canvas.add(firstnewline, newcircle, secondnewline);
        canvas.remove(oldline);

        firstnewline.sendToBack();
        secondnewline.sendToBack();
      }

      canvas.renderAll();
    },
    'object:moving': function(e) {

      var circle = e.target;
      var linestart = circle.forwardLink;
      var lineend = circle.backLink;

      if (linestart) { // move line start
        linestart.set({
          'x1': circle.left,
          'y1': circle.top
        });
        linestart.setCoords();
      }

      if (lineend) { // move line end
        lineend.set({
          'x2': circle.left,
          'y2': circle.top
        });
        lineend.setCoords();
      }

      canvas.renderAll();
    }
  });

})();
