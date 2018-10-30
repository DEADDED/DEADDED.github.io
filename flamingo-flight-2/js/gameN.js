var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

if (isMobile.any()) {

document.getElementById('world').setAttribute('style', 'opacity: 1');
document.getElementById('rotate').setAttribute('style', 'opacity: 0');
document.getElementById('qrCode').setAttribute('style', 'opacity: 0');
//document.getElementById("rotate").setAttribute("opacity","0");
//document.getElementById("world").setAttribute("style","opacity: 1");
var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container,  mixer;
var flamingo;
var fPos;
var HEIGHT, WIDTH;
var updateOrNot = true;
var  hemisphereLight, shadowLight;
var ground;
var score = 0;
var globalRot = 0.785;
var rotUpdate = 0.008;
var flaPos = new THREE.Vector3();
var row;
var cloudRows = [];
var cloudRowsCount = 8;
var cloudPosDelta = 85;
var cloudRowGlobalPosition = new THREE.Vector3();
var cloudGlobalPosition = new THREE.Vector3();
var sideClouds;
var sideCloudsCount = 12;
var minCloudBlocksCount = 5;
var maxCLoudBlocksCount = 8;
var angle = 2 * Math.PI / sideCloudsCount;
var clock = new THREE.Clock(false);
clock.start();
var delta = clock.getDelta();
var againButton;
//loader for flamingo bird
var loader = new THREE.JSONLoader();

//This function initialises our scene
function init(event){

    //event handler for controlling a character using an accelerometer
    window.addEventListener('devicemotion', handleOrientation);

    createScene();
    createLights();
    createGround();
    createSideClouds();


    //first initialising of each cloud row
    for(var i = 0; i < cloudRowsCount; i++){
    cloudRows[i] = new cloudRow();
    
    cloudRows[i].addClouds();
    cloudRows[i].rot = globalRot * i;
    
    scene.add(cloudRows[i].mesh);
    }

    //flamingo loading
    loader.load( 'js/flamingo.js', function( geometry ) {
    var material = new THREE.MeshPhongMaterial( { 
            morphTargets: true, 
            vertexColors: THREE.FaceColors 
        } );
        
    flamingo = new THREE.Mesh(geometry, material);
    
    flamingo.position.x = 0;
    flamingo.position.y = 930;
    flamingo.position.z = 480;
    flamingo.scale.set(.3,.3,.3);
    flamingo.rotateY(Math.PI);
    scene.add(flamingo);

    //animation mixer for animation handling
    mixer = new THREE.AnimationMixer(flamingo);
    mixer.clipAction(geometry.animations[0]).setDuration(1).play();} );	 


    //div element for score displaying
    scoreText = document.createElement('div');
    scoreText.style.position = 'absolute';

    scoreText.style.width = 150;
    scoreText.style.height = 100;
    scoreText.innerHTML = "Flight time is 0 seconds";
    scoreText.style.top = 50 + 'px';
    scoreText.style.left = 50 + 'px';
    document.body.appendChild(scoreText);

    againButton = document.createElement('button');
    againButton.style.opacity = 0;
    againButton.textContent = 'Play again!';
    againButton.style.position = 'absolute';
    
    againButton.onclick = function(){
        againButton.style.opacity = 0;
        score = 0;
        scoreText.innerHTML = "Flight time is " + 0 + " seconds.";
        rotUpdate = 0.008;
        clock = new THREE.Clock(false);
        clock.start();
        flamingo.visible = true;
        flamingo.position.x = 0;
    
    }
    document.body.appendChild(againButton);

    loop();
}

function createScene() {

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    scene = new THREE.Scene();
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
    scene.fog = new THREE.Fog(0x9290a6, 100,950);
    camera.position.x = 0;
    camera.position.y = 950;
    camera.position.z = 600;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function createLights() {

    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0xffffff, .9)
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(hemisphereLight);
    scene.add(shadowLight);
}

function createGround(){
    ground = new Ground();

    ground.mesh.position.x = 0;
    ground.mesh.position.y = 0;
    ground.mesh.position.z = 0;

    scene.add(ground.mesh);
}

function createSideClouds(){
    sideClouds = new SideClouds();
    scene.add(sideClouds.mesh);
}

//Function for updating each object in a scene
function loop(){


    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;	

    requestAnimationFrame(loop);                                      //update an animation before the next repaint
  
    if(flamingo){
        if(WIDTH < HEIGHT){
            if(clock.running)
                clock.stop();
            
            container.setAttribute('style', 'opacity: 0');
            document.getElementById('rotate').setAttribute('style', 'opacity: 1');
            return;
        }
        else{
            if(clock.running == false && flamingo.visible){
                clock.start();
                container.setAttribute('style', 'opacity: 1');
                document.getElementById('rotate').setAttribute('style', 'opacity: 0');
            }

            updateFlamingo();                                                 //flamingo behavior	

            delta = clock.getDelta();

            mixer.update(delta);                                              //update animation every 'delta' seconds

            ground.moveWaves();
            ground.mesh.rotation.x += 0.005;
                
            sideClouds.mesh.rotation.x += 0.007;

            //clouds rotaion and collision detection
            for(var i = 0; i < cloudRowsCount; i++)
            {
                //if any clouds in a row
                if(cloudRows[i].clouds.length > 0){
                    cloudRows[i].mesh.getWorldPosition(cloudRowGlobalPosition);                                     //'cloudRowGlobalPosition' holds global position of each row of clouds
                    for(var j = 0; j < cloudRows[i].clouds.length; j++){                                           //cheking collision for every cloud
                        flaPos = flaPos.setFromMatrixPosition( flamingo.matrixWorld );

                        cloudRows[i].clouds[j].mesh.getWorldPosition(cloudGlobalPosition);                          //'cloudGlobalPosition' holds global position of each cloud
                
                            //collision detection
                        if(flaPos.distanceTo(cloudGlobalPosition) < 20                                              
                            && cloudRowGlobalPosition.y > 150                                                       //this line removes the bug of collision with newly created clouds 
                            && flamingo.visible === true){

                            flamingo.visible = false;
                            clock.stop();
                            againButton.style.opacity = 1; 
                        }	
                    }
                }
                
                cloudRows[i].mesh.rotation.x += 0.009;
                
                cloudRows[i].rot += rotUpdate;

            //removes a cloud row every lap and makes new one to change a position of obstacles
                if(cloudRows[i].rot >= 6.18)
                {
                cloudRows[i].removeRow();
                cloudRows[i] = new cloudRow();
            
                cloudRows[i].addClouds();
                    
                cloudRows[i].rot = 0;
                scene.add(cloudRows[i].mesh);
                    
                }

            //circular motion of clouds
                cloudRows[i].mesh.position.z = cloudH * Math.cos(cloudRows[i].rot);
                cloudRows[i].mesh.position.y = -cloudH * Math.sin(cloudRows[i].rot);

            }

            //updates the score
            if(Math.floor(clock.elapsedTime) > score || score > clock.elapsedTime){
                if(Math.floor(clock.elapsedTime) > score)
                    score = Math.floor(clock.elapsedTime);
                if(score > Math.floor(clock.elapsedTime))
                    score += score.Math.floor(clock.elapsedTime);
                scoreText.innerHTML = "Flight time is " + score + " seconds.";
            }
        
            if(score % 4 === 0){
                rotUpdate+=0.00001;
            }

            renderer.render(scene, camera);                                               //scene rendering
        }
    }
}

//updates the position of flamingo and keeps it in [-100; 100]
function updateFlamingo(){
if(flamingo){
  
  flamingo.position.x += fPos;

    if(flamingo.position.x > 100)
      flamingo.position.x = 100;
    else if(flamingo.position.x < -100)
      flamingo.position.x = -100;

  }
}

//getting data from the accelerometer
function handleOrientation(event){
    fPos = event.accelerationIncludingGravity.y;
}

//invokes 'init' function when window is loaded
window.addEventListener('load', init, false);
}
else{
    //document.getElementById('world').setAttribute('style', 'opacity: 0');
    document.getElementById('rotate').setAttribute('style', 'opacity: 0');
    document.getElementById('qrCode').setAttribute('style', 'opacity: 1');
}
