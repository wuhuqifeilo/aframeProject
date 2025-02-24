let scene, cam, robot, posSaveMachine, bluePortalshot, orangePortalShot, machineClicked;
let currentBluePortal = null;
let currentOrangePortal = null;
let collisionCooldown = false;

let lastTeleportTime = 0;
let cd = 2100; 


window.onload = function(){
  scene = document.querySelector("a-scene");
  cam   = document.getElementById("camera");
  bluePortalshot = document.getElementById("bluePortalShot");
  orangePortalshot = document.getElementById("orangePortalShot");
  machineClicked = document.getElementById("machineClicked");
	
  scene.addEventListener("loaded", () => {
    console.log("robot loaded");
    robot = new Robot(-1, 8, 65, cam); 
	posSaveMachine1 = new posSave(40, 0.25, -65);
	posSaveMachine2 = new posSave(70, 8, 95);
  });



  window.addEventListener("keydown", (e)=>{
  
  
    if(e.key === "v"){
      if(currentBluePortal){
        currentBluePortal.removeFromScene();
        currentBluePortal = null;
      }
      currentBluePortal = new Portal("blue");
      let fireBlue = document.getElementById("audioBlue");
      fireBlue.components.sound.playSound();
    }
    if(e.key === "b"){
      if(currentOrangePortal){
        currentOrangePortal.removeFromScene();
        currentOrangePortal = null;
      }
      currentOrangePortal = new Portal("orange");
      let fireOrange = document.getElementById("audioOrange");
      fireOrange.components.sound.playSound();
    }
	
	if (e.key === "t" && posSaveMachine) {
	  let pos = posSaveMachine.getPosition();
	  if (pos) {
		cam.setAttribute("position", { x: pos.x, y: pos.y, z: pos.z });
		console.log("Teleported to:", pos);
	  }
	}
	
  });

  loop();
}

function updateCooldownDisplay() {
  let cooldownDisplay = document.getElementById("cooldownDisplay");
  let currentTime = Date.now();
  let delta = currentTime - lastTeleportTime; 

  if (delta <= cd) {

    let remainMs = cd - delta;    
    let remainSec = (remainMs / 1000).toFixed(1);

    cooldownDisplay.textContent = `Cooldown: ${remainSec}s`;
  } else {
    cooldownDisplay.textContent = "Teleport Ready";
  }
}

function loop(){
  if(currentBluePortal) {
    currentBluePortal.shoot();
  }
  if(currentOrangePortal) {
    currentOrangePortal.shoot();
  }
  
  updateCooldownDisplay();
  
  let camPos = cam.getAttribute("position");

  teleportCheck(currentBluePortal, currentOrangePortal);
  

  if (robot) {
    robot.chase();
  }else {
    console.warn("Robot is not initialized yet.");
  }
  if(posSaveMachine1 && posSaveMachine2){
	console.log("Machine 1:", posSaveMachine1);
    console.log("Machine 2:", posSaveMachine2);
  }

  
  requestAnimationFrame(loop);
}

function teleportCheck(portal1, portal2){
  if(!portal1 || !portal2) return;      
  if(portal1.moving || portal2.moving) return; 
  let transition = document.getElementById("transition");

  let now = Date.now();
  if(now - lastTeleportTime < cd) return;
  

	if (distance(portal1.obj, cam) < 2){
	  transition.setAttribute("material", "opacity: 1");
	  console.log("Teleport to Orange"); 
	  let p2p = portal2.obj.object3D.position;
	  cam.setAttribute("wasd-controls", "enabled: false");
	  cam.setAttribute("position", {x:p2p.x, y:p2p.y, z:p2p.z});
	  lastTeleportTime = now;
	  setTimeout(()=>{
	  transition.setAttribute("material", "opacity: 0");
	  cam.setAttribute("wasd-controls", "enabled: true");
	  },200);
	  
	  let teleSound = document.getElementById("audioTeleport");
	  teleSound.components.sound.playSound();
	}
	
	if (distance(portal2.obj, cam) < 2) {
	  transition.setAttribute("material", "opacity: 1");
	  console.log("Teleport to Blue");
	  let p1p = portal1.obj.object3D.position;
	  cam.setAttribute("wasd-controls", "enabled: false");
	  cam.setAttribute("position", {x:p1p.x, y:p1p.y, z:p1p.z});
	  lastTeleportTime = now;
	  setTimeout(()=>{
	  transition.setAttribute("material", "opacity: 0");
	  cam.setAttribute("wasd-controls", "enabled: true");
	  },200);	

	  
	  let teleSound = document.getElementById("audioTeleport");
	  teleSound.components.sound.playSound();
	}
	
	
	
}


function distance(obj1, obj2) {
  let p1 = new THREE.Vector3();
  let p2 = new THREE.Vector3();
  obj1.object3D.getWorldPosition(p1);
  obj2.object3D.getWorldPosition(p2);
  return p1.distanceTo(p2);
}

