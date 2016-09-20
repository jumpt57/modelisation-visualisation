 // global variables
    var renderer;
    var scene;
    var scenebg;
    var camera;
    var camerabg;

    var earth;
    var clouds;
    var moon;
       
    var control;
    var stats;

    var EarthGroup;

    var r = 25;
    var theta = 0;
    var dTheta = 2 * Math.PI / 5000;

    /**
     * Initializes the scene, camera and objects. Called when the window is
     * loaded by using window.onload (see below)
     */
    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        scenebg = new THREE.Scene();

        //EarthGroup = new THREE.Object3D();
        //scene.add(EarthGroup);

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        camera.position.x = 15;
        camera.position.y = 16;
        camera.position.z = 13;
        camera.lookAt(scene.position);
        // add controls
        cameraControl = new THREE.OrbitControls(camera);

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;     

        camerabg = new THREE.OrthographicCamera(-window.innerWidth,window.innerWidth, window.innerHeight,
            -window.innerHeight, -10000,  10000);
        camerabg.position.z = 50;
        scenebg.add(camerabg);

        var materialColor = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(
                "./textures/starry-deep-outer-space-galaxy.jpg"),
            depthTest: false            
        })
        var bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        materialColor);
        bgPlane.position.z = -100;
        bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
        scenebg.add(bgPlane);

        var bgPass = new THREE.RenderPass(scenebg, camerabg);
        var renderPass = new THREE.RenderPass(scene, camera);
        renderPass.clear = false;
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(bgPass);
        composer.addPass(renderPass);
        composer.addPass(effectCopy);
         

        // create a earth
        var earthGeometry = new THREE.SphereGeometry(5, 32, 32);        
        var earthTexture = THREE.ImageUtils.loadTexture("./textures/planets/earthmap4k.jpg");
        var normalMap = THREE.ImageUtils.loadTexture("./textures/planets/earth_normalmap_flat4k.jpg");
        var specularMap = THREE.ImageUtils.loadTexture("./textures/planets/earthspec4k.jpg");
        var bumpMap = THREE.ImageUtils.loadTexture("./textures/planets/earthbump4k.jpg");
        
        var earthMaterial = new THREE.MeshPhongMaterial({map: earthTexture});    
        earthMaterial.normalMap = normalMap;   
        earthMaterial.specularMap = specularMap;
        earthMaterial.specular = new THREE.Color("#0x3399FF");
        earthMaterial.bumpMap = bumpMap;
        earthMaterial.shininess = 5;
        earth = new THREE.Mesh( earthGeometry, earthMaterial );
        earth.castShadow = false;
        earth.receiveShadow = true;
        scene.add(earth);

        // create clouds
        var cloudsGeometry = new THREE.SphereGeometry( 5.1, 32, 32 );
        var cloudsTexture = THREE.ImageUtils.loadTexture("./textures/planets/fair_clouds_4k.png");
        var cloudsMaterial = new THREE.MeshPhongMaterial({map: cloudsTexture, transparent: true, opacity: 1.0});       
        clouds = new THREE.Mesh( cloudsGeometry, cloudsMaterial );
        clouds.castShadow = true;
        clouds.receiveShadow = true;
        scene.add( clouds );

        // create moon
        var moonGeometry = new THREE.SphereGeometry( 1, 32, 32 );
        var moonTexture = THREE.ImageUtils.loadTexture("./textures/planets/moonmap4k.jpg");
        var moonMaterial = new THREE.MeshPhongMaterial({map: moonTexture, transparent: true, opacity: 1});       
        moon = new THREE.Mesh( moonGeometry, moonMaterial );
        moon.position.x = earth.position.x + 11;
        moon.castShadow = true;
        moon.receiveShadow = true;
        scene.add( moon );
       
        // add directionnal lights
        var directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.set(500,10,10);
        directionalLight.name='directonal';
        directionalLight.castShadow = true;
        directionalLight.shadowCameraVisible = false;
        directionalLight.shadowMapHeight = directionalLight.shadowMapWidth = 4096;
        directionalLight.shadowCameraLeft = -6;
        directionalLight.shadowCameraRight = 6;
        directionalLight.shadowCameraBottom = -6;
        directionalLight.shadowCameraTop = 6;
        scene.add(directionalLight);

        var ambientLight = new THREE.AmbientLight(0x111111);
        ambientLight.name='ambient';
        scene.add(ambientLight);

        // setup the control object for the control gui
        control = new function(){
            this.rotationSpeed = 0.000;
            this.opacity = 0.6;
            this.color = earthMaterial.color.getHex();
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
        renderer.autoClear = false;
        composer.render();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
        Action();       
    }

    function Action(){
        var rotSpeed = control.rotationSpeed;
        camera.position.x = camera.position.x * Math.cos(rotSpeed)
        + camera.position.z * Math.sin(rotSpeed);

        camera.position.z = camera.position.z * Math.cos(rotSpeed)
        - camera.position.x * Math.sin(rotSpeed);
        camera.lookAt(scene.position);

        // change opacity
        earth.material.opacity = control.opacity;
        earth.material.color = new THREE.Color(control.color);

        clouds.rotation.x += 0.0005;
        earth.rotation.y += 0.0005;       
        moon.rotation.z += 0.001;

        theta += dTheta;
	    moon.position.x = r * Math.cos(theta);
	    moon.position.z = r * Math.sin(theta);
        
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
