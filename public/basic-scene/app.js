 // global variables
    var renderer;
    var scene;
    var camera;
    var cube;
    var plane;
    var control;
    var stats;

    /**
     * Initializes the scene, camera and objects. Called when the window is
     * loaded by using window.onload (see below)
     */
    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;

        // position and point the camera to the center of the scene
        camera.position.x = 15;
        camera.position.y = 16;
        camera.position.z = 13;
        camera.lookAt(scene.position);

        // add controls
        cameraControl = new THREE.OrbitControls(camera);

        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(20, 20);
        //var planeMateriel = new THREE.MeshLambertMaterial({color: 0xcccccc});
        var planeTexture = THREE.ImageUtils.loadTexture("./textures/ground/grasslight-big.jpg");
        var planeMaterial = new THREE.MeshBasicMaterial({map: planeTexture});
        
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;

        // rotate and position the plane
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = 0;
        plane.position.y = -2;
        plane.position.z = 0;

        // add the plane to the scene
        scene.add(plane);

        // create a cube
        var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
        //var cubeMaterial = new THREE.MeshLambertMaterial({color: 'red', transparent: true, opacity: 0.7});   
        var cubeTexture = THREE.ImageUtils.loadTexture("./textures/minecraft/creeper.jpeg");
        var cubeMaterial = new THREE.MeshBasicMaterial({map: cubeTexture});    
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;

        // add the cube to the scene
        scene.add(cube);

        // add spotlight for shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(10, 20, 20);
        spotLight.shadowCameraNear = 20;
        spotLight.shadowCameraFar = 50;
        spotLight.castShadow = true;

        scene.add(spotLight);

        // setup the control object for the control gui
        control = new function(){
            this.rotationSpeed = 0.005;
            this.opacity = 0.6;
            this.color = cubeMaterial.color.getHex();
        }

        function addControlGui(controlObject){
            var gui = new dat.GUI();
            gui.add(controlObject, 'rotationSpeed', -0.01, 0.01);
            gui.add(controlObject, 'opacity', 0.1, 1);
            gui.addColor(controlObject, 'color');
        }

        function addStatsObject(){
            stats = new Stats();
            stats.setMode(0);
            stats.domElement.style.position = 'fixed';
            stats.domElement.style.left = '0px';
            stats.domElement.style.rigth = '0px';

            document.body.appendChild(stats.domElement)
        }

        addControlGui(control);
        addStatsObject();

        // add the output of the renderer to the html element
        document.body.appendChild(renderer.domElement);

        // call the render function, after the first render, interval is determined
        // by requestAnimationFrame
        render();
    }

    /**
     * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
     * for future renders
     */
    function render() {
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        renderer.render(scene, camera);

        var rotSpeed = control.rotationSpeed;
        camera.position.x = camera.position.x * Math.cos(rotSpeed)
        + camera.position.z * Math.sin(rotSpeed);

        camera.position.z = camera.position.z * Math.cos(rotSpeed)
        - camera.position.x * Math.sin(rotSpeed);
        camera.lookAt(scene.position);

        // change opacity
        cube.material.opacity = control.opacity;
        cube.material.color = new THREE.Color(control.color);
        
        stats.update();
        cameraControl.update();
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

    // calls the init function when the window is done loading.
    window.onload = init;
    // calls the handleResize function when the window is resized
    window.addEventListener('resize', handleResize, false);
