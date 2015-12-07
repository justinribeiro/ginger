var Ginger = function() {
  var scene, camera, renderer;

  var aspect;

  var queue = [];

  // Object3Ds with all meshes as children.
  var ginger = new THREE.Object3D();
  var leftEye = new THREE.Object3D();
  var rightEye = new THREE.Object3D();

  var leftEyeOrigin;
  var rightEyeOrigin;

  // All textures that need to be loaded before the meshes.
  var textures = {
    gingercolor: {
      path: 'model/ginger_color.jpg',
      texture: null,
    }
  };

  // Models that must be loaded before adding anything to the scene.
  // This helps keep horrifying body parts from showing before other parts.
  var meshes = {
    gingerhead: {
      path: 'model/gingerhead.json',
      texture: textures.gingercolor,
      morphTargets: true,
      mesh: null
    },
    gingerheadband: {
      path: 'model/gingerheadband.json',
      texture: textures.gingercolor,
      morphTargets: false,
      mesh: null
    },
    gingerheadphones: {
      path: 'model/gingerheadphones.json',
      texture: null,
      morphTargets: false,
      mesh: null
    },
    gingerlefteye: {
      path: 'model/gingerlefteye.json',
      texture: textures.gingercolor,
      morphTargets: false,
      parent: leftEye,
      position: new THREE.Vector3(-0.96, -6.169, -1.305),
      mesh: null
    },
    gingerrighteye: {
      path: 'model/gingerrighteye.json',
      texture: textures.gingercolor,
      morphTargets: false,
      parent: rightEye,
      position: new THREE.Vector3(0.96, -6.169, -1.305),
      mesh: null
    },
    gingerteethbot: {
      path: 'model/gingerteethbot.json',
      texture: textures.gingercolor,
      morphTargets: true,
      mesh: null
    },
    gingerteethtop: {
      path: 'model/gingerteethtop.json',
      texture: textures.gingercolor,
      morphTargets: true,
      mesh: null
    },
    gingertongue: {
      path: 'model/gingertongue.json',
      texture: textures.gingercolor,
      morphTargets: true,
      mesh: null
    }
  };

  var morphs = {
    eyes: {
      value: -1,
      mesh: meshes.gingerhead,
      targets: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      thresholds: [-1, -0.6, -0.3, -0.1, 0, 0.3, 0.4, 0.5, 0.7],

      behavior: function(value) {
        var sex = morphs.sex.value;
        var recede = EASING.linear(sex, 0, -0.125, 1);

        if (leftEyeOrigin == undefined) {
          leftEyeOrigin = leftEye.position;
        }
        if (rightEyeOrigin == undefined) {
          rightEyeOrigin = rightEye.position;
        }

        leftEye.position.x = leftEyeOrigin.x + recede;
        leftEye.position.z = leftEyeOrigin.z + recede;
        rightEye.position.x = rightEyeOrigin.x - recede;
        rightEye.position.z = rightEyeOrigin.z + recede;
      }
    },
    expression: {
      value: 1,
      mesh: meshes.gingerhead,
      targets: [20, 9],
      thresholds: [0, 0.5]
    },
    jawrange: {
      value: 0.6,
      mesh: meshes.gingerhead,
      targets: [10, 11],
      thresholds: [0, 0.5]
    },
    jawtwist: {
      value: -1,
      mesh: meshes.gingerhead,
      targets: [12, 13],
      thresholds: [-1, 0]
    },
    lipcurl: {
      value: 0,
      mesh: meshes.gingerhead,
      targets: [15, 16],
      thresholds: [-1, 0]
    },
    lipsync: {
      value: -1,
      mesh: meshes.gingerhead,
      targets: [17, 18, 19],
      thresholds: [-1, 0, 0.5]
    },
    sex: {
      value: 0.5,
      mesh: meshes.gingerhead,
      targets: [21, 22],
      thresholds: [0, 0.75]
    },
    width: {
      value: 0,
      mesh: meshes.gingerhead,
      targets: [23, 24],
      thresholds: [-1, 0]
    },
    tongue: {
      value: 0,
      mesh: meshes.gingertongue,
      targets: [0, 1, 2, 3, 4, 5, 6],
      thresholds: [0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8]
    },
    teethopenbot: {
      value: 0,
      mesh: meshes.gingerteethbot,
      targets: [3, 0],
      thresholds: [0, 0.2],

      behavior: function(value) {
        var jawrange = morphs.jawrange.value;
        morphs.teethopenbot.value = jawrange;
      }
    },
    teethopentop: {
      value: 0,
      mesh: meshes.gingerteethtop,
      targets: [3, 0],
      thresholds: [0, 0.2],

      behavior: function(value) {
        var jawrange = morphs.jawrange.value;
        morphs.teethopentop.value = jawrange;
      }
    },
    teethsidebot: {
      value: 0,
      mesh: meshes.gingerteethbot,
      targets: [1, 2],
      thresholds: [-1, 0],

      behavior: function(value) {
        var jawtwist = morphs.jawtwist.value;
        morphs.teethsidebot.value = jawtwist;
      }
    },
    teethsidetop: {
      value: 0,
      mesh: meshes.gingerteethtop,
      targets: [1, 2],
      thresholds: [-1, 0],

      behavior: function(value) {
        var jawtwist = morphs.jawtwist.value;
        morphs.teethsidetop.value = jawtwist;
      }
    }
  };

  function morph() {
    // Another separate loop for morph behaviors. This is so the scale or morph
    // of certain meshes can be adjusted to account for others.
    for (var morph in morphs) {
      var morphTarget = morphs[morph];

      // Not all morphs need behaviors so do not assume.
      if (morphTarget['behavior'] != undefined) {
        morphTarget.behavior(morphTarget.value);
      }
    }

    // Apply morph values to the correct targets.
    for (var morph in morphs) {
      var morphTarget = morphs[morph];
      var target = 0;

      // Find which morph needs to have the value applied to.
      // This is determined using thresholds.
      for (var i = 0; i < morphTarget.thresholds.length; i++) {
        var threshold = morphTarget.thresholds[i];

        if (morphTarget.value >= threshold) {
          target = i;
        }
      }

      // The morph that should be updated based on the threshholds.
      var morphid = morphTarget.targets[target];

      // Apply the morph to the currently determined morph in the range.
      for (var i = 0; i < morphTarget.targets.length; i++) {
        var index = morphTarget.targets[i];

        if (morphTarget.targets[i] != morphid) {
          morphTarget.mesh.mesh.morphTargetInfluences[index] = 0;
        } else {
          morphTarget.mesh.mesh.morphTargetInfluences[index] = Math.abs(morphTarget.value);
        }
      }
    }
  }

  function load() {
    loadTextures(function() {
      loadMeshes(function() {
        morph();
      });
    });
  }

  function loadTextures(callback) {
    var goal = Object.keys(textures).length;
    var progress = 0;

    // Loads textures asynchronously.
    var load = function(path, texture) {
      textureLoader.load(path, function(loadedTexture) {
        textures[texture].texture = loadedTexture;
        progress++;

        // Once all textures are loaded the callback is called.
        // This allows chaining mesh loading which requires textures.
        if (progress >= goal) {
          if (callback != null) {
            callback();
          }

          return;
        }
      });
    };

    var textureLoader = new THREE.TextureLoader();

    // Begin the async load.
    for (var texture in textures) {
      var path = textures[texture].path;
      load(path, texture);
    }
  }

  function loadMeshes(callback) {
    var goal = Object.keys(meshes).length;
    var progress = 0;

    var jsonLoader = new THREE.JSONLoader();

    // Adds all meshes loaded into the scene.
    var addMeshes = function() {
      for (var mesh in meshes) {
        if (meshes[mesh].position != null) {
          // Apply the transformations next frame so the initial addition does
          // not overwrite anything we write to the matrix.
          queueNextFrame(function(args) {
            args.mesh.mesh.position.copy(args.mesh.position);
          }, {
            mesh: meshes[mesh]
          });
        }

        if (meshes[mesh].parent != null) {
          meshes[mesh].parent.add(meshes[mesh].mesh);
        } else {
          ginger.add(meshes[mesh].mesh);
        }
      }
    };

    // Loads the meshes asynchronously.
    var load = function(path, mesh) {
      jsonLoader.load(path, function(geometry) {
        var texture;

        if (meshes[mesh].texture != null) {
          texture = meshes[mesh].texture.texture;
        }

        var material = new THREE.MeshLambertMaterial({
          map: texture,
          morphTargets: meshes[mesh].morphTargets
        });

        meshes[mesh].mesh = new THREE.Mesh(geometry, material);
        progress++;

        // Once all meshes are loaded, all meshes are added to the scene.
        // Optionally a callback is available.
        if (progress >= goal) {
          addMeshes();

          if (callback != null) {
            callback();
          }

          return;
        }
      });
    };

    // Begin the async load.
    for (var mesh in meshes) {
      var path = meshes[mesh].path;
      load(path, mesh);
    }
  }

  function queueNextFrame(callback, args) {
    queue.push({
      callback: callback,
      args: args
    });
  }

  function onresize(event) {
    recalculateAspect();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onmousemove(event) {
    var mouse = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.5
    );

    mouse.unproject(camera);

    // When getting the direction, flip the x and y axis or the eyes will
    // look the wrong direction.
    var direction = mouse.sub(camera.position).normalize();
    direction.x *= -1;
    direction.y *= -1;

    var distance = camera.position.z / direction.z;
    var position = camera.position.clone().add(direction.multiplyScalar(distance));

    leftEye.lookAt(position);
    rightEye.lookAt(position);

    // Move the head less than the eyes.
    ginger.lookAt(position);
    ginger.rotation.x /= 5;
    ginger.rotation.y /= 5;
    ginger.rotation.z = 0;
  }

  function recalculateAspect() {
    aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);

    var i = queue.length;
    while(i--) {
      queue[i].callback(queue[i].args);
      queue.splice(i, 1);
    }

    renderer.render(scene, camera);
  }

  return {
    init: function() {
      scene = new THREE.Scene();

      // Find the initial aspect.
      aspect = window.innerWidth / window.innerHeight;

      camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
      camera.position.y = 5;
      camera.position.z = 10;

      // Create a renderer the size of the entire window.
      renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Add the canvas to the renderer wrapper so the panel
      // stays above the canvas.
      document.getElementById('renderer').appendChild(renderer.domElement);

      // Allow viewport resizing whenever the window resizes.
      window.onresize = onresize;

      // Setup event so ginger's eyes track the mouse.
      document.onmousemove = onmousemove;

      // Let there be light! The light is simply a directional light that
      // shines directly inter Ginger's face.
      var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
      directionalLight.position.set(0, 0, 1);
      scene.add(directionalLight);

      // Ginger is the container for all the meshes.
      scene.add(ginger);

      leftEye.position.set(0.96, 6.169, 1.305);
      ginger.add(leftEye);

      rightEye.position.set(-0.96, 6.169, 1.305);
      ginger.add(rightEye);

      // Load ginger in the background.
      load();

      // Start the render loop.
      animate();
    }
  };
};

(function() {
  var ginger = new Ginger();
  ginger.init();
})();
