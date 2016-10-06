// global variables
var renderer;
var scene;
var camera;
var object;

function init() {
    scene = new THREE.Scene();
    scenebg = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 15;
    camera.position.y = 16;
    camera.position.z = 13;
    camera.lookAt(scene.position);

    cameraControl = new THREE.OrbitControls(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap; 

    var light = new THREE.AmbientLight( 0x404040 );
    scene.add(light);     

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

    var geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var object = new THREE.Mesh( geometry, material );
    scene.add(object);

    control = new function(){
        this.rotationSpeed = 0.000;
        this.opacity = 0.6;
        this.color = material.color.getHex();
    }

    addControlGui(control);
    addStatsObject();
    document.body.appendChild(renderer.domElement);
    render();

}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera); 
    stats.update();
    cameraControl.update();      
}

 function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = init;
window.addEventListener('resize', handleResize, false);

function create3DTerrain(width, depth, spacingX, spacingY, height){
    var geometry = new THREE.Geometry();
    for(var z = 0; z < depth; z++){
        for(var x = 0; x < width; x++){
            var vertex = new THREE.Vector3(x*spacingX, 
                Math.random()*height, z*spacingZ);
            geometry.vertices.push(vertex);
        }
    }

    

    var face = new THREE.Face3(a, b, c);
    face.color = new THREE.Color(0x262626);

    geometry.faces.push(face);

    var mat = new THREE.MeshPhongMaterial();
    var groundMesh = new THREE.Mesh(geometry, mat);
    scene.ad(groundMesh);
}