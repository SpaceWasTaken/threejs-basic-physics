import * as THREE from 'three';
import './main.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';

// _____________________________Vars______________________________ //

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.8, 0),
});
const timeStep = 1/60;

// _______________________________________________________________ //

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 40
scene.add(camera);

const canvas = document.querySelector('.webgl');

const render = new THREE.WebGLRenderer({canvas});
render.setSize( sizes.width, sizes.height );
render.setPixelRatio(2);

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
controls.autoRotateSpeed = 4

// document.body.appendChild( render.domElement );

// _________________________obj elements__________________________ //
// sphere
const geometry = new THREE.SphereGeometry( 2, 32, 16 ); 
const material = new THREE.MeshStandardMaterial( {
    color: 0x00ff00,
    wireframe: true,
} );
const sphere1 = new THREE.Mesh(geometry, material);
scene.add(sphere1);

// sphere2
const geometry2 = new THREE.SphereGeometry( 2, 32, 16 ); 
const material2 = new THREE.MeshStandardMaterial( {
    color: 0x00ff00,
    wireframe: true,
} );
const sphere2 = new THREE.Mesh(geometry2, material2);
scene.add(sphere2);

// ground
const ground_geo = new THREE.PlaneGeometry(30, 30)
const ground_mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true,
})
const ground = new THREE.Mesh(ground_geo, ground_mat)
scene.add(ground);

// ______________________obj elements Cannon______________________ //

// sphere
const sphere_phy_mat1 = new CANNON.Material()
const sphere_body = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(2),
    position: new CANNON.Vec3(1.1, 20, 0),
    material: sphere_phy_mat1,
})
sphere_body.linearDamping = 0.3
sphere_body.angularVelocity.set(0, 10, 0);
sphere_body.angularDamping = 0.4
world.addBody(sphere_body);

// sphere2
const sphere_phy_mat2 = new CANNON.Material()
const sphere_body2 = new CANNON.Body({
    mass: 3,
    shape: new CANNON.Sphere(2),
    position: new CANNON.Vec3(1, 10, 0),
    material: sphere_phy_mat2,
})
sphere_body2.linearDamping = 0.3
world.addBody(sphere_body2);

// ground
const ground_phy_mat = new CANNON.Material();
const ground_body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.01)),
    type: CANNON.Body.STATIC,
    material: ground_phy_mat,
})
world.addBody(ground_body)
ground_body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

// _______________________collision material_____________________ //

const ground_sphere_contact = new CANNON.ContactMaterial(
    sphere_phy_mat1, 
    sphere_phy_mat2,
    {
        friction: 0,
        restitution: 0.9
    }
);

world.addContactMaterial(ground_sphere_contact);

// _______________________________________________________________ //

function animate(){
    controls.update()

    ground.position.copy(ground_body.position);
    ground.quaternion.copy(ground_body.quaternion);

    sphere1.position.copy(sphere_body.position);
    sphere1.quaternion.copy(sphere_body.quaternion);

    sphere2.position.copy(sphere_body2.position);
    sphere2.quaternion.copy(sphere_body2.quaternion);


    world.step(timeStep);

    render.render( scene, camera );
}

render.setAnimationLoop(animate);

// ___________________________resize_____________________________ //

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth, 
    sizes.height = window.innerHeight

    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    render.setSize(sizes.width, sizes.height);
})


