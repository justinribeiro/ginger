var Ginger = function() {
  var scene, camera, renderer;

  var aspect;

  // Object3D with all meshes as children.
  var ginger;

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
      mesh: null
    },
    gingerrighteye: {
      path: 'model/gingerrighteye.json',
      texture: textures.gingercolor,
      morphTargets: false,
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

        meshes.gingerlefteye.mesh.position.x = recede;
        meshes.gingerlefteye.mesh.position.z = recede;
        meshes.gingerrighteye.mesh.position.x = -recede;
        meshes.gingerrighteye.mesh.position.z = recede;
      }
    },
    expression: {
      value: 0.2,
      mesh: meshes.gingerhead,
      targets: [20, 9],
      thresholds: [0, 0.5]
    },
    jawrange: {
      value: 0.5,
      mesh: meshes.gingerhead,
      targets: [10, 11],
      thresholds: [0, 0.5]
    },
    jawtwist: {
      value: 0,
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
    }
  };

  function morph() {
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

    // Another separate loop for morph behaviors. This is so the scale or morph
    // of certain meshes can be adjusted to account for others.
    for (var morph in morphs) {
      var morphTarget = morphs[morph];

      // Not all morphs need behaviors so do not assume.
      if (morphTarget['behavior'] != undefined) {
        morphTarget.behavior(morphTarget.value);
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
        ginger.add(meshes[mesh].mesh);
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

  function onresize(event) {
    recalculateAspect();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function recalculateAspect() {
    aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);
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

      // Let there be light! The light is simply a directional light that
      // shines directly inter Ginger's face.
      var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
      directionalLight.position.set(0, 0, 1);
      scene.add(directionalLight);

      // Ginger is the container for all the meshes.
      ginger = new THREE.Object3D();
      scene.add(ginger);

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
