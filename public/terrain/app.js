    //------------------------------------------------------
    // Globales variables
    //------------------------------------------------------
    var MAX_HEIGHT = 10;
    var renderer;
    var scene;
    var camera;
    var control;
    var stats;
    var ground;

    //------------------------------------------------------
    // Main
    //------------------------------------------------------
    /**
     * Initializes the scene, camera and objects. Called when the window is
     * loaded by using window.onload (see below)
     */
    function init() {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        //scene = new THREE.Scene();        
        scene = new Physijs.Scene;
        scene.setGravity(new THREE.Vector3(0,-50,0));

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        camera.position.x = 100;
        camera.position.y = 150;
        camera.position.z = 450;
        
        camera.near = 500;
        camera.far = 4000;
        camera.fov = 30;
        camera.lookAt(scene.position);      

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true; 

         // add controls
        cameraControl = new THREE.OrbitControls(camera, renderer.domElement);      

        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(100, 150, 450);  
        spotLight.castShadow = true;
  
        scene.add(spotLight);
        scene.add(new THREE.AmbientLight(0x252525));

        // setup the control object for the control gui
        control = new function() {
            this.toFaceMaterial = function(){
                var mesh = scene.getObjectByName('terrain');
                var mat = new THREE.MeshLambertMaterial();
                mat.vertexColors = THREE.FaceColors;
                mat.shading = THREE.NoShading;
                mesh.material = mat;
            };
            this.toNormalMaterial = function(){
                var mesh = scene.getObjectByName('terrain');
                var mat = new THREE.MeshNormalMaterial();
                mesh.material = mat;
            };
            this.smoothShading = false;
            this.onSmoothShadingChange = function() {
                var material = scene.getObjectByName('terrain').material;
                var geom = scene.getObjectByName('terrain').geometry;
                if (this.object.smoothShading) {
                    material.shading = THREE.SmoothShading;
                } else {
                    material.shading = THREE.NoShading;
                }
                material.needsUpdate = true;
                geom.normalsNeedUpdate = true;
            }
        };

        // add the control gui and the stats UI
        addControlGui(control);
        addStatsObject();

        // add the output of the renderer to the html element
        document.body.appendChild(renderer.domElement);

        // set up the example specific stuff
        create3DTerrain(140, 140, 2.5, 2.5, MAX_HEIGHT);
        createSphere(10);

        // call the render function, after the first render, interval is determined
        // by requestAnimationFrame
        render();
    }
    //------------------------------------------------------
    // Functions specific to this example
    //------------------------------------------------------
    function create3DTerrain(width, depth, spacingX, spacingZ, height) {
        var date = new Date();
        var scale = chroma.scale(['blue','green','red']).domain([0,MAX_HEIGHT]);
        noise.seed(date.getMilliseconds());
      
        var plane = new THREE.PlaneGeometry(1200,1000,100,100);

        for (var i = 0; i < plane.vertices.length;i++) {
            var vertex = plane.vertices[i];
            var value = Math.abs(noise.perlin2(vertex.x / 10, vertex.y / 10, 0)* height*2);
            vertex.z = value * 4;
        }

        plane.computeVertexNormals(true);
        plane.computeFaceNormals();

        plane.receiveShadow = true;

        var mat = new THREE.MeshPhongMaterial();
        mat.map = THREE.ImageUtils.loadTexture("./textures/ground/grasslight-big.jpg");


        var ground = new Physijs.HeightfieldMesh(
            plane,
            mat,
            0
        );
        ground.name = 'terrain';
        ground.rotation.x = -Math.PI/2;
        ground.receiveShadow = true;
        scene.add(ground);
    }

    function createSphere(number){       
        for(var i = 0; i < number; i++){
            var box = new Physijs.SphereMesh(
                new THREE.SphereGeometry( 10, 32, 32 ),
                new THREE.MeshBasicMaterial({ color: 121212 })
            );
            box.position.x = box.position.x + Math.floor(Math.random() * 100) + 1;
            box.position.y = box.position.y + 200;
            box.position.z = box.position.z + Math.floor(Math.random() * 100) + 1;
            scene.add( box );
        }
    }

    function getHighPoint(geometry, face) {
        var v1 = geometry.vertices[face.a].y;
        var v2 = geometry.vertices[face.b].y;
        var v3 = geometry.vertices[face.c].y;
        return Math.max(v1, v2, v3);
    }

    //------------------------------------------------------
    // Main render loop
    //------------------------------------------------------
    /**
     * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
     * for future renders
     */
    function render() {
        // update the camera
        //var rotSpeed = control.rotationSpeed;
        //camera.position.x = camera.position.x * Math.cos(rotSpeed) + camera.position.z * Math.sin(rotSpeed);
        //camera.position.z = camera.position.z * Math.cos(rotSpeed) - camera.position.x * Math.sin(rotSpeed);
        //camera.lookAt(scene.position);       
        
        // and render the scene
        renderer.render(scene, camera);
        // render using requestAnimationFrame
        requestAnimationFrame(render);

         // update stats
        stats.update();
        scene.simulate();
        cameraControl.update();
    }

    //------------------------------------------------------
    // Some generic helper functions
    //------------------------------------------------------
    /**
     * Create the control object, based on the supplied configuration
     *
     * @param controlObject the configuration for this control
     */
    function addControlGui(controlObject) {
        var gui = new dat.GUI();
        gui.add(controlObject,'toFaceMaterial');
        gui.add(controlObject,'toNormalMaterial');
        gui.add(controlObject,'smoothShading').onChange(controlObject.onSmoothShadingChange);
    }

    /**
     * Add the stats object to the top left border
     */
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild( stats.domElement );
    }

    /**
     * Function handles the resize event. This make sure the camera and the renderer
     * are updated at the correct moment.
     */
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //------------------------------------------------------
    // Init the scene and register the resize handler
    //------------------------------------------------------
    // calls the init function when the window is done loading.
    window.onload = init;
    // calls the handleResize function when the window is resized
    window.addEventListener('resize', handleResize, false);