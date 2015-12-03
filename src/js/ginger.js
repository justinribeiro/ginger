var Ginger = function() {
  var scene, camera, renderer;

  var aspect;

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
      mesh: null
    },
    gingerheadband: {
      path: 'model/gingerheadband.json',
      texture: textures.gingercolor,
      mesh: null
    },
    gingerheadphones: {
      path: 'model/gingerheadphones.json',
      texture: null,
      mesh: null
    },
    gingerlefteye: {
      path: 'model/gingerlefteye.json',
      texture: textures.gingercolor,
      mesh: null
    },
    gingerrighteye: {
      path: 'model/gingerrighteye.json',
      texture: textures.gingercolor,
      mesh: null
    },
    gingerteethbot: {
      path: 'model/gingerteethbot.json',
      texture: textures.gingercolor,
      mesh: null
    },
    gingerteethtop: {
      path: 'model/gingerteethtop.json',
      texture: textures.gingercolor,
      mesh: null
    },
    gingertongue: {
      path: 'model/gingertongue.json',
      texture: textures.gingercolor,
      mesh: null
    }
  };

  function load() {
    loadTextures();
    loadMeshes();
  }

  function loadTextures() {
    var goal = Object.keys(textures).length;
    var progress = 0;

    var load = function(path, texture) {
      textureLoader.load(path, function(loadedTexture) {
        textures[texture].texture = loadedTexture;
        progress++;

        if (progress >= goal) {
          return;
        }
      });
    };

    var textureLoader = new THREE.TextureLoader();

    for (var texture in textures) {
      var path = textures[texture].path;
      load(path, texture);
    }
  }

  function loadMeshes() {
    var goal = Object.keys(meshes).length;
    var progress = 0;

    var jsonLoader = new THREE.JSONLoader();

    // Adds all meshes loaded into the scene.
    var addMeshes = function() {
      for (var mesh in meshes) {
        scene.add(meshes[mesh].mesh);
      }
    };

    var load = function(path, mesh) {
      jsonLoader.load(path, function(geometry) {
        var texture;

        if (meshes[mesh].texture != null) {
          texture = meshes[mesh].texture.texture;
        }

        var material = new THREE.MeshLambertMaterial({
          map: texture,
        });

        meshes[mesh].mesh = new THREE.Mesh(geometry, material);
        progress++;

        // Add the meshes to the scene when the goal is met.
        if (progress >= goal) {
          addMeshes();
          return;
        }
      });
    };

    for (var mesh in meshes) {
      var path = meshes[mesh].path;
      load(path, mesh);
    }
  }

  function recalculateAspect() {
    aspect = window.innerWidth / window.innerHeight;
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  return {
    init: function() {
      scene = new THREE.Scene();

      // Find the initial aspect.
      recalculateAspect();

      camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
      camera.position.y = 5;
      camera.position.z = 10;

      // Create a renderer the size of the entire window.
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);

      document.body.appendChild(renderer.domElement);

      var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
      directionalLight.position.set(0, 0, 1);
      scene.add(directionalLight);

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
